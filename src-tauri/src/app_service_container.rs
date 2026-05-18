use std::sync::Arc;

use ocr_image_thing::ImageEvalClient;
use tauri::{AppHandle, Manager};

use crate::services::{
    app_save_service::AppSaveService,
    on_demand_images_service::{self, OnDemandImagesService},
    projects_service::ProjectsService,
    util_service::UtilService,
};

pub fn initialize_app(handle: &AppHandle) {
    let handle = handle.clone();

    let image_eval_client = ImageEvalClient::new();

    let app_save_service = Arc::new(AppSaveService::default());
    let projects_service = Arc::new(ProjectsService::new(
        app_save_service.clone(),
        image_eval_client.clone(),
    ));
    let util_service = Arc::new(UtilService::new());
    let on_demand_images_service = Arc::new(OnDemandImagesService::new(image_eval_client.clone()));
    handle.manage(app_save_service);
    handle.manage(projects_service);
    handle.manage(util_service);
    handle.manage(on_demand_images_service);
}
