import React, { useState, useEffect } from "react";
import {
  Play,
  Puzzle,
  Settings,
  ChevronDown,
  Check,
  User,
  LogOut,
} from "lucide-react";
import { launcherService, type GameVersion } from "./services/LauncherService";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Components
import PlaySection from "./components/PlaySection";
import ModsSection from "./components/ModsSection";
import SettingsSection from "./components/SettingsSection";

type Section = "play" | "mods" | "settings";

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>("play");
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<GameVersion | null>(
    null,
  );
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const versionRef = React.useRef<HTMLDivElement | null>(null);
  const accountRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      const v = await launcherService.getVersions();
      setVersions(v);
      if (v.length > 0) setSelectedVersion(v[0]);
    };
    fetchVersions();
  }, []);

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

  return (
    <div className="flex h-screen w-screen bg-saturn-bg text-saturn-text-primary overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-16 border-r border-saturn-border flex flex-col items-center py-6 gap-6 bg-saturn-panel/50">
        <div>
          <img src="/logo.png" alt="Saturn Logo" className="w-10 h-10" />
        </div>

        <nav className="flex flex-col gap-4 h-full">
          <button
            onClick={() => setActiveSection("play")}
            className={cn("sidebar-icon", activeSection === "play" && "active")}
            title="Play"
          >
            <Play
              size={22}
              fill={activeSection === "play" ? "currentColor" : "none"}
            />
          </button>

          <button
            onClick={() => setActiveSection("mods")}
            className={cn("sidebar-icon", activeSection === "mods" && "active")}
            title="Mods"
          >
            <Puzzle
              size={22}
              fill={activeSection === "mods" ? "currentColor" : "none"}
            />
          </button>

          <button
            onClick={() => setActiveSection("settings")}
            className={cn(
              "sidebar-icon",
              activeSection === "settings" && "active",
            )}
            title="Settings"
          >
            <Settings
              size={22}
              fill={activeSection === "settings" ? "currentColor" : "none"}
            />
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-saturn-border flex items-center justify-between px-6 bg-saturn-panel/30 backdrop-blur-md z-100 py-10">
          {/* Version Selector */}
          <div ref={versionRef} className="relative">
            <div className="relative group overflow-visible inline-block">
              {/* Glow */}
              <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-md blur opacity-25 group-hover:opacity-50 transition duration-500 pointer-events-none" />

              <button
                onClick={() => {
                  setIsVersionDropdownOpen((prev) => !prev);
                  setIsAccountDropdownOpen(false);
                }}
                className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-md btn-primary text-sm font-medium"
              >
                <span>{selectedVersion?.name || "Loading..."}</span>

                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform",
                    isVersionDropdownOpen && "rotate-180",
                  )}
                />
              </button>
            </div>

            <div
              className={cn(
                "absolute top-full left-0 mt-2 w-48 bg-saturn-panel border border-saturn-border rounded-lg shadow-2xl z-50 py-1 overflow-hidden transition-all duration-200 origin-top",
                isVersionDropdownOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
              )}
            >
              {versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVersion(v);
                    setIsVersionDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-saturn-accent/10 hover:text-saturn-accent transition-colors"
                >
                  <span>{v.name}</span>
                  {selectedVersion?.id === v.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Account Selector */}
          <div ref={accountRef} className="relative group overflow-visible">
            {/* Glow */}
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition pointer-events-none duration-700" />

            <button
              className="relative z-10 flex items-center gap-3 pl-20 pr-4 py-2 rounded-lg btn-primary"
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            >
              {/* Avatar */}
              <div className="absolute -top-2 left-4 group-hover:scale-110 transition-transform duration-700 w-12 overflow-hidden z-20">
                <img
                  src="https://render.crafty.gg/3d/bust/Kr4ight"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="leading-tight">
                <p className="text-[10px] text-white/80 uppercase tracking-wide">
                  Playing as
                </p>
                <p className="text-sm font-bold text-white">SaturnDev</p>
              </div>
            </button>

            <div
              className={cn(
                "absolute top-full right-0 mt-2 w-48 bg-saturn-panel border border-saturn-border rounded-lg shadow-2xl z-50 py-1 overflow-hidden transition-all duration-200 origin-top",
                isAccountDropdownOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
              )}
            >
              <div className="px-4 py-3 border-b border-saturn-border">
                <p className="text-sm font-bold">SaturnDev</p>
                <p className="text-xs text-saturn-text-secondary truncate">
                  dev@saturnclient.com
                </p>
              </div>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                <User size={14} />
                <span>Switch Account</span>
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-500/10 text-red-400 transition-colors">
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8">
          {activeSection === "play" && selectedVersion && (
            <PlaySection version={selectedVersion} />
          )}
          {activeSection === "mods" && selectedVersion && (
            <ModsSection version={selectedVersion} />
          )}
          {activeSection === "settings" && <SettingsSection />}
        </div>
      </main>
    </div>
  );
};

export default App;
