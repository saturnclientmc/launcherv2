use std::path::{Path, PathBuf};

use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};
use tokio::fs;

use crate::{launcher::LAUNCHER_DIR, save_state, LauncherSettings, Mod, SharedState};

#[derive(Deserialize)]
struct ModrinthVersion {
    version_number: String,
    game_versions: Vec<String>,
    loaders: Vec<String>,
    files: Vec<ModrinthFile>,
}

#[derive(Deserialize)]
struct ModrinthFile {
    url: String,
    filename: String,
    primary: bool,
}

#[tauri::command]
pub async fn get_installed_mods(version_id: String) -> Result<Vec<Mod>, String> {
    let mut mods = Vec::new();

    let base_dir = LAUNCHER_DIR.data_dir().join(&version_id).join("mods");

    let enabled_dir = base_dir.clone();
    let disabled_dir = base_dir.join("disabled_mods");

    let cache_dir = LAUNCHER_DIR.data_dir().join("cache");

    // process a directory async
    async fn process_dir(dir: PathBuf, enabled: bool, cache_dir: PathBuf) -> Vec<Mod> {
        let mut mods = Vec::new();

        if fs::metadata(&dir).await.is_err() {
            return mods;
        }

        let mut entries = match fs::read_dir(&dir).await {
            Ok(e) => e,
            Err(_) => return mods,
        };

        while let Ok(Some(entry)) = entries.next_entry().await {
            let path = entry.path();

            // only .jar files
            if path.extension().and_then(|s| s.to_str()) != Some("jar") {
                continue;
            }

            let file_name = match path.file_name().and_then(|s| s.to_str()) {
                Some(name) => name.to_string(),
                None => continue,
            };

            let cache_path = cache_dir.join(format!("{}.json", file_name));

            let mod_item = if fs::metadata(&cache_path).await.is_ok() {
                match fs::read_to_string(&cache_path).await {
                    Ok(content) => match serde_json::from_str::<Mod>(&content) {
                        Ok(mut m) => {
                            m.enabled = enabled;
                            m
                        }
                        Err(_) => fallback_mod(&file_name, enabled),
                    },
                    Err(_) => fallback_mod(&file_name, enabled),
                }
            } else {
                fallback_mod(&file_name, enabled)
            };

            mods.push(mod_item);
        }

        mods
    }

    // run both dirs (sequential, but async-safe)
    let mut enabled_mods = process_dir(enabled_dir, true, cache_dir.clone()).await;
    let mut disabled_mods = process_dir(disabled_dir, false, cache_dir.clone()).await;

    mods.append(&mut enabled_mods);
    mods.append(&mut disabled_mods);

    Ok(mods)
}

// fallback
fn fallback_mod(file_name: &str, enabled: bool) -> Mod {
    Mod {
        id: file_name.to_string(),
        name: file_name.to_string(),
        version: String::new(),
        author: String::new(),
        description: String::new(),
        enabled,
        icon: None,
        supported_versions: vec![],
    }
}

