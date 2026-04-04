use std::{fs, path::PathBuf};

use reqwest::Client;
use tauri::command;

use lyceris::auth::microsoft::{authenticate, create_link, refresh, validate, MinecraftAccount};

use crate::launcher::LAUNCHER_DIR;

fn accounts_path() -> PathBuf {
    LAUNCHER_DIR.data_dir().join("accounts.json")
}

fn load_accounts() -> Vec<MinecraftAccount> {
    let path = accounts_path();

    if !path.exists() {
        return vec![];
    }

    let data = fs::read_to_string(path).unwrap_or_default();
    serde_json::from_str(&data).unwrap_or_default()
}

fn save_accounts(accounts: &[MinecraftAccount]) -> Result<(), String> {
    let path = accounts_path();

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let data = serde_json::to_string_pretty(accounts).map_err(|e| e.to_string())?;

    fs::write(path, data).map_err(|e| e.to_string())
}

#[command]
pub fn auth_create_link() -> Result<String, String> {
    create_link().map_err(|e| e.to_string())
}

#[command]
pub async fn auth_login(code: String) -> Result<MinecraftAccount, String> {
    let client = Client::new();

    let account = authenticate(code, &client)
        .await
        .map_err(|e| e.to_string())?;

    let mut accounts = load_accounts();

    // Replace if same UUID exists
    accounts.retain(|a| a.uuid != account.uuid);
    accounts.push(account.clone());

    save_accounts(&accounts)?;

    Ok(account)
}

#[command]
pub async fn auth_refresh(uuid: String) -> Result<MinecraftAccount, String> {
    let client = Client::new();
    let mut accounts = load_accounts();

    let account = accounts
        .iter()
        .find(|a| a.uuid == uuid)
        .cloned()
        .ok_or("Account not found")?;

    let refreshed = refresh(account.refresh_token, &client)
        .await
        .map_err(|e| e.to_string())?;

    accounts.retain(|a| a.uuid != uuid);
    accounts.push(refreshed.clone());

    save_accounts(&accounts)?;

    Ok(refreshed)
}

#[command]
pub fn auth_list() -> Result<Vec<MinecraftAccount>, String> {
    Ok(load_accounts())
}

#[command]
pub fn auth_remove(uuid: String) -> Result<(), String> {
    let mut accounts = load_accounts();

    accounts.retain(|a| a.uuid != uuid);

    save_accounts(&accounts)
}

#[command]
pub fn auth_validate(uuid: String) -> Result<bool, String> {
    let accounts = load_accounts();

    let account = accounts
        .iter()
        .find(|a| a.uuid == uuid)
        .ok_or("Account not found")?;

    Ok(validate(account.exp))
}

#[command]
pub async fn auth_get_valid(uuid: String) -> Result<MinecraftAccount, String> {
    let client = Client::new();
    let mut accounts = load_accounts();

    let account = accounts
        .iter()
        .find(|a| a.uuid == uuid)
        .cloned()
        .ok_or("Account not found")?;

    if validate(account.exp) {
        return Ok(account);
    }

    let refreshed = refresh(account.refresh_token, &client)
        .await
        .map_err(|e| e.to_string())?;

    accounts.retain(|a| a.uuid != uuid);
    accounts.push(refreshed.clone());

    save_accounts(&accounts)?;

    Ok(refreshed)
}
