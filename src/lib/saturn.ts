import { invoke } from "@tauri-apps/api/core";
import { LauncherSettings, Mod } from "./types";

// --- Mods ---
export async function getInstalledMods(versionId: string): Promise<Mod[]> {
  return await invoke("get_installed_mods", { versionId });
}

export async function enableMod(version: string, modId: string): Promise<void> {
  await invoke("enable_mod", { version, fileName: modId });
}

export async function disableMod(
  version: string,
  modId: string,
): Promise<void> {
  await invoke("disable_mod", { version, fileName: modId });
}

export async function removeMod(
  version: string,
  modId: string,
): Promise<void> {
  await invoke("remove_mod", { version, fileName: modId });
}

export async function discoverMods(query: string): Promise<Mod[]> {
  const url = new URL("https://api.modrinth.com/v2/search");

  if (query) {
    url.searchParams.set("query", query);
  }

  // Optional but recommended filters
  url.searchParams.set("facets", JSON.stringify([["project_type:mod"]]));
  url.searchParams.set("limit", "20");

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error("Failed to fetch mods from Modrinth");
  }

  const data = await res.json();

  return data.hits.map(
    (mod: any): Mod => ({
      id: mod.project_id,
      name: mod.title,
      version: "latest",
      author: mod.author,
      description: mod.description,
      enabled: false,
      icon: mod.icon_url,
      supported_versions: mod.versions || [],
    }),
  );
}

export async function installMod(mod: Mod, versions: string[]): Promise<void> {
  await invoke("install_mod", { modMeta: mod, versions });
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

export async function installPaths(version: string, paths: string[]): Promise<void> {
  await invoke("install_paths", { version, paths });
}
