import { invoke } from "@tauri-apps/api/core";
import { GameVersion } from "./types";
import { MinecraftAccount } from "./auth";

export const versions: GameVersion[] = [
  {
    id: "1.21.4",
    name: "Fabric 1.21.4",
    loader_version: "0.19.0",
  },
  {
    id: "1.21.5",
    name: "Fabric 1.21.5",
    loader_version: "0.19.0",
  },
  {
    id: "1.21.6",
    name: "Fabric 1.21.6",
    loader_version: "0.19.0",
  },
  {
    id: "1.21.7",
    name: "Fabric 1.21.7",
    loader_version: "0.19.0",
  },
  {
    id: "1.21.8",
    name: "Fabric 1.21.8",
    loader_version: "0.19.0",
  },
  {
    id: "1.21.9",
    name: "Fabric 1.21.9",
    loader_version: "0.19.0",
  },
  {
    id: "1.21.10",
    name: "Fabric 1.21.10",
    loader_version: "0.19.0",
  },
  {
    id: "1.21.11",
    name: "Fabric 1.21.11",
    loader_version: "0.19.0",
  },
];

/**
 * Launch the game with the selected account and version
 */
export async function launch(version: GameVersion, account: MinecraftAccount) {
  return await invoke("launch_game", { version, account });
}
