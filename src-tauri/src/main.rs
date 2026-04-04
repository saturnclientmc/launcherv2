// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use saturn_launcher_lib::{commands::*, AppState};
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![
            // Saturn Launcher Commands
            get_installed_mods,
            toggle_mod,
            install_mod,
            get_settings,
            update_settings,
            // Launcher Commands
            saturn_launcher_lib::launcher::launch_game,
            // Auth Commands
            saturn_launcher_lib::launcher::auth::auth_create_link,
            saturn_launcher_lib::launcher::auth::auth_login,
            saturn_launcher_lib::launcher::auth::auth_refresh,
            saturn_launcher_lib::launcher::auth::auth_list,
            saturn_launcher_lib::launcher::auth::auth_remove,
            saturn_launcher_lib::launcher::auth::auth_validate,
            saturn_launcher_lib::launcher::auth::auth_get_valid
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
