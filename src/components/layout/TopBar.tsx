import VersionDropdown from "./VersionDropdown";
import AccountDropdown from "./AccountDropdown";
import { GameVersion } from "@/lib/types";

interface Props {
  versions: GameVersion[];
  selectedVersion: GameVersion | null;
  setSelectedVersion: (v: GameVersion) => void;

  versionOpen: boolean;
  setVersionOpen: (v: boolean) => void;

  accountOpen: boolean;
  setAccountOpen: (v: boolean) => void;
}

export default function TopBar(props: Props) {
  return (
    <header className="h-14 flex justify-between items-center px-6 border-b">
      <VersionDropdown
        versions={props.versions}
        selected={props.selectedVersion}
        onSelect={props.setSelectedVersion}
        open={props.versionOpen}
        setOpen={props.setVersionOpen}
      />

      <AccountDropdown
        open={props.accountOpen}
        setOpen={props.setAccountOpen}
      />
    </header>
  );
}
