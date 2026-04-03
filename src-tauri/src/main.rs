// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use saturn_launcher_lib::commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_versions,
            get_installed_mods,
            toggle_mod,
            discover_mods,
            install_mod,
            get_settings,
            update_settings,
            launch_game
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
