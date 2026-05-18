use std::path::PathBuf;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use ocr_image_thing::ImageEvalClient;

use super::*;
use crate::services::app_save_service::AppSaveService;

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

pub struct ProjectsService {
    app_save: Arc<AppSaveService>,
    pub image_loader: ImageLoaderComponent,
    pub image_evals: ImageEvaluationsComponent,
    pub image_exporter: ImageExporterComponent,
}

impl ProjectsService {
    pub fn new(app_save: Arc<AppSaveService>, client: ImageEvalClient) -> Self {
        let image_loader = ImageLoaderComponent::new(app_save.clone());
        let image_evals = ImageEvaluationsComponent::new(app_save.clone(), client);
        let image_exporter = ImageExporterComponent::default();
        Self {
            app_save,
            image_loader,
            image_evals,
            image_exporter,
        }
    }

    /// Creates a new project and opens it
    pub fn new_project(&self, project_name: &str) -> Result<ProjectInfoModel, String> {
        let relative_path = format!("projects/{project_name}");
        let images_path = format!("projects/{project_name}/images");
        let info_path = format!("projects/{project_name}/info.imgreader");

        self.app_save.ensure_folder_created(&relative_path);
        self.app_save.ensure_folder_created(&images_path);

        let model = ProjectInfoModel {
            project_name: project_name.to_string(),
            last_opened_at: Some(now_secs()),
        };
        self.app_save
            .save_json(&info_path, &model)
            .map_err(|e| e.to_string())?;

        // let project = Project::new(model.clone());
        // let mut l = self.active_project.lock().await;
        // *l = Some(project);

        Ok(model)
    }

    pub fn get_project(&self, project_name: &str) -> Result<ProjectInfoModel, String> {
        let info_path = format!("projects/{project_name}/info.imgreader");
        let info = self.app_save.read_json::<ProjectInfoModel>(&info_path)?;
        Ok(info)
    }

    pub fn get_project_names(&self) -> Result<Vec<String>, String> {
        let relative_path = "projects";
        let items = self.app_save.get_items_in_folder(relative_path)?;
        let mut names_with_ts: Vec<(String, u64)> = Vec::new();
        for path in items.iter().filter(|p| p.is_dir()) {
            let name = match path.file_name() {
                Some(n) => n.to_string_lossy().to_string(),
                None => continue,
            };
            let info_path = format!("projects/{name}/info.imgreader");
            let ts = self
                .app_save
                .read_json::<ProjectInfoModel>(&info_path)
                .ok()
                .and_then(|info| info.last_opened_at)
                .unwrap_or(0);
            names_with_ts.push((name, ts));
        }
        names_with_ts.sort_by_key(|b| std::cmp::Reverse(b.1));
        Ok(names_with_ts.into_iter().map(|(n, _)| n).collect())
    }

    /// Records that a project was opened (updates last_opened_at for sorting).
    pub fn record_project_opened(&self, project_name: &str) -> Result<(), String> {
        let info_path = format!("projects/{project_name}/info.imgreader");
        let mut info = self.app_save.read_json::<ProjectInfoModel>(&info_path)?;
        info.last_opened_at = Some(now_secs());
        self.app_save.save_json(&info_path, &info)?;
        Ok(())
    }

    /// Permanently deletes a project and all its contents
    pub fn delete_project(&self, project_name: &str) -> Result<(), String> {
        let relative_path = format!("projects/{project_name}");
        self.app_save.delete_folder(&relative_path)
    }

    /// Archives a project by moving it from `projects/` to `archived/`
    pub fn archive_project(&self, project_name: &str) -> Result<(), String> {
        self.app_save.ensure_folder_created("archived");
        let from = format!("projects/{project_name}");
        let to = format!("archived/{project_name}");
        self.app_save.rename_folder(&from, &to)
    }

    /// Restores an archived project by moving it from `archived/` back to `projects/`
    pub fn unarchive_project(&self, project_name: &str) -> Result<(), String> {
        self.app_save.ensure_folder_created("projects");
        let from = format!("archived/{project_name}");
        let to = format!("projects/{project_name}");
        self.app_save.rename_folder(&from, &to)
    }

