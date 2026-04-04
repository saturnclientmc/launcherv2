import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import PlaySection from "./components/PlaySection";
import ModsSection from "./components/ModsSection";
import SettingsSection from "./components/SettingsSection";
import { versions } from "./lib/launcher";
import { GameVersion } from "./lib/types";
import { MinecraftAccount } from "./lib/auth";
import { getVersion, updateVersion } from "./lib/saturn";

type Section = "play" | "mods" | "settings";

export default function App() {
  const [active, setActive] = useState<Section>("play");
  const [selectedVersion, setSelectedVersion] = useState<GameVersion | null>(
    null,
  );

  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const versionRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const [accounts, setAccounts] = useState<MinecraftAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<MinecraftAccount | null>(
    null,
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Close version dropdown if clicked outside
      if (versionRef.current && !versionRef.current.contains(target)) {
        setIsVersionDropdownOpen(false);
      }

      // Close account dropdown if clicked outside
      if (accountRef.current && !accountRef.current.contains(target)) {
        setIsAccountDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const version = await getVersion();
      setSelectedVersion(versions.find((v) => v.id == version) || null);
    })();
  }, []);

  useEffect(() => {
    if (selectedVersion?.id) updateVersion(selectedVersion?.id);
  }, [selectedVersion]);

  return (
    <div className="flex h-screen">
      <Sidebar active={active} setActive={setActive} />

      <main className="flex-1 flex flex-col">
        <TopBar
          versions={versions}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          isVersionDropdownOpen={isVersionDropdownOpen}
          setIsVersionDropdownOpen={setIsVersionDropdownOpen}
          isAccountDropdownOpen={isAccountDropdownOpen}
          setIsAccountDropdownOpen={setIsAccountDropdownOpen}
          versionRef={versionRef}
          accountRef={accountRef}
          accounts={accounts}
          setAccounts={setAccounts}
          activeAccount={activeAccount}
          setActiveAccount={setActiveAccount}
        />

        <div className="flex-1 p-8 overflow-y-scroll">
          {active === "play" && (
            <PlaySection version={selectedVersion} account={activeAccount} />
          )}
          {active === "mods" && selectedVersion && (
            <ModsSection version={selectedVersion} />
          )}
          {active === "settings" && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}
