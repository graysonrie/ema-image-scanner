use std::{
    collections::HashMap, fs, fs::File, io::BufReader, io::Cursor, path::PathBuf, sync::Arc,
};

use base64::{engine::general_purpose::STANDARD, Engine};
use fast_image_resize::{images::Image, ResizeAlg, ResizeOptions, Resizer};
use futures::future::join_all;
use image::{codecs::jpeg::JpegEncoder, DynamicImage, GenericImageView, ImageFormat, ImageReader};
use tokio::sync::{RwLock, Semaphore};
use turbojpeg::Decompressor;

use crate::services::{app_save_service::AppSaveService, projects_service::models::*};

/// Max dimension for preview thumbnails
const PREVIEW_MAX_SIZE: u32 = 200;
/// Max number of images decoded concurrently to avoid OOM
const MAX_CONCURRENT_PREVIEWS: usize = 4;
/// Cache key format: "project_name/image_name"
pub type ImageCacheKey = String;
pub struct ImageLoaderComponent {
    app_save: Arc<AppSaveService>,
    /// Cache for full resolution images
    full_image_cache: RwLock<HashMap<ImageCacheKey, FullImageModel>>,
    /// Cache for image previews
    preview_cache: RwLock<HashMap<ImageCacheKey, ImagePreviewModel>>,
    /// Limits how many images are decoded in parallel
    preview_semaphore: Arc<Semaphore>,
}

impl ImageLoaderComponent {
    pub fn new(app_save: Arc<AppSaveService>) -> Self {
        Self {
            app_save,
            full_image_cache: RwLock::new(HashMap::new()),
            preview_cache: RwLock::new(HashMap::new()),
            preview_semaphore: Arc::new(Semaphore::new(MAX_CONCURRENT_PREVIEWS)),
        }
    }

    fn cache_key(project_name: &str, image_name: &str) -> ImageCacheKey {
        format!("{project_name}/{image_name}")
    }

    /// Deletes images from a project
    pub async fn delete_images_from_project(
        &self,
        project_name: &str,
        image_names: Vec<String>,
    ) -> Result<(), String> {
        for image_name in &image_names {
            let image_path = format!("projects/{project_name}/images/{image_name}");
            self.app_save.delete_file(&image_path)?;

            // Remove from caches
            let key = Self::cache_key(project_name, image_name);
            {
                let mut cache = self.preview_cache.write().await;
                cache.remove(&key);
            }
            {
                let mut cache = self.full_image_cache.write().await;
                cache.remove(&key);
            }
        }

        Ok(())
    }

    pub async fn import_images_to_project(
        &self,
        project_name: &str,
        image_paths: Vec<String>,
        folder: Option<String>,
    ) -> Result<(), String> {
        let folder_prefix = folder
            .as_deref()
            .filter(|f| !f.is_empty())
            .map(|f| format!("{f}/"))
            .unwrap_or_default();

        for image_path in image_paths {
            let source_path = std::path::Path::new(&image_path);
            let file_name = source_path
                .file_name()
                .ok_or_else(|| format!("Invalid file path: {image_path}"))?
                .to_string_lossy();
            let new_image_path =
                format!("projects/{project_name}/images/{folder_prefix}{file_name}");
            self.app_save.copy_file(&image_path, &new_image_path)?;
        }

        // Clear preview cache for this project to ensure new images are loaded
        self.clear_project_cache(project_name).await;

        Ok(())
    }

    /// Clears cached image data for a specific project
    async fn clear_project_cache(&self, project_name: &str) {
        let prefix = format!("{project_name}/");

        {
            let mut cache = self.preview_cache.write().await;
            cache.retain(|k, _| !k.starts_with(&prefix));
        }

        {
            let mut cache = self.full_image_cache.write().await;
            cache.retain(|k, _| !k.starts_with(&prefix));
        }
    }

