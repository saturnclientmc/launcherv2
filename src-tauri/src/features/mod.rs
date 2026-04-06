use lyceris::auth::microsoft::MinecraftAccount;
use tauri::State;
use tokio::sync::Mutex;

use crate::{features::instance_sync::InstanceSync, GameVersion, SharedState};

mod instance_sync;

pub type FeatureResult = Result<(), String>;

#[allow(unused_variables)]
pub trait Feature: Send + Sync {
    fn launch(
        &mut self,
        state: &State<'_, SharedState>,
        version: &GameVersion,
        account: &MinecraftAccount,
    ) -> FeatureResult {
        Ok(())
    }
    fn after_launch(
        &mut self,
        state: &State<'_, SharedState>,
        version: &GameVersion,
        account: &MinecraftAccount,
    ) -> FeatureResult {
        Ok(())
    }
}

pub struct FeatureState(Mutex<Vec<Box<dyn Feature>>>);

impl FeatureState {
    pub fn new() -> Self {
        Self(Mutex::new(vec![Box::new(InstanceSync::default())]))
    }
}

impl FeatureState {
    pub async fn launch(
        &self,
        state: &State<'_, SharedState>,
        version: &GameVersion,
        account: &MinecraftAccount,
    ) -> FeatureResult {
        for feature in self.0.lock().await.iter_mut() {
            feature.launch(state, version, account)?;
        }

        Ok(())
    }

    pub async fn after_launch(
        &self,
        state: &State<'_, SharedState>,
        version: &GameVersion,
        account: &MinecraftAccount,
    ) -> FeatureResult {
        for feature in self.0.lock().await.iter_mut() {
            feature.after_launch(state, version, account)?;
        }

        Ok(())
    }
}
