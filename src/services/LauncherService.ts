// Saturn Client Launcher Centralized Service Layer
// Handles all data fetching, mod management, and launch logic.

export interface Mod {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  enabled: boolean;
  icon?: string;
  supportedVersions: string[];
}

export interface GameVersion {
  id: string;
  name: string;
  releaseDate: string;
  type: 'release' | 'snapshot';
}

export interface LauncherSettings {
  jvmArguments: string;
  maxMemory: number; // in MB
}

class LauncherService {
  private versions: GameVersion[] = [
    { id: '1.20.1', name: 'Fabric 1.20.1', releaseDate: '2023-06-07', type: 'release' },
    { id: '1.20.4', name: 'Fabric 1.20.4', releaseDate: '2023-12-07', type: 'release' },
    { id: '1.21', name: 'Fabric 1.21', releaseDate: '2024-06-13', type: 'release' },
  ];

  private installedMods: Mod[] = [
    { 
      id: 'sodium', 
      name: 'Sodium', 
      version: '0.5.8', 
      author: 'jellysquid3', 
      description: 'Modern rendering engine for Minecraft.', 
      enabled: true, 
      supportedVersions: ['1.20.1', '1.20.4', '1.21'] 
    },
    { 
      id: 'iris', 
      name: 'Iris', 
      version: '1.7.0', 
      author: 'coderbot', 
      description: 'A modern shaders mod for Minecraft.', 
      enabled: true, 
      supportedVersions: ['1.20.1', '1.20.4', '1.21'] 
    },
    { 
      id: 'lithium', 
      name: 'Lithium', 
      version: '0.11.2', 
      author: 'jellysquid3', 
      description: 'General-purpose optimization mod for Minecraft.', 
      enabled: false, 
      supportedVersions: ['1.20.1', '1.20.4'] 
    },
  ];

  private settings: LauncherSettings = {
    jvmArguments: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200',
    maxMemory: 4096,
  };

  // --- Versions ---
  async getVersions(): Promise<GameVersion[]> {
    return [...this.versions];
  }

  // --- Mods ---
  async getInstalledMods(versionId: string): Promise<Mod[]> {
    // Filter mods by supported version
    return this.installedMods.filter(mod => mod.supportedVersions.includes(versionId));
  }

  async toggleMod(modId: string): Promise<void> {
    const mod = this.installedMods.find(m => m.id === modId);
    if (mod) {
      mod.enabled = !mod.enabled;
    }
  }

  async discoverMods(query: string): Promise<Mod[]> {
    // Mock discovery results
    const allDiscoverable: Mod[] = [
      { id: 'modmenu', name: 'Mod Menu', version: '7.2.2', author: 'TerraformersMC', description: 'Adds a mod menu to view the list of installed mods.', enabled: false, supportedVersions: ['1.20.1', '1.20.4', '1.21'] },
      { id: 'starlight', name: 'Starlight', version: '1.1.2', author: 'Spottedleaf', description: 'Rewrites the light engine to fix performance issues.', enabled: false, supportedVersions: ['1.20.1'] },
      { id: 'ferritecore', name: 'FerriteCore', version: '6.0.1', author: 'malte0811', description: 'Memory usage optimizations.', enabled: false, supportedVersions: ['1.20.1', '1.20.4', '1.21'] },
    ];
    
    if (!query) return allDiscoverable;
    return allDiscoverable.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));
  }

  async installMod(mod: Mod, versions: string[]): Promise<void> {
    console.log(`Installing ${mod.name} to versions: ${versions.join(', ')}`);
    // Mock install logic: add to installedMods if not already there
    if (!this.installedMods.find(m => m.id === mod.id)) {
      this.installedMods.push({ ...mod, enabled: true, supportedVersions: versions });
    }
  }

  // --- Settings ---
  async getSettings(): Promise<LauncherSettings> {
    return { ...this.settings };
  }

  async updateSettings(newSettings: Partial<LauncherSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
  }

  // --- Launch ---
  async launchGame(versionId: string): Promise<{ success: boolean; message: string }> {
    console.log(`Launching Saturn Client with version ${versionId}...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Game launched successfully!' });
      }, 2000);
    });
  }
}

export const launcherService = new LauncherService();
