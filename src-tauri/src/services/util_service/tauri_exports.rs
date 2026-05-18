use crate::services::util_service::UtilService;
use std::sync::Arc;
use tauri::State;

type UtilServiceState<'a> = State<'a, Arc<UtilService>>;

#[tauri::command]
pub fn copy_to_clipboard(state: UtilServiceState, text: &str) -> Result<(), String> {
    state.copy_to_clipboard(text)
}

#[tauri::command]
pub fn read_image_file_as_data_url(
    state: UtilServiceState,
    path: &str,
) -> Result<String, String> {
    state.read_image_file_as_data_url(path)
}
