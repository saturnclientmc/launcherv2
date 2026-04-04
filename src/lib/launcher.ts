import { invoke } from "@tauri-apps/api/core";

/**
 * Launch the game with the selected account and version
 */
export async function launch() {
  return await invoke("launch_game");
}
