// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use saturn_launcher_lib::load_state;
use tauri::{Emitter, Manager, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(load_state())
        .invoke_handler(tauri::generate_handler![
            // Saturn Launcher Commands
            saturn_launcher_lib::commands::get_installed_mods,
            saturn_launcher_lib::commands::install_mod,
            saturn_launcher_lib::commands::enable_mod,
            saturn_launcher_lib::commands::disable_mod,
            saturn_launcher_lib::commands::remove_mod,
            saturn_launcher_lib::commands::get_settings,
            saturn_launcher_lib::commands::update_settings,
            saturn_launcher_lib::commands::get_version,
            saturn_launcher_lib::commands::update_version,
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
        .setup(|app| {
            match app.get_webview_window("main") {
                Some(window) => {
                    let handle = app.handle().clone();

                    window.on_window_event(move |event| {
                        if let WindowEvent::DragDrop(file_event) = event {
                            if let tauri::DragDropEvent::Drop { paths, .. } = file_event {
                                println!("Installing files: {:?}", paths);

                                if handle
                                    .emit(
                                        "install-paths",
                                        paths
                                            .iter()
                                            .filter_map(|p| {
                                                if p.is_file() {
                                                    Some(p.to_str()?.to_string())
                                                } else {
                                                    None
                                                }
                                            })
                                            .collect::<Vec<_>>(),
                                    )
                                    .is_err()
                                {
                                    println!("Failed emitting files to frontend");
                                }
                            }
                        }
                    });
                }

                None => {
                    println!("WARN: Drag and drop feature will not work");
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
