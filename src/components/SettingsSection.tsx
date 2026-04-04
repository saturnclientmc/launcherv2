import React, { useState, useEffect } from "react";
import { MemoryStick, Save, RefreshCcw, Info } from "lucide-react";
import { getSettings, updateSettings } from "../lib/saturn";
import { motion } from "framer-motion";
import { LauncherSettings } from "@/lib/types";

const SettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<LauncherSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      const s = await getSettings();
      setSettings(s);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveStatus("Saving...");

    await updateSettings(settings);

    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus("Settings saved");
      setTimeout(() => setSaveStatus(""), 2000);
    }, 1000);
  };

  const handleReset = async () => {
    // In a real app, this would reset to defaults in the service
    const defaultSettings: LauncherSettings = {
      max_memory: 4096,
    };
    setSettings(defaultSettings);
  };

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-saturn-border pb-6">
        <div>
          <h1 className="text-2xl font-bold">Performance Settings</h1>
          <p className="text-sm text-saturn-text-secondary">
            Configure how Saturn Client interacts with your hardware.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="p-2 text-saturn-text-secondary hover:text-white transition-colors"
            title="Reset to Defaults"
          >
            <RefreshCcw size={20} />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 py-2 px-6 text-sm font-bold"
          >
            <Save size={16} />
            {saveStatus || "SAVE SETTINGS"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Memory Allocation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel p-6 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-saturn-accent/10 flex items-center justify-center text-saturn-accent">
              <MemoryStick size={18} />
            </div>
            <h2 className="text-lg font-bold">Memory Allocation</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Maximum Memory (RAM)</span>
              <span className="text-lg font-bold text-saturn-accent">
                {(settings.max_memory / 1024).toFixed(1)} GB
              </span>
            </div>

            <input
              type="range"
              min="1024"
              max="16384"
              step="512"
              value={settings.max_memory}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  max_memory: parseInt(e.target.value),
                })
              }
              className="w-full h-2 bg-saturn-border rounded-lg appearance-none cursor-pointer accent-saturn-accent"
            />

            <div className="relative w-full mt-2 h-6">
              {[1024, 4096, 8192, 12288, 16384].map((value) => {
                const percent =
                  (((value - 1024) / (16384 - 1024)) * 100 - 50) * 0.97 + 50;

                return (
                  <span
                    key={value}
                    className="absolute text-[10px] text-saturn-text-secondary font-bold uppercase tracking-widest -translate-x-1/2 whitespace-nowrap"
                    style={{ left: `${percent}%` }}
                  >
                    {value / 1024} GB
                  </span>
                );
              })}
            </div>

            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex gap-3">
              <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300/80 leading-relaxed">
                Allocating too much memory can cause system instability, while
                too little can lead to performance issues or crashes. 4GB - 8GB
                is recommended for most users.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsSection;
