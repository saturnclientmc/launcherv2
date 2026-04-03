use tauri::{AppHandle, Emitter, State};

use crate::{GameVersion, LauncherSettings, Mod, SharedState};

#[tauri::command]
pub fn get_versions(state: State<SharedState>) -> Vec<GameVersion> {
    let state = state.lock().unwrap();
    state.versions.clone()
}

#[tauri::command]
pub fn get_installed_mods(state: State<SharedState>, version_id: String) -> Vec<Mod> {
    let state = state.lock().unwrap();
    state
        .mods
        .iter()
        .filter(|m| m.supported_versions.contains(&version_id))
        .cloned()
        .collect()
}

#[tauri::command]
pub fn toggle_mod(state: State<SharedState>, mod_id: String) {
    let mut state = state.lock().unwrap();
    if let Some(mod_item) = state.mods.iter_mut().find(|m| m.id == mod_id) {
        mod_item.enabled = !mod_item.enabled;
    }
}

#[tauri::command]
pub fn install_mod(state: State<SharedState>, mut mod_item: Mod) {
    let mut state = state.lock().unwrap();

    if !state.mods.iter().any(|m| m.id == mod_item.id) {
        mod_item.enabled = true;
        state.mods.push(mod_item);
    }
}

#[tauri::command]
pub fn get_settings(state: State<SharedState>) -> LauncherSettings {
    state.lock().unwrap().settings.clone()
}

#[tauri::command]
pub fn update_settings(state: State<SharedState>, new_settings: LauncherSettings) {
    let mut state = state.lock().unwrap();
    state.settings = new_settings;
}

#[tauri::command]
pub fn launch_game(app: AppHandle, version_id: String) -> Result<(), String> {
    std::thread::spawn(move || {
        app.emit("is-launching", "true").unwrap();
        app.emit("launch-status", "Preparing...").unwrap();

        std::thread::sleep(std::time::Duration::from_millis(500));
        app.emit("launch-status", "Verifying assets...").unwrap();

        std::thread::sleep(std::time::Duration::from_millis(700));
        app.emit("launch-status", "Applying Saturn optimizations...")
            .unwrap();

        std::thread::sleep(std::time::Duration::from_millis(700));
        app.emit("launch-status", "Starting game...").unwrap();

        std::thread::sleep(std::time::Duration::from_millis(1000));
        app.emit("launch-status", "Game launched!").unwrap();

        app.emit("is-launching", "false").unwrap();
    });

    Ok(())
}
