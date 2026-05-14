#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::process::Command;
use std::sync::Arc;

use tauri::State;

use crate::services::projects_service::{
    models::*, requests::RequestImageEvaluation, ProjectsService,
};

#[tauri::command]
pub fn new_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<ProjectInfoModel, String> {
    service.new_project(project_name)
}

#[tauri::command]
pub fn get_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<ProjectInfoModel, String> {
    service.get_project(project_name)
}

#[tauri::command]
pub fn get_project_names(service: State<'_, Arc<ProjectsService>>) -> Result<Vec<String>, String> {
    service.get_project_names()
}

#[tauri::command]
pub fn record_project_opened(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<(), String> {
    service.record_project_opened(project_name)
}

#[tauri::command]
pub fn delete_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<(), String> {
    service.delete_project(project_name)
}

#[tauri::command]
pub fn archive_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<(), String> {
    service.archive_project(project_name)
}

#[tauri::command]
pub fn unarchive_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<(), String> {
    service.unarchive_project(project_name)
}

#[tauri::command]
pub fn get_archived_project_names(
    service: State<'_, Arc<ProjectsService>>,
) -> Result<Vec<String>, String> {
    service.get_archived_project_names()
}

#[tauri::command]
pub fn delete_archived_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<(), String> {
    service.delete_archived_project(project_name)
}

#[tauri::command]
pub async fn get_image_previews_in_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<Vec<ImagePreviewModel>, String> {
    service
        .image_loader
        .get_image_previews_in_project(project_name)
        .await
}

#[tauri::command]
pub async fn load_image_from_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    image_name: &str,
) -> Result<FullImageModel, String> {
    service
        .image_loader
        .load_image_from_project(project_name, image_name)
        .await
}

#[tauri::command]
pub async fn import_images_to_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    image_paths: Vec<String>,
    folder: Option<String>,
) -> Result<(), String> {
    service
        .image_loader
        .import_images_to_project(project_name, image_paths, folder)
        .await
}

#[tauri::command]
pub async fn delete_images_from_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    image_names: Vec<String>,
) -> Result<(), String> {
    service
        .image_loader
        .delete_images_from_project(project_name, image_names.clone())
        .await?;
    service
        .image_evals
        .remove_evaluations_for_images(project_name, &image_names)?;
    Ok(())
}

#[tauri::command]
pub async fn evaluate_images(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    request: RequestImageEvaluation,
    custom_prompt: Option<String>,
    temperature: Option<f32>,
) -> Result<Vec<ImageEvaluation>, String> {
    service
        .image_evals
        .evaluate_images(project_name, request, custom_prompt, temperature)
        .await
}

/// Get the existing image evaluations for the project
#[tauri::command]
pub async fn get_image_evaluations(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<Vec<ImageEvaluation>, String> {
    service.image_evals.read_images_eval_json(project_name)
}

/// Export evaluated images to a directory
#[tauri::command]
pub async fn export_evaluated_images(
    service: State<'_, Arc<ProjectsService>>,
    evaluations: Vec<ImageEvaluation>,
    output_dir_path: &str,
    mode: Option<String>,
) -> Result<Vec<String>, String> {
    service
        .image_exporter
        .export_evaluated_images(evaluations, output_dir_path, mode.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_folder_in_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    folder_name: &str,
) -> Result<(), String> {
    service.create_folder_in_project(project_name, folder_name)
}

#[tauri::command]
pub fn get_folders_in_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<Vec<String>, String> {
    service.get_folders_in_project(project_name)
}

#[tauri::command]
pub fn rename_folder_in_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    old_folder_name: &str,
    new_folder_name: &str,
) -> Result<(), String> {
    service.rename_folder_in_project(project_name, old_folder_name, new_folder_name)
}

#[tauri::command]
pub fn delete_folder_from_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    folder_name: &str,
) -> Result<(), String> {
    service.delete_folder_from_project(project_name, folder_name)
}

#[tauri::command]
pub async fn move_images_in_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    image_names: Vec<String>,
    target_folder: Option<String>,
) -> Result<Vec<String>, String> {
    let new_names = service
        .image_loader
        .move_images_in_project(project_name, image_names.clone(), target_folder)
        .await?;

    // Update evaluation records to match the new image names
    let renames: Vec<(String, String)> = image_names
        .into_iter()
        .zip(new_names.iter().cloned())
        .filter(|(old, new)| old != new)
        .collect();
    if !renames.is_empty() {
        service
            .image_evals
            .rename_evaluations(project_name, &renames)?;
    }

    Ok(new_names)
}

/// Open a project image in the OS default application
#[tauri::command]
pub fn open_image_in_default_app(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    image_name: &str,
) -> Result<(), String> {
    let full_path = service.get_image_full_path(project_name, image_name);
    open_path_in_default_app(full_path.to_string_lossy().as_ref())
}

fn open_path_in_default_app(path: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        Command::new("cmd")
            .args(["/C", "start", "", path])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Open a path (file or directory) in the system's default file manager
#[tauri::command]
pub fn open_path_in_file_manager(path: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
