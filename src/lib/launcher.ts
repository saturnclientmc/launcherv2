import { invoke } from "@tauri-apps/api/core";
import { GameVersion } from "./types";
import { MinecraftAccount } from "./auth";

/**
 * Launch the game with the selected account and version
 */
export async function launch(version: GameVersion, account: MinecraftAccount) {
  return await invoke("launch_game", { version, account });
}
