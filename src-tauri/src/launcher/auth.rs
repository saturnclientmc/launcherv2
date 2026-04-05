use std::{fs, path::PathBuf};

use reqwest::Client;
use tauri::{command, AppHandle, Emitter, Manager, Url};

use lyceris::auth::microsoft::{authenticate, create_link, refresh, validate, MinecraftAccount};

use crate::launcher::launcher_dir;

fn accounts_path() -> PathBuf {
    launcher_dir().join("accounts.json")
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

fn extract_code(url: &str) -> Option<String> {
    Url::parse(url)
        .ok()?
        .query_pairs()
        .find(|(key, _)| key == "code")
        .map(|(_, value)| value.to_string())
}

#[command]
pub fn auth_create_link(app: AppHandle) -> Result<String, String> {
    let link = create_link().map_err(|e| e.to_string())?;

    let url = link.parse::<Url>().map_err(|e| e.to_string())?;

    let app_handle = app.clone();

    std::thread::spawn(move || {
        tauri::WebviewWindowBuilder::new(&app, "auth", tauri::WebviewUrl::External(url))
            .title("Microsoft Login")
            .inner_size(500.0, 700.0)
            .resizable(false)
            .on_navigation(move |nav_url| {
                let url_str = nav_url.to_string();

                // Check for auth code
                if url_str.contains("code=") {
                    if let Some(code) = extract_code(&url_str) {
                        println!("Auth code received: {}", code);

                        let _ = app_handle.emit("auth-code", code);

                        if let Some(win) = app_handle.get_webview_window("auth") {
                            let _ = win.close();
                        }
                    }
                }

                // Always allow navigation
                true
            })
            .build()
            .map_err(|e| e.to_string())
            .unwrap();
    });

    Ok(link)
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
