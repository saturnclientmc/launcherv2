pub mod downloader;
pub mod install;

use directories::ProjectDirs;
use lyceris::minecraft::{
    config::ConfigBuilder,
    emitter::{Emitter, Event},
    launch::launch,
};
use once_cell::sync::Lazy;

pub static LAUNCHER_DIR: Lazy<ProjectDirs> = Lazy::new(|| {
    ProjectDirs::from("org", "SaturnLauncher", "SaturnLauncher")
        .expect("Failed to create project directories")
});

#[tauri::command]
pub async fn launch_game() -> Result<(), String> {
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
        current_dir.join("game"),
        "1.21.4".into(),
        lyceris::auth::AuthMethod::Offline {
            username: "Lyceris".into(),
            // If none given, it will be generated.
            uuid: None,
        },
    )
    .build();

    // Install method also checks for broken files
    // and downloads them again if they are broken.
    install::install(&config, Some(&emitter))
        .await
        .map_err(|e| e.to_string())?;

    // This method never downloads any file and just runs the game.
    launch(&config, Some(&emitter))
        .await
        .map_err(|e| e.to_string())?
        .wait()
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
