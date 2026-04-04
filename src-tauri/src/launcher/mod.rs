pub mod auth;
pub mod downloader;
pub mod install;

use directories::ProjectDirs;
use lyceris::{
    auth::microsoft::MinecraftAccount,
    minecraft::{
        config::ConfigBuilder,
        emitter::{Emitter, Event},
        launch::launch,
        loader::fabric::Fabric,
    },
};
use once_cell::sync::Lazy;
use tauri::Emitter as _;

use crate::GameVersion;

pub static LAUNCHER_DIR: Lazy<ProjectDirs> = Lazy::new(|| {
    ProjectDirs::from("org", "SaturnLauncher", "SaturnLauncher")
        .expect("Failed to create project directories")
});

#[tauri::command]
pub async fn launch_game(
    app: tauri::AppHandle,
    version: GameVersion,
    account: MinecraftAccount,
) -> Result<(), String> {
    emit_progress(&app, 0.0);

    app.emit("is-launching", "true").unwrap();
    app.emit("launch-status", "Preparing").unwrap();

    // Emitter uses `EventEmitter` inside of it
    // and it uses tokio::Mutex for locking.
    // That causes emitter methods to be async.
    let emitter = Emitter::default();

    // Single download progress event send when
    // a file is being downloaded.
    emitter
        .on(
            Event::SingleDownloadProgress,
            |(path, current, total): (String, u64, u64)| {
                println!("Downloading {} - {}/{}", path, current, total);
            },
        )
        .await;

    // Multiple download progress event send when
    // multiple files are being downloaded.
    // Java, libraries and assets are downloaded in parallel and
    // this event is triggered for each file.
    emitter
        .on(Event::MultipleDownloadProgress, {
            let app = app.clone();
            move |(_, current, total, _): (String, u64, u64, String)| {
                emit_progress(&app, current as f32 / total as f32);
                println!("Downloading {}/{}", current, total);
            }
        })
        .await;

    emitter
        .on(Event::Console, |line: String| {
            println!("{}", line);
        })
        .await;

    let current_dir = LAUNCHER_DIR.data_dir();

    let config = ConfigBuilder::new(
        current_dir.join(&version.id),
        version.id.clone(),
        lyceris::auth::AuthMethod::Microsoft {
            username: account.username,
            xuid: account.xuid,
            uuid: account.uuid,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
        },
    )
    .loader(Fabric(version.loader_version).into())
    .build();

    println!("Starting installation");

    app.emit("launch-status", "Installing").unwrap();

    // Install method also checks for broken files
    // and downloads them again if they are broken.
    install::install(&config, Some(&emitter))
        .await
        .map_err(|e| e.to_string())?;

    println!("Finished installing");

    emit_progress(&app, 1.0);

    app.emit("launch-status", "Launching").unwrap();

    launch(&config, Some(&emitter))
        .await
        .map_err(|e| e.to_string())?
        .wait()
        .await
        .map_err(|e| e.to_string())?;

    app.emit("is-launching", "false").unwrap();
    app.emit("launch-status", "").unwrap();
    emit_progress(&app, 0.0);

    Ok(())
}

fn emit_progress(app: &tauri::AppHandle, progress: f32) {
    let percent = (progress * 100.0).round() as u32;
    let _ = app.emit("launch-progress", percent);
}
