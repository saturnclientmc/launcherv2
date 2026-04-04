import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Trash2,
  Package,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import {
  getInstalledMods,
  discoverMods,
  enableMod,
  installMod,
  disableMod,
} from "@/lib/saturn";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { GameVersion, Mod } from "@/lib/types";
import { versions } from "@/lib/launcher";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModsSectionProps {
  version: GameVersion;
}

const ModsSection: React.FC<ModsSectionProps> = ({ version }) => {
  const [activeTab, setActiveTab] = useState<"installed" | "discover">(
    "installed",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [mods, setMods] = useState<Mod[]>([]);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [selectedModForInstall, setSelectedModForInstall] =
    useState<Mod | null>(null);
  const [selectedVersionsForInstall, setSelectedVersionsForInstall] = useState<
    string[]
  >([]);

  const loadMods = async () => {
    if (activeTab === "installed") {
      const m = await getInstalledMods(version.id);
      setMods(m);
    } else {
      const m = await discoverMods(searchQuery);
      if (activeTab === "discover") {
        // Fix: If discover mods takes too long and the user switches tabs it glitches
        setMods(m);
      }
    }
  };

  useEffect(() => {
    const id = setTimeout(loadMods, 800);
    return () => clearTimeout(id);
  }, [version.id, searchQuery]);

  useEffect(() => {
    setMods([]);
    loadMods();
  }, [activeTab]);

  const handleToggleMod = async (modId: string, enable: boolean) => {
    if (enable) await enableMod(version.id, modId);
    else await disableMod(version.id, modId);
    const m = await getInstalledMods(version.id);
    setMods(m);
  };

  const openInstallDialog = (mod: Mod) => {
    setSelectedModForInstall(mod);
    setSelectedVersionsForInstall([version.id]);
    setIsInstallDialogOpen(true);
  };

  const handleInstall = async () => {
    if (selectedModForInstall && selectedVersionsForInstall.length > 0) {
      await installMod(selectedModForInstall, selectedVersionsForInstall);
      setIsInstallDialogOpen(false);
      if (activeTab === "installed") {
        const m = await getInstalledMods(version.id);
        setMods(m);
      }
    }
  };

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersionsForInstall((prev) =>
      prev.includes(versionId)
        ? prev.filter((v) => v !== versionId)
        : [...prev, versionId],
    );
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-saturn-panel border border-saturn-border rounded-lg">
          <button
            onClick={() => setActiveTab("installed")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === "installed"
                ? "bg-white/5 text-white"
                : "text-saturn-text-secondary hover:text-white",
            )}
          >
            Installed Mods
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === "discover"
                ? "bg-white/5 text-white"
                : "text-saturn-text-secondary hover:text-white",
            )}
          >
            Discover
          </button>
        </div>

        <div className="relative group">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-saturn-text-secondary group-focus-within:text-saturn-accent transition-colors"
          />
          <input
            type="text"
            placeholder={
              activeTab === "installed"
                ? "Search installed mods..."
                : "Search CurseForge/Modrinth..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-saturn-panel border border-saturn-border rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-saturn-accent/50 focus:ring-1 focus:ring-saturn-accent/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 gap-3">
          {mods.map((mod) => (
            <motion.div
              layout
              key={mod.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="panel p-4 flex items-center gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-saturn-border flex items-center justify-center shrink-0">
                {mod.icon ? (
                  <img
                    src={mod.icon}
                    alt="Mod Icon"
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  <Package size={24} className="text-saturn-text-secondary" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm truncate">{mod.name}</h3>
                  <span className="text-[10px] text-saturn-text-secondary font-medium px-1.5 py-0.5 rounded bg-white/5">
                    v{mod.version}
                  </span>
                  <span className="text-[10px] text-saturn-text-secondary">
                    by {mod.author}
                  </span>
                </div>
                <p className="text-xs text-saturn-text-secondary mt-1 truncate max-w-xl">
                  {mod.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {activeTab === "installed" ? (
                  <>
                    <button
                      onClick={() => handleToggleMod(mod.id, !mod.enabled)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        mod.enabled
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20",
                      )}
                    >
                      {mod.enabled ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {mod.enabled ? "Enabled" : "Disabled"}
                    </button>
                    <button className="p-2 text-saturn-text-secondary hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openInstallDialog(mod)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-saturn-accent/10 text-saturn-accent hover:bg-saturn-accent hover:text-white rounded-md text-xs font-bold transition-all border border-saturn-accent/20"
                  >
                    <Download size={14} />
                    INSTALL
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {mods.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-saturn-text-secondary opacity-50">
              <Package size={48} className="mb-4" strokeWidth={1} />
              <p>No mods found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Install Dialog */}
      <AnimatePresence>
        {isInstallDialogOpen && selectedModForInstall && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-saturn-panel border border-saturn-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-saturn-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Install {selectedModForInstall.name}
                  </h2>
                  <p className="text-xs text-saturn-text-secondary">
                    Select versions to install this mod to.
                  </p>
                </div>
                <button
                  onClick={() => setIsInstallDialogOpen(false)}
                  className="text-saturn-text-secondary hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
                {versions.map((v) => {
                  const isSupported =
                    selectedModForInstall.supported_versions.includes(v.id);
                  const isSelected = selectedVersionsForInstall.includes(v.id);

                  return (
                    <div
                      key={v.id}
                      onClick={() =>
                        isSupported && toggleVersionSelection(v.id)
                      }
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                        isSelected
                          ? "bg-saturn-accent/10 border-saturn-accent/50"
                          : "bg-white/5 border-transparent hover:border-white/10",
                        !isSupported &&
                          "opacity-40 cursor-not-allowed grayscale",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-saturn-accent border-saturn-accent"
                              : "border-saturn-border",
                          )}
                        >
                          {isSelected && (
                            <CheckCircle2 size={14} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{v.name}</span>
                      </div>
                      {!isSupported && (
                        <span className="text-[10px] text-red-400 font-bold uppercase">
                          Unsupported
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-6 bg-white/5 flex gap-3">
                <button
                  onClick={() => setIsInstallDialogOpen(false)}
                  className="flex-1 py-2 text-sm font-medium hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInstall}
                  disabled={selectedVersionsForInstall.length === 0}
                  className="flex-1 py-2 text-sm font-bold bg-saturn-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg shadow-saturn-accent/20"
                >
                  Confirm Install
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModsSection;
