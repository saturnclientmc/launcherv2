pub mod auth;
pub mod downloader;
pub mod install;

use std::{env, path::PathBuf};

use lyceris::{
    auth::microsoft::MinecraftAccount,
    minecraft::{
        config::ConfigBuilder,
        emitter::{Emitter, Event},
        launch::launch,
        loader::fabric::Fabric,
    },
};

use tauri::{Emitter as _, State};

use crate::{features::FeatureState, GameVersion, SharedState};

pub fn launcher_dir() -> PathBuf {
    if cfg!(target_os = "macos") {
        let home = env::var("HOME")
            .map(PathBuf::from)
            .expect("HOME environment variable not set");

        home.join("Library/Application Support/SaturnLauncher")
    } else if cfg!(target_os = "windows") {
        env::var("APPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("."))
            .join("SaturnLauncher")
    } else {
        env::var("XDG_DATA_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                env::var("HOME")
                    .map(PathBuf::from)
                    .unwrap_or_else(|_| PathBuf::from("."))
                    .join(".local/share")
            })
            .join("SaturnLauncher")
    }
}

#[tauri::command]
pub async fn launch_game(
    app: tauri::AppHandle,
    state: State<'_, SharedState>,
    feature_state: State<'_, FeatureState>,
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

    let config = ConfigBuilder::new(
        launcher_dir().join(&version.id),
        version.id.clone(),
        lyceris::auth::AuthMethod::Microsoft {
            username: account.username.clone(),
            xuid: account.xuid.clone(),
            uuid: account.uuid.clone(),
            access_token: account.access_token.clone(),
            refresh_token: account.refresh_token.clone(),
        },
    )
    .loader(Fabric(version.loader_version.clone()).into())
    .memory(lyceris::minecraft::config::Memory::Megabyte(
        state.lock().unwrap().settings.max_memory as u64,
    ))
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

    feature_state
        .inner()
        .launch(&state, &version, &account)
        .await?;

    launch(&config, Some(&emitter))
        .await
        .map_err(|e| e.to_string())?
        .wait()
        .await
        .map_err(|e| e.to_string())?;

    feature_state
        .inner()
        .after_launch(&state, &version, &account)
        .await?;

    app.emit("is-launching", "false").unwrap();
    app.emit("launch-status", "").unwrap();
    emit_progress(&app, 0.0);

    Ok(())
}

fn emit_progress(app: &tauri::AppHandle, progress: f32) {
    let percent = (progress * 100.0).round() as u32;
    let _ = app.emit("launch-progress", percent);
}
