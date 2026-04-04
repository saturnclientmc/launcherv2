import { MinecraftAccount } from "@/lib/auth";
import { GameVersion } from "@/lib/types";

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export interface Props {
  versions: GameVersion[];
  selectedVersion: GameVersion | null;
  setSelectedVersion: SetState<GameVersion | null>;

  isVersionDropdownOpen: boolean;
  setIsVersionDropdownOpen: SetState<boolean>;

  isAccountDropdownOpen: boolean;
  setIsAccountDropdownOpen: SetState<boolean>;

  versionRef: React.RefObject<HTMLDivElement | null>;
  accountRef: React.RefObject<HTMLDivElement | null>;

  accounts: MinecraftAccount[];
  setAccounts: SetState<MinecraftAccount[]>;

  activeAccount: MinecraftAccount | null;
  setActiveAccount: SetState<MinecraftAccount | null>;
}
