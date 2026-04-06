use std::collections::HashMap;

use lyceris::auth::microsoft::MinecraftAccount;

use crate::{features::Feature, GameVersion};

pub struct InstanceSync {}

impl Default for InstanceSync {
    fn default() -> Self {
        Self {}
    }
}

impl Feature for InstanceSync {
    fn launch(
        &mut self,
        version: &GameVersion,
        account: &MinecraftAccount,
    ) -> super::FeatureResult {
        println!("Launching {} for {}", version.id, account.username);

        Ok(())
    }

    fn after_launch(
        &mut self,
        version: &GameVersion,
        account: &MinecraftAccount,
    ) -> super::FeatureResult {
        println!("Game launched!");

        Ok(())
    }
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
