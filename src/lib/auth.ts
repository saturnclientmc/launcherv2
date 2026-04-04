import { invoke } from "@tauri-apps/api/core";

/**
 * Create Microsoft login URL
 */
export async function authCreateLink(): Promise<string> {
  return await invoke("auth_create_link");
}

/**
 * Exchange auth code for account
 */
export async function authLogin(code: string) {
  return await invoke("auth_login", { code });
}

/**
 * Refresh account by UUID
 */
export async function authRefresh(uuid: string) {
  return await invoke("auth_refresh", { uuid });
}

/**
 * Get all stored accounts
 */
export async function authList() {
  return await invoke("auth_list");
}

/**
 * Remove account by UUID
 */
export async function authRemove(uuid: string) {
  return await invoke("auth_remove", { uuid });
}

/**
 * Validate token (not expired)
 */
export async function authValidate(uuid: string): Promise<boolean> {
  return await invoke("auth_validate", { uuid });
}

/**
 * Get valid account (auto-refresh if needed)
 */
export async function authGetValid(uuid: string) {
  return await invoke("auth_get_valid", { uuid });
}