    /// Collects all image files from a directory and one level of subdirectories.
    /// Returns `(full_path, relative_name)` where relative_name is e.g. `"file.jpg"` or `"folder/file.jpg"`.
    fn collect_image_files(base_items: Vec<PathBuf>) -> Vec<(PathBuf, String)> {
        let mut result = Vec::new();
        for item in base_items {
            if item.is_file() {
                let name = item
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                result.push((item, name));
            } else if item.is_dir() {
                let folder_name = match item.file_name() {
                    Some(n) => n.to_string_lossy().to_string(),
                    None => continue,
                };
                if let Ok(entries) = fs::read_dir(&item) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_file() {
                            let file_name = path
                                .file_name()
                                .map(|n| n.to_string_lossy().to_string())
                                .unwrap_or_default();
                            let rel_name = format!("{folder_name}/{file_name}");
                            result.push((path, rel_name));
                        }
                    }
                }
            }
        }
        result
    }

    /// Returns image previews (thumbnails) for all images in a project
    /// Uses caching and parallel processing for better performance
    pub async fn get_image_previews_in_project(
        &self,
        project_name: &str,
    ) -> Result<Vec<ImagePreviewModel>, String> {
        let images_path = format!("projects/{project_name}/images");
        let image_paths = self.app_save.get_items_in_folder(&images_path)?;

        // Collect files from root and one level of subdirectories
        let file_entries = Self::collect_image_files(image_paths);

        // Check cache for existing previews
        let cache = self.preview_cache.read().await;
        let mut cached_previews = Vec::new();
        let mut uncached_paths = Vec::new();

        for (path, image_name) in file_entries {
            let key = Self::cache_key(project_name, &image_name);
            if let Some(preview) = cache.get(&key) {
                cached_previews.push(preview.clone());
            } else {
                uncached_paths.push((path, image_name));
            }
        }
        drop(cache);

        // Process uncached images in parallel, throttled by a semaphore
        // to avoid OOM when importing many images at once
        let project_name_owned = project_name.to_string();
        let semaphore = Arc::clone(&self.preview_semaphore);
        let tasks: Vec<_> = uncached_paths
            .into_iter()
            .map(|(path, image_name)| {
                let project_name = project_name_owned.clone();
                let sem = Arc::clone(&semaphore);
                async move {
                    let _permit = sem.acquire().await.map_err(|e| e.to_string())?;
                    Self::generate_preview_async(path, image_name, project_name).await
                }
            })
            .collect();

        let results = join_all(tasks).await;

        // Collect new previews and update cache
        let mut new_previews = Vec::new();
        for result in results {
            match result {
                Ok((preview, key)) => {
                    new_previews.push((preview, key));
                }
                Err(e) => {
                    log::warn!("Failed to generate preview: {e}");
                }
            }
        }

        // Update cache with new previews
        if !new_previews.is_empty() {
            let mut cache = self.preview_cache.write().await;
            for (preview, key) in &new_previews {
                cache.insert(key.clone(), preview.clone());
            }
        }

        // Combine cached and new previews
        let mut all_previews = cached_previews;
        all_previews.extend(new_previews.into_iter().map(|(p, _)| p));

        Ok(all_previews)
    }

    /// Generate a preview asynchronously (for parallel processing)
    async fn generate_preview_async(
        path: PathBuf,
        image_name: String,
        project_name: String,
    ) -> Result<(ImagePreviewModel, ImageCacheKey), String> {
        let path_clone = path.clone();
        let preview = tokio::task::spawn_blocking(move || Self::generate_preview(&path_clone))
            .await
            .map_err(|e| e.to_string())?
            .map_err(|e| format!("Failed to generate preview for {image_name}: {e}"))?;

        let metadata = tokio::fs::metadata(&path)
            .await
            .map_err(|e| e.to_string())?;

        let key = Self::cache_key(&project_name, &image_name);
        let model = ImagePreviewModel {
            image_name,
            base64_preview: preview.0,
            image_size_bytes: metadata.len(),
            width: preview.1,
            height: preview.2,
        };
        Ok((model, key))
    }

    /// Loads a full resolution image from a project (with caching)
    pub async fn load_image_from_project(
        &self,
        project_name: &str,
        image_name: &str,
    ) -> Result<FullImageModel, String> {
        let key = Self::cache_key(project_name, image_name);

        // Check cache first
        {
            let cache = self.full_image_cache.read().await;
            if let Some(cached) = cache.get(&key) {
                return Ok(cached.clone());
            }
        }

        // Load from disk
        let image_path = format!("projects/{project_name}/images/{image_name}");
        let full_path = self.app_save.get_full_path(&image_path);

        let image_bytes = tokio::fs::read(&full_path)
            .await
            .map_err(|e| format!("Failed to read image: {e}"))?;

        let metadata = tokio::fs::metadata(&full_path)
            .await
            .map_err(|e| e.to_string())?;

        // Get dimensions from header only (much faster than full decode)
        let path_for_dims = full_path.clone();
        let (width, height) = tokio::task::spawn_blocking(move || {
            image::image_dimensions(&path_for_dims).unwrap_or((0, 0))
        })
        .await
        .map_err(|e| e.to_string())?;

        let base64_image = STANDARD.encode(&image_bytes);

        let model = FullImageModel {
            image_name: image_name.to_string(),
            base64_image,
            image_size_bytes: metadata.len(),
            width,
            height,
        };

        // Store in cache
        {
            let mut cache = self.full_image_cache.write().await;
            cache.insert(key, model.clone());
        }

        Ok(model)
    }

    /// Moves images to a different folder (or root) within the project.
    /// `image_names` are current relative paths (e.g. "photo.jpg" or "folder1/photo.jpg").
    /// `target_folder` is the destination folder name, or `None` for root.
    /// Returns the new relative image names.
    pub async fn move_images_in_project(
        &self,
        project_name: &str,
        image_names: Vec<String>,
        target_folder: Option<String>,
    ) -> Result<Vec<String>, String> {
        let images_base = format!("projects/{project_name}/images");
        let target_prefix = target_folder
            .as_deref()
            .filter(|f| !f.is_empty())
            .map(|f| format!("{f}/"))
            .unwrap_or_default();

        let mut new_names = Vec::new();
        for image_name in &image_names {
            // Extract just the filename (strip any existing folder prefix)
            let file_name = std::path::Path::new(image_name)
                .file_name()
                .ok_or_else(|| format!("Invalid image name: {image_name}"))?
                .to_string_lossy()
                .to_string();

            let src_path = self
                .app_save
                .get_full_path(&format!("{images_base}/{image_name}"));
            let new_rel_name = format!("{target_prefix}{file_name}");
            let dst_path = self
                .app_save
                .get_full_path(&format!("{images_base}/{new_rel_name}"));

            // Skip if source and destination are the same
            if src_path == dst_path {
                new_names.push(new_rel_name);
                continue;
            }

            fs::rename(&src_path, &dst_path)
                .map_err(|e| format!("Failed to move {image_name} to {new_rel_name}: {e}"))?;

            new_names.push(new_rel_name);
        }

        // Clear caches since image names changed
        self.clear_project_cache(project_name).await;

        Ok(new_names)
    }

    /// Get ImageFormat from file extension for faster decoding
    fn format_from_extension(path: &std::path::Path) -> Option<ImageFormat> {
        let ext = path.extension()?.to_str()?.to_lowercase();
        match ext.as_str() {
            "jpg" | "jpeg" => Some(ImageFormat::Jpeg),
            "png" => Some(ImageFormat::Png),
            "gif" => Some(ImageFormat::Gif),
            "webp" => Some(ImageFormat::WebP),
            "bmp" => Some(ImageFormat::Bmp),
            "tiff" | "tif" => Some(ImageFormat::Tiff),
            _ => None,
        }
    }

    /// Load JPEG using turbojpeg (SIMD-accelerated, 2-5x faster)
    fn load_jpeg_turbo(path: &std::path::Path) -> Result<DynamicImage, String> {
        let jpeg_data = std::fs::read(path).map_err(|e| e.to_string())?;

        let mut decompressor = Decompressor::new().map_err(|e| e.to_string())?;
        let header = decompressor
            .read_header(&jpeg_data)
            .map_err(|e| e.to_string())?;

        let width = header.width;
        let height = header.height;

        // Pre-allocate buffer for RGBA output (4 bytes per pixel)
        let mut pixels = vec![0u8; width * height * 4];

        // Create output image wrapper
        let output = turbojpeg::Image {
            pixels: pixels.as_mut_slice(),
            width,
            height,
            pitch: width * 4, // Row stride in bytes
            format: turbojpeg::PixelFormat::RGBA,
        };

        // Decompress to RGBA
        decompressor
            .decompress(&jpeg_data, output)
            .map_err(|e| e.to_string())?;

        // Convert to DynamicImage
        let rgba_image = image::RgbaImage::from_raw(width as u32, height as u32, pixels)
            .ok_or("Failed to create image from turbojpeg output")?;

        Ok(DynamicImage::ImageRgba8(rgba_image))
    }

    /// Load image with format hint for faster decoding
    /// Uses turbojpeg for JPEGs, falls back to image crate for others
    fn load_image_fast(path: &std::path::Path) -> Result<DynamicImage, String> {
        // Use turbojpeg for JPEG files (much faster)
        if let Some(format) = Self::format_from_extension(path) {
            if format == ImageFormat::Jpeg {
                // Try turbojpeg first, fall back to image crate if it fails
                if let Ok(img) = Self::load_jpeg_turbo(path) {
                    return Ok(img);
                }
            }
        }

        // For non-JPEG formats, try format hint first, then fall back to auto-detection
        if let Some(format) = Self::format_from_extension(path) {
            let file = File::open(path).map_err(|e| e.to_string())?;
            let reader = BufReader::new(file);
            let mut img_reader = ImageReader::new(reader);
            img_reader.set_format(format);

            // Try with format hint - if it fails, fall back to auto-detection
            if let Ok(img) = img_reader.decode() {
                return Ok(img);
            }
        }

        // Fallback to auto-detection (handles mismatched extensions)
        let file = File::open(path).map_err(|e| e.to_string())?;
        let reader = BufReader::new(file);
        ImageReader::new(reader)
            .with_guessed_format()
            .map_err(|e| e.to_string())?
            .decode()
            .map_err(|e| e.to_string())
    }

    /// Generates a thumbnail preview from an image path using fast_image_resize
    /// Returns (base64_preview, original_width, original_height)
    fn generate_preview(path: &std::path::Path) -> Result<(String, u32, u32), String> {
        // Use format hints for faster decoding
        let img = Self::load_image_fast(path)?;

        let (width, height) = img.dimensions();

        // Calculate thumbnail dimensions maintaining aspect ratio
        let (thumb_width, thumb_height) = if width > height {
            let ratio = PREVIEW_MAX_SIZE as f32 / width as f32;
            (PREVIEW_MAX_SIZE, (height as f32 * ratio) as u32)
        } else {
            let ratio = PREVIEW_MAX_SIZE as f32 / height as f32;
            ((width as f32 * ratio) as u32, PREVIEW_MAX_SIZE)
        };

        // Skip resize if image is already small enough
        let thumbnail = if width <= PREVIEW_MAX_SIZE && height <= PREVIEW_MAX_SIZE {
            img.to_rgba8()
        } else {
            // Use fast_image_resize for SIMD-accelerated resizing
            let src_image = img.to_rgba8();

            let src = Image::from_vec_u8(
                width,
                height,
                src_image.into_raw(),
                fast_image_resize::PixelType::U8x4,
            )
            .map_err(|e| e.to_string())?;

            let mut dst = Image::new(
                thumb_width,
                thumb_height,
                fast_image_resize::PixelType::U8x4,
            );

            let mut resizer = Resizer::new();
            let options = ResizeOptions::new().resize_alg(ResizeAlg::Nearest);
            resizer
                .resize(&src, &mut dst, &options)
                .map_err(|e| e.to_string())?;

            image::RgbaImage::from_raw(thumb_width, thumb_height, dst.into_vec())
                .ok_or("Failed to create thumbnail image")?
        };

        // Encode as JPEG with lower quality for speed
        let mut buffer = Cursor::new(Vec::new());
        let mut encoder = JpegEncoder::new_with_quality(&mut buffer, 70);
        encoder
            .encode_image(&thumbnail)
            .map_err(|e| e.to_string())?;

        let base64_preview = STANDARD.encode(buffer.into_inner());
        Ok((base64_preview, width, height))
    }
}
