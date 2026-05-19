use std::sync::Arc;

use tauri::State;

use crate::services::on_demand_images_service::{models::OnDemandTemplate, OnDemandImagesService};

type OnDemandImagesServiceType<'a> = State<'a, Arc<OnDemandImagesService>>;

#[tauri::command]
pub async fn evaluate_selected_image_on_demand<'a>(
    state: OnDemandImagesServiceType<'a>,
    image_paths: Vec<String>,
    template: OnDemandTemplate,
    openai_api_key: String,
) -> Result<String, String> {
    state
        .evaluate_selected(image_paths, &template, &openai_api_key)
        .await
}
