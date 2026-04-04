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

use crate::GameVersion;

pub static LAUNCHER_DIR: Lazy<ProjectDirs> = Lazy::new(|| {
    ProjectDirs::from("org", "SaturnLauncher", "SaturnLauncher")
        .expect("Failed to create project directories")
});

#[tauri::command]
pub async fn launch_game(version: GameVersion, account: MinecraftAccount) -> Result<(), String> {
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
        .on(
            Event::MultipleDownloadProgress,
            |(_, current, total, _): (String, u64, u64, String)| {
                println!("Downloading {}/{}", current, total);
            },
        )
        .await;

    // Console event send when a line is printed to the console.
    // It uses a seperated tokio thread to handle this operation.
    emitter
        .on(Event::Console, |line: String| {
            println!("Line: {}", line);
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

    // Install method also checks for broken files
    // and downloads them again if they are broken.
    install::install(&config, Some(&emitter))
        .await
        .map_err(|e| e.to_string())?;

    println!("Finished installing");

    // This method never downloads any file and just runs the game.
    launch(&config, Some(&emitter))
        .await
        .map_err(|e| e.to_string())?
        .wait()
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
