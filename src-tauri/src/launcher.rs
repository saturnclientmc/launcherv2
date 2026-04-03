use directories::ProjectDirs;
use lighty_launcher::{
    auth::{Authenticator, OfflineAuth},
    java::JavaDistribution,
    launch::Launch,
    loaders::Loader,
    version::VersionBuilder,
};
use once_cell::sync::Lazy;

static LAUNCHER_DIR: Lazy<ProjectDirs> = Lazy::new(|| {
    ProjectDirs::from("org", "SaturnLauncher", "SaturnLauncher")
        .expect("Failed to create project directories")
});

#[tauri::command]
pub async fn launch() -> Result<(), String> {
    println!("Launcher directory: {:?}", LAUNCHER_DIR);

    tracing_subscriber::fmt::init();

    // Authenticate
    let mut auth = OfflineAuth::new("PlayerName");
    let profile = auth
        .authenticate()
        .await
        .map_err(|e| format!("Authentication failed: {}", e))?;

    // Create version instance
    let mut version = VersionBuilder::new(
        "vanilla-1.21.1",
        Loader::Vanilla,
        "",
        "1.21.1",
        &LAUNCHER_DIR,
    );

    // Launch the game
    version
        .launch(&profile, JavaDistribution::Temurin)
        .run()
        .await
        .map_err(|e| format!("Launch failed: {}", e))?;

    Ok(())
}
