mod app_service_container;
mod constants;
mod services;
pub use services::on_demand_images_service::tauri_exports::*;
pub use services::projects_service::tauri_exports::*;
pub use services::util_service::tauri_exports::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            app_service_container::initialize_app(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            new_project,
            get_project,
            get_project_names,
            get_image_previews_in_project,
            load_image_from_project,
            import_images_to_project,
            delete_images_from_project,
            evaluate_images,
            get_image_evaluations,
            export_evaluated_images,
            open_path_in_file_manager,
            open_image_in_default_app,
            record_project_opened,
            delete_project,
            archive_project,
            unarchive_project,
            get_archived_project_names,
            delete_archived_project,
            create_folder_in_project,
            get_folders_in_project,
            rename_folder_in_project,
            delete_folder_from_project,
            move_images_in_project,
            // UtilService
            copy_to_clipboard,
            read_image_file_as_data_url,
            // OnDemandImagesService
            evaluate_selected_image_on_demand,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
