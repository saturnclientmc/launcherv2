import { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import PlaySection from "./components/PlaySection";
import ModsSection from "./components/ModsSection";
import SettingsSection from "./components/SettingsSection";
import { getVersions } from "./lib/saturn";
import { GameVersion } from "./lib/types";

type Section = "play" | "mods" | "settings";

export default function App() {
  const [active, setActive] = useState<Section>("play");
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<GameVersion | null>(
    null,
  );

  const [versionOpen, setVersionOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    getVersions().then((v) => {
      setVersions(v);
      if (v.length) setSelectedVersion(v[0]);
    });
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar active={active} setActive={setActive} />

      <main className="flex-1 flex flex-col">
        <TopBar
          versions={versions}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          versionOpen={versionOpen}
          setVersionOpen={setVersionOpen}
          accountOpen={accountOpen}
          setAccountOpen={setAccountOpen}
        />

        <div className="flex-1 p-8">
          {active === "play" && selectedVersion && (
            <PlaySection version={selectedVersion} />
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