#[tauri::command]
pub async fn remove_mod(version: String, file_name: String) -> Result<(), String> {
    // mods folder
    let mods_dir: PathBuf = LAUNCHER_DIR.data_dir().join(&version).join("mods");

    // File to remove
    let mut source = mods_dir.join(&file_name);

    if !source.exists() {
        source = mods_dir.join("disabled_mods").join(&file_name);
    }

    if !source.exists() {
        return Err(format!("Mod file not found: {}", file_name));
    }

    // move file
    fs::remove_file(&source).await.map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn disable_mod(version: String, file_name: String) -> Result<(), String> {
    // mods folder
    let mods_dir: PathBuf = LAUNCHER_DIR.data_dir().join(&version).join("mods");

    // disabled_mods folder
    let disabled_dir = mods_dir.join("disabled_mods");

    // create disabled_mods if it doesn't exist
    fs::create_dir_all(&disabled_dir)
        .await
        .map_err(|e| e.to_string())?;

    let source = mods_dir.join(&file_name);
    let destination = disabled_dir.join(&file_name);

    if !source.exists() {
        return Err(format!("Mod file not found: {}", file_name));
    }

    // move file
    fs::rename(&source, &destination)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn enable_mod(version: String, file_name: String) -> Result<(), String> {
    let mods_dir = LAUNCHER_DIR.data_dir().join(&version).join("mods");

    let disabled_dir = mods_dir.join("disabled_mods");

    let source = disabled_dir.join(&file_name);
    let destination = mods_dir.join(&file_name);

    if !source.exists() {
        return Err(format!("Disabled mod not found: {}", file_name));
    }

    fs::rename(&source, &destination)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn install_mod(mut mod_meta: Mod, versions: Vec<String>) -> Result<(), String> {
    let client = reqwest::Client::new();

    println!("Installing {} for {:?}", mod_meta.name, versions);

    let cache_dir = LAUNCHER_DIR.data_dir().join("cache");
    fs::create_dir_all(&cache_dir)
        .await
        .map_err(|e| e.to_string())?;

    for mc_version in versions {
        let url = format!(
            "https://api.modrinth.com/v2/project/{}/version",
            mod_meta.id
        );

        let res = client.get(&url).send().await.map_err(|e| e.to_string())?;

        let versions_list: Vec<ModrinthVersion> = res.json().await.map_err(|e| e.to_string())?;

        let mut compatible: Vec<&ModrinthVersion> = versions_list
            .iter()
            .filter(|v| {
                v.game_versions.contains(&mc_version) && v.loaders.iter().any(|l| l == "fabric")
            })
            .collect();

        if compatible.is_empty() {
            println!("No compatible version found for {}", mc_version);
            continue;
        }

        compatible.sort_by(|a, b| b.version_number.cmp(&a.version_number));

        let selected = compatible[0];

        let file = selected
            .files
            .iter()
            .find(|f| f.primary)
            .or_else(|| selected.files.first())
            .ok_or("No files found for version")?;

        let bytes = client
            .get(&file.url)
            .send()
            .await
            .map_err(|e| e.to_string())?
            .bytes()
            .await
            .map_err(|e| e.to_string())?;

        let dir: PathBuf = LAUNCHER_DIR.data_dir().join(&mc_version).join("mods");

        fs::create_dir_all(&dir).await.map_err(|e| e.to_string())?;

        let file_path = dir.join(&file.filename);

        // 1. Save JAR
        fs::write(&file_path, &bytes)
            .await
            .map_err(|e| e.to_string())?;

        // 2. Prepare cache metadata
        mod_meta.id = file.filename.clone(); // ✅ ID is filename
        mod_meta.version = selected.version_number.clone();
        mod_meta.enabled = true;

        let cache_path = cache_dir.join(format!("{}.json", file.filename));

        // 3. Save metadata JSON
        let json = serde_json::to_string_pretty(&mod_meta).map_err(|e| e.to_string())?;

        fs::write(&cache_path, json)
            .await
            .map_err(|e| e.to_string())?;

        println!(
            "Installed {} for {} (cached as {})",
            mod_meta.name, mc_version, file.filename
        );
    }

    Ok(())
}

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

#[tauri::command]
pub async fn install_paths(
    app: AppHandle,
    state: State<'_, SharedState>,
    paths: Vec<String>,
) -> Result<(), String> {
    for path in &paths {
        let file = Path::new(&path)
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or_else(|| String::from("File name not found"))?;

        let version_dir = LAUNCHER_DIR.data_dir().join(&state.lock().unwrap().version);

        let mc_child = if path.ends_with(".jar") {
            "mods"
        } else {
            return Err(String::from("Invalid file type"));
        };

        fs::copy(path, version_dir.join(mc_child).join(file))
            .await
            .map_err(|e| e.to_string())?;

        app.emit("path-installed", path.to_string())
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}
