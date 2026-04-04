use tauri::State;

use crate::{save_state, LauncherSettings, Mod, SharedState};

#[tauri::command]
pub fn get_installed_mods(state: State<SharedState>, version_id: String) -> Vec<Mod> {
    Vec::new()
}

#[tauri::command]
pub fn toggle_mod(state: State<SharedState>, mod_id: String) {}

#[tauri::command]
pub fn install_mod(state: State<SharedState>, mut mod_item: Mod) {}

#[tauri::command]
pub fn get_settings(state: State<SharedState>) -> LauncherSettings {
    state.lock().unwrap().settings.clone()
}

#[tauri::command]
pub fn update_settings(state: State<SharedState>, new_settings: LauncherSettings) {
    {
        let mut state = state.lock().unwrap();
        state.settings = new_settings;
    }

    save_state(&state);
}

#[tauri::command]
pub fn get_version(state: State<SharedState>) -> String {
    state.lock().unwrap().version.clone()
}

#[tauri::command]
pub fn update_version(state: State<SharedState>, version: String) {
    {
        let mut state = state.lock().unwrap();
        state.version = version;
    }

    save_state(&state);
}
