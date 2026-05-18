use base64::{engine::general_purpose::STANDARD, Engine};
use clipboard::ClipboardProvider;
use std::path::Path;

pub struct UtilService {}

impl UtilService {
    pub fn new() -> Self {
        Self {}
    }
    pub fn copy_to_clipboard(&self, text: &str) -> Result<(), String> {
        if let Ok(mut ctx) = clipboard::ClipboardContext::new() {
            ctx.set_contents(text.to_string())
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn read_image_file_as_data_url(&self, path: &str) -> Result<String, String> {
        let path = Path::new(path);
        if !path.is_file() {
            return Err(format!("File not found: {}", path.display()));
        }

        let mime = path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.to_ascii_lowercase())
            .and_then(|ext| match ext.as_str() {
                "jpg" | "jpeg" => Some("image/jpeg"),
                "png" => Some("image/png"),
                "gif" => Some("image/gif"),
                "webp" => Some("image/webp"),
                _ => None,
            })
            .ok_or_else(|| "Unsupported image format".to_string())?;

        let bytes = std::fs::read(path).map_err(|e| e.to_string())?;
        let encoded = STANDARD.encode(bytes);
        Ok(format!("data:{mime};base64,{encoded}"))
    }
}
