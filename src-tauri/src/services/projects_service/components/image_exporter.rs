use std::collections::HashSet;
use std::{
    fs,
    path::{Component, Path, PathBuf},
};

use crate::services::projects_service::models::ImageEvaluation;

#[derive(Default)]
pub struct ImageExporterComponent {}

impl ImageExporterComponent {
    /// Exports the evaluated images with their new filename suffixes
    ///
    /// Return a list of any errors that were encountered during export
    pub fn export_evaluated_images(
        &self,
        evaluations: Vec<ImageEvaluation>,
        output_dir_path: &str,
        mode: Option<&str>,
    ) -> Result<Vec<String>, std::io::Error> {
        let out_dir = Path::new(output_dir_path);
        fs::create_dir_all(out_dir)?;
        let mut errors = Vec::new();
        let mut used_paths: HashSet<PathBuf> = HashSet::new();

        const UNKNOWN_SUFFIX: &str = "";
        let preserve_folders = mode
            .map(|m| m.eq_ignore_ascii_case("folders"))
            .unwrap_or(false);

        for eval in evaluations.iter() {
            if let Some(ref res) = eval.result {
                let original_path = Path::new(&res.original_image_path);
                let suffix = res
                    .new_suggested_filepath_suffix
                    .as_deref()
                    .unwrap_or(UNKNOWN_SUFFIX);
                let stem = original_path
                    .file_stem()
                    .map(|s| s.to_string_lossy().to_string())
                    .unwrap_or_default();
                let ext = original_path
                    .extension()
                    .map(|e| e.to_string_lossy().to_string());
                let base_without_ext = format!("{}{}", stem, suffix);
                let base_name = match &ext {
                    Some(e) => format!("{}.{}", base_without_ext, e),
                    None => base_without_ext.clone(),
                };

                let destination_dir = if preserve_folders {
                    Self::destination_dir_for_eval(out_dir, &eval.image_name)
                } else {
                    out_dir.to_path_buf()
                };
                fs::create_dir_all(&destination_dir)?;

                let mut candidate = base_name.clone();
                let mut counter = 2u32;
                let mut candidate_path = destination_dir.join(&candidate);
                while used_paths.contains(&candidate_path) || candidate_path.exists() {
                    candidate = match &ext {
                        Some(e) => format!("{}_{}.{}", base_without_ext, counter, e),
                        None => format!("{}_{}", base_without_ext, counter),
                    };
                    candidate_path = destination_dir.join(&candidate);
                    counter += 1;
                }
                used_paths.insert(candidate_path.clone());
                if let Err(e) = fs::copy(original_path, candidate_path) {
                    log::error!("Error exporting evaluated image: {e}");
                    errors.push(e.to_string());
                }
            }
        }

        Ok(errors)
    }

    fn destination_dir_for_eval(out_dir: &Path, image_name: &str) -> PathBuf {
        let image_path = Path::new(image_name);
        let Some(parent) = image_path.parent() else {
            return out_dir.to_path_buf();
        };
        if parent.as_os_str().is_empty() {
            return out_dir.to_path_buf();
        }
        let mut safe_relative = PathBuf::new();
        for component in parent.components() {
            if let Component::Normal(part) = component {
                safe_relative.push(part);
            }
        }
        if safe_relative.as_os_str().is_empty() {
            out_dir.to_path_buf()
        } else {
            out_dir.join(safe_relative)
        }
    }
}
