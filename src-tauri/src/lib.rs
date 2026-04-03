pub mod commands;
pub mod launcher;

use serde::{Deserialize, Serialize};
use std::sync::Mutex;

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
    pub release_date: String,
    pub r#type: String, // "release" | "snapshot"
}

#[derive(Clone, Serialize, Deserialize)]
pub struct LauncherSettings {
    pub jvm_arguments: String,
    pub max_memory: u32,
}

// --- App State ---
pub struct AppState {
    pub versions: Vec<GameVersion>,
    pub mods: Vec<Mod>,
    pub settings: LauncherSettings,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            versions: vec![
                GameVersion {
                    id: "1.20.1".into(),
                    name: "Fabric 1.20.1".into(),
                    release_date: "2023-06-07".into(),
                    r#type: "release".into(),
                },
                GameVersion {
                    id: "1.20.4".into(),
                    name: "Fabric 1.20.4".into(),
                    release_date: "2023-12-07".into(),
                    r#type: "release".into(),
                },
                GameVersion {
                    id: "1.21".into(),
                    name: "Fabric 1.21".into(),
                    release_date: "2024-06-13".into(),
                    r#type: "release".into(),
                },
            ],
            mods: vec![
                Mod {
                    id: "sodium".into(),
                    name: "Sodium".into(),
                    version: "0.5.8".into(),
                    author: "jellysquid3".into(),
                    description: "Modern rendering engine for Minecraft.".into(),
                    enabled: true,
                    icon: None,
                    supported_versions: vec!["1.20.1".into(), "1.20.4".into(), "1.21".into()],
                },
                Mod {
                    id: "iris".into(),
                    name: "Iris".into(),
                    version: "1.7.0".into(),
                    author: "coderbot".into(),
                    description: "A modern shaders mod for Minecraft.".into(),
                    enabled: true,
                    icon: None,
                    supported_versions: vec!["1.20.1".into(), "1.20.4".into(), "1.21".into()],
                },
            ],
            settings: LauncherSettings {
                jvm_arguments: "-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200"
                    .into(),
                max_memory: 4096,
            },
        }
    }
}

type SharedState = Mutex<AppState>;
