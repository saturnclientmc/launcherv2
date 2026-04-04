export interface Mod {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  enabled: boolean;
  icon?: string;
  supported_versions: string[];
}

export interface GameVersion {
  id: string;
  name: string;
}

export interface LauncherSettings {
  jvm_arguments: string;
  max_memory: number;
}
