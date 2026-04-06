use std::{collections::HashMap, fs, path::PathBuf};

use lyceris::auth::microsoft::MinecraftAccount;
use tauri::State;

use crate::{features::Feature, launcher::launcher_dir, GameVersion, SharedState};

pub struct InstanceSync {}

impl Default for InstanceSync {
    fn default() -> Self {
        Self {}
    }
}

impl Feature for InstanceSync {
    fn launch(
        &mut self,
        state: &State<'_, SharedState>,
        version: &GameVersion,
        _account: &MinecraftAccount,
    ) -> super::FeatureResult {
        if state.lock().unwrap().settings.features.sync_options {
            sync_to_instance(version).map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    fn after_launch(
        &mut self,
        state: &State<'_, SharedState>,
        version: &GameVersion,
        _account: &MinecraftAccount,
    ) -> super::FeatureResult {
        if state.lock().unwrap().settings.features.sync_options {
            sync_back_from_instance(version).map_err(|e| e.to_string())?;
        }

        Ok(())
    }
}

fn sync_to_instance(version: &GameVersion) -> std::io::Result<()> {
    let global_path = options_path_global();
    let instance_path = options_path_instance(version);

    if !global_path.exists() {
        if let Ok(instance_content) = fs::read_to_string(instance_path) {
            fs::write(global_path, instance_content)?;
        }

        return Ok(());
    }

    let global_content = fs::read_to_string(global_path)?;

    // Ensure instance dir exists
    if let Some(parent) = instance_path.parent() {
        fs::create_dir_all(parent)?;
    }

    fs::write(instance_path, global_content)?;

    Ok(())
}

fn sync_back_from_instance(version: &GameVersion) -> std::io::Result<()> {
    let global_path = options_path_global();
    let instance_path = options_path_instance(version);

    let global_content = fs::read_to_string(&global_path)?;
    let instance_content = fs::read_to_string(&instance_path)?;

    let mut global_map = parse_options(&global_content);
    let instance_map = parse_options(&instance_content);

    // Only apply changes (ignore deletions)
    for (key, instance_value) in instance_map {
        match global_map.get(&key) {
            Some(global_value) if global_value == &instance_value => {}
            _ => {
                // changed or new → update global
                global_map.insert(key, instance_value);
            }
        }
    }

    fs::write(global_path, serialize_options(&global_map))?;

    Ok(())
}

fn options_path_global() -> PathBuf {
    launcher_dir().join("options.txt")
}

fn options_path_instance(version: &GameVersion) -> PathBuf {
    launcher_dir().join(&version.id).join("options.txt")
}

fn parse_options(content: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();

    for line in content.lines() {
        if line.trim().is_empty() {
            continue;
        }

        if let Some((key, value)) = line.split_once(':') {
            map.insert(key.to_string(), value.to_string());
        }
    }

    map
}

fn serialize_options(map: &HashMap<String, String>) -> String {
    map.iter()
        .map(|(k, v)| format!("{k}:{v}"))
        .collect::<Vec<_>>()
        .join("\n")
}
