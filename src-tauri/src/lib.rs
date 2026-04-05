pub mod commands;
pub mod launcher;

use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::PathBuf,
    sync::{Arc, Mutex},
};

use crate::launcher::launcher_dir;

pub type SharedState = Arc<Mutex<AppState>>;

// --- Types ---
#[derive(Clone, Serialize, Deserialize)]
pub struct Mod {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub enabled: bool,
    pub icon: Option<String>,
    pub supported_versions: Vec<String>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct GameVersion {
    pub id: String,
    pub name: String,
    pub loader_version: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct LauncherSettings {
    pub max_memory: u32,
}

// --- App State ---
#[derive(Clone, Serialize, Deserialize)]
pub struct AppState {
    pub settings: LauncherSettings,
    pub version: String,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            settings: LauncherSettings { max_memory: 4096 },
            version: String::from("1.21.6"),
        }
    }
}

// Helper to get config path
fn config_path() -> PathBuf {
    launcher_dir().join("launcher.json")
}

// --- Load ---
pub fn load_state() -> SharedState {
    let path = config_path();

    if path.exists() {
        match fs::read_to_string(&path) {
            Ok(content) => match serde_json::from_str::<AppState>(&content) {
                Ok(state) => return Arc::new(Mutex::new(state)),
                Err(err) => {
                    eprintln!("Failed to parse config, using default: {err}");
                }
            },
            Err(err) => {
                eprintln!("Failed to read config, using default: {err}");
            }
        }
    }

    // If missing or failed → create default
    let default = Arc::new(Mutex::new(AppState::default()));
    save_state(&default);

    default
}

// --- Save ---
pub fn save_state(state: &SharedState) {
    let path = config_path();

    if let Some(parent) = path.parent() {
        if let Err(err) = fs::create_dir_all(parent) {
            eprintln!("Failed to create config directory: {err}");
            return;
        }
    }

    match serde_json::to_string_pretty(&*state.lock().unwrap()) {
        Ok(json) => {
            if let Err(err) = fs::write(path, json) {
                eprintln!("Failed to write config: {err}");
            }
        }
        Err(err) => {
            eprintln!("Failed to serialize config: {err}");
        }
    }
}
