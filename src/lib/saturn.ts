import { invoke } from "@tauri-apps/api/core";
import { LauncherSettings, Mod } from "./types";

// --- Mods ---
export async function getInstalledMods(versionId: string): Promise<Mod[]> {
  return await invoke("get_installed_mods", { versionId });
}

export async function toggleMod(modId: string): Promise<void> {
  await invoke("toggle_mod", { modId });
}

export async function discoverMods(query: string): Promise<Mod[]> {
  const allDiscoverable: Mod[] = [
    {
      id: "modmenu",
      name: "Mod Menu",
      version: "7.2.2",
      author: "TerraformersMC",
      description: "Adds a mod menu to view the list of installed mods.",
      enabled: false,
      supported_versions: ["1.20.1", "1.20.4", "1.21"],
    },
    {
      id: "starlight",
      name: "Starlight",
      version: "1.1.2",
      author: "Spottedleaf",
      description: "Rewrites the light engine to fix performance issues.",
      enabled: false,
      supported_versions: ["1.20.1"],
    },
    {
      id: "ferritecore",
      name: "FerriteCore",
      version: "6.0.1",
      author: "malte0811",
      description: "Memory usage optimizations.",
      enabled: false,
      supported_versions: ["1.20.1", "1.20.4", "1.21"],
    },
  ];

  if (!query) return allDiscoverable;

  return allDiscoverable.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()),
  );
}

export async function installMod(
  mod: Mod,
  versionsList: string[],
): Promise<void> {
  await invoke("install_mod", { modItem: mod });
}

// --- Settings ---
export async function getSettings(): Promise<LauncherSettings> {
  return await invoke("get_settings");
}

export async function updateSettings(
  newSettings: Partial<LauncherSettings>,
): Promise<void> {
  await invoke("update_settings", { newSettings });
}

// --- Version ---
export async function getVersion(): Promise<string> {
  return await invoke("get_version");
}

export async function updateVersion(version: string): Promise<void> {
  await invoke("update_version", { version });
}
