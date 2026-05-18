use std::{fs, path::Path, path::PathBuf, sync::Arc};

use ocr_image_thing::ImageEvalClient;

use crate::services::{
    app_save_service::AppSaveService,
    projects_service::{models::ImageEvaluation, requests::RequestImageEvaluation},
};

pub struct ImageEvaluationsComponent {
    app_save: Arc<AppSaveService>,
    client: ImageEvalClient,
}

impl ImageEvaluationsComponent {
    pub fn new(app_save: Arc<AppSaveService>, client:ImageEvalClient) -> Self {
        Self { app_save, client }
    }

    /// Collects all image files from `images/` root and one level of subdirectories.
    /// Returns `(full_path, relative_name)` pairs.
    fn collect_all_images(images_base: &Path) -> Vec<(PathBuf, String)> {
        let mut result = Vec::new();
        let entries = match fs::read_dir(images_base) {
            Ok(e) => e,
            Err(_) => return result,
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                let name = path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                result.push((path, name));
            } else if path.is_dir() {
                let folder_name = match path.file_name() {
                    Some(n) => n.to_string_lossy().to_string(),
                    None => continue,
                };
                if let Ok(sub_entries) = fs::read_dir(&path) {
                    for sub_entry in sub_entries.flatten() {
                        let sub_path = sub_entry.path();
                        if sub_path.is_file() {
                            let file_name = sub_path
                                .file_name()
                                .map(|n| n.to_string_lossy().to_string())
                                .unwrap_or_default();
                            let rel_name = format!("{folder_name}/{file_name}");
                            result.push((sub_path, rel_name));
                        }
                    }
                }
            }
        }
        result
    }

    pub async fn evaluate_images(
        &self,
        project_name: &str,
        request: RequestImageEvaluation,
        custom_prompt: Option<String>,
        temperature: Option<f32>,
    ) -> Result<Vec<ImageEvaluation>, String> {
        self.client.set_api_key(&request.openai_api_key).await;

        // Collect all images from root and subdirectories
        let images_base = self
            .app_save
            .get_full_path(&format!("projects/{project_name}/images"));
        let all_images = Self::collect_all_images(&images_base);

        // Build a map from relative name -> full path, then filter by requested names
        let requested: std::collections::HashSet<&str> =
            request.image_names.iter().map(String::as_str).collect();
        let selected_images: Vec<(String, String)> = all_images
            .into_iter()
            .filter(|(_, rel_name)| requested.contains(rel_name.as_str()))
            .map(|(full_path, rel_name)| (full_path.to_string_lossy().to_string(), rel_name))
            .collect();

        if selected_images.is_empty() {
            return Err(format!(
                "No matching images found in project. Requested: {:?}",
                request.image_names
            ));
        }

        // Build a reverse map: full_path -> relative_name (for result mapping)
        let path_to_rel: std::collections::HashMap<String, String> = selected_images
            .iter()
            .map(|(full_path, rel_name)| (full_path.clone(), rel_name.clone()))
            .collect();

        let full_paths: Vec<String> = selected_images.into_iter().map(|(fp, _)| fp).collect();
        let eval_results = self
            .client
            .evaluate_images(full_paths, custom_prompt, temperature)
            .await;

        let current_evals = self.read_images_eval_json(project_name)?;
        let mut new_evals = Vec::new();

        for result in eval_results {
            // Resolve the relative name from the full path
            let rel_name = path_to_rel
                .get(&result.full_image_path)
                .cloned()
                .unwrap_or_else(|| {
                    // Fallback: extract filename only
                    Path::new(&result.full_image_path)
                        .file_name()
                        .unwrap()
                        .to_string_lossy()
                        .to_string()
                });

            let new_eval = ImageEvaluation {
                image_name: rel_name,
                result: result.success_result,
                fail_reason: result.failure_result,
            };
            new_evals.push(new_eval);
        }
        // Overwrite or add to the current evals:
        // Ensure new_evals with the same image_name as old ones overwrite the old evaluations
        let mut eval_map: std::collections::HashMap<String, ImageEvaluation> = current_evals
            .into_iter()
            .map(|eval| (eval.image_name.clone(), eval))
            .collect();

        for eval in new_evals {
            eval_map.insert(eval.image_name.clone(), eval); // Overwrite or insert
        }

        let all_new_evals: Vec<ImageEvaluation> = eval_map.into_values().collect();

        self.write_images_eval_json(project_name, &all_new_evals)?;

        Ok(all_new_evals)
    }

    /// Read the existing evaluated images for the project.
    /// Returns an empty vec if the file does not exist (e.g. first evaluation for the project).
    pub fn read_images_eval_json(
        &self,
        project_name: &str,
    ) -> Result<Vec<ImageEvaluation>, String> {
        let evals_path = format!("projects/{project_name}/image_evals.json");
        let full_path = self.app_save.get_full_path(&evals_path);
        if full_path.exists() {
            self.app_save.read_json(&evals_path)
        } else {
            Ok(Vec::new())
        }
    }

    pub fn write_images_eval_json(
        &self,
        project_name: &str,
        evals: &Vec<ImageEvaluation>,
    ) -> Result<(), String> {
        let evals_path = format!("projects/{project_name}/image_evals.json");
        self.app_save.save_json(&evals_path, evals)
    }

    /// Renames evaluation entries when images are moved between folders.
    pub fn rename_evaluations(
        &self,
        project_name: &str,
        renames: &[(String, String)],
    ) -> Result<(), String> {
        let mut evals = self.read_images_eval_json(project_name)?;
        for eval in &mut evals {
            for (old, new) in renames {
                if eval.image_name == *old {
                    eval.image_name = new.clone();
                    break;
                }
            }
        }
        self.write_images_eval_json(project_name, &evals)
    }

    /// Removes saved evaluations for the given image names (e.g. when those images are deleted).
    pub fn remove_evaluations_for_images(
        &self,
        project_name: &str,
        image_names: &[String],
    ) -> Result<(), String> {
        if image_names.is_empty() {
            return Ok(());
        }
        let current = self.read_images_eval_json(project_name)?;
        let names_set: std::collections::HashSet<_> =
            image_names.iter().map(String::as_str).collect();
        let kept: Vec<ImageEvaluation> = current
            .into_iter()
            .filter(|e| !names_set.contains(e.image_name.as_str()))
            .collect();
        self.write_images_eval_json(project_name, &kept)?;
        Ok(())
    }
}