    /// Lists archived project names, sorted by last_opened_at descending
    pub fn get_archived_project_names(&self) -> Result<Vec<String>, String> {
        let relative_path = "archived";
        let items = match self.app_save.get_items_in_folder(relative_path) {
            Ok(items) => items,
            Err(_) => return Ok(Vec::new()), // archived folder may not exist yet
        };
        let mut names_with_ts: Vec<(String, u64)> = Vec::new();
        for path in items.iter().filter(|p| p.is_dir()) {
            let name = match path.file_name() {
                Some(n) => n.to_string_lossy().to_string(),
                None => continue,
            };
            let info_path = format!("archived/{name}/info.imgreader");
            let ts = self
                .app_save
                .read_json::<ProjectInfoModel>(&info_path)
                .ok()
                .and_then(|info| info.last_opened_at)
                .unwrap_or(0);
            names_with_ts.push((name, ts));
        }
        names_with_ts.sort_by_key(|b| std::cmp::Reverse(b.1));
        Ok(names_with_ts.into_iter().map(|(n, _)| n).collect())
    }

    /// Permanently deletes an archived project
    pub fn delete_archived_project(&self, project_name: &str) -> Result<(), String> {
        let relative_path = format!("archived/{project_name}");
        self.app_save.delete_folder(&relative_path)
    }

    pub fn get_image_full_path(&self, project_name: &str, image_name: &str) -> PathBuf {
        let relative = format!("projects/{project_name}/images/{image_name}");
        self.app_save.get_full_path(&relative)
    }

    /// Creates a folder inside a project's images directory
    pub fn create_folder_in_project(
        &self,
        project_name: &str,
        folder_name: &str,
    ) -> Result<(), String> {
        let path = format!("projects/{project_name}/images/{folder_name}");
        self.app_save.ensure_folder_created(&path);
        Ok(())
    }

    /// Lists folder names inside a project's images directory
    pub fn get_folders_in_project(&self, project_name: &str) -> Result<Vec<String>, String> {
        let images_path = format!("projects/{project_name}/images");
        let items = self.app_save.get_items_in_folder(&images_path)?;
        let folders: Vec<String> = items
            .into_iter()
            .filter(|p| p.is_dir())
            .filter_map(|p| p.file_name().map(|n| n.to_string_lossy().to_string()))
            .collect();
        Ok(folders)
    }

    /// Renames a folder inside a project's images directory and updates evaluations
    pub fn rename_folder_in_project(
        &self,
        project_name: &str,
        old_folder_name: &str,
        new_folder_name: &str,
    ) -> Result<(), String> {
        let from = format!("projects/{project_name}/images/{old_folder_name}");
        let to = format!("projects/{project_name}/images/{new_folder_name}");
        self.app_save.rename_folder(&from, &to)?;

        // Collect image file names in the (now renamed) folder to build rename pairs
        let folder_path = format!("projects/{project_name}/images/{new_folder_name}");
        let items = self.app_save.get_items_in_folder(&folder_path)?;
        let renames: Vec<(String, String)> = items
            .into_iter()
            .filter(|p| p.is_file())
            .filter_map(|p| {
                p.file_name().map(|n| {
                    let fname = n.to_string_lossy().to_string();
                    (
                        format!("{old_folder_name}/{fname}"),
                        format!("{new_folder_name}/{fname}"),
                    )
                })
            })
            .collect();

        if !renames.is_empty() {
            self.image_evals
                .rename_evaluations(project_name, &renames)?;
        }

        Ok(())
    }

    /// Deletes a folder and all its images from a project, plus their evaluations
    pub fn delete_folder_from_project(
        &self,
        project_name: &str,
        folder_name: &str,
    ) -> Result<(), String> {
        // Collect image names in the folder so we can remove their evaluations
        let folder_path = format!("projects/{project_name}/images/{folder_name}");
        let items = self.app_save.get_items_in_folder(&folder_path)?;
        let image_names: Vec<String> = items
            .into_iter()
            .filter(|p| p.is_file())
            .filter_map(|p| {
                p.file_name()
                    .map(|n| format!("{folder_name}/{}", n.to_string_lossy()))
            })
            .collect();

        // Remove evaluations for those images
        if !image_names.is_empty() {
            self.image_evals
                .remove_evaluations_for_images(project_name, &image_names)?;
        }

        // Delete the folder and its contents
        self.app_save.delete_folder(&folder_path)
    }
}
