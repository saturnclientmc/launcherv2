import React, { useState, useEffect } from "react";
import { Save, RefreshCcw, Info } from "lucide-react";
import { getSettings, updateSettings } from "../lib/saturn";
import { LauncherSettings } from "@/lib/types";

export type SettingType = "slider" | "toggle" | "input";

export interface SettingSchemaItem {
  key: keyof LauncherSettings;
  label: string;
  description?: string;
  type: SettingType;

  // Slider-specific
  min?: number;
  max?: number;
  step?: number;
  format?: (value: any) => string;
  ticks?: number[];
  info?: string;

  // Default value
  default: any;
}

export const settingsSchema: SettingSchemaItem[] = [
  {
    key: "max_memory",
    label: "Maximum Memory (RAM)",
    type: "slider",
    min: 1024,
    max: 16384,
    step: 512,
    default: 2048,

    format: (v) => `${(v / 1024).toFixed(1)} GB`,

    ticks: [1024, 4096, 8192, 12288, 16384],

    info: `Allocating too much memory can cause system instability, while too little can lead to performance issues or crashes. 2GB - 8GB is recommended for most users.`,
  },
];

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
    setSettings(Object.fromEntries(settingsSchema.map((v) => [v.key, v.default])) as LauncherSettings);
  };

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-saturn-border pb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-saturn-text-secondary">
            Configure how Saturn Launcher launches your game
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
        {settingsSchema.map((item) => {
          const value = settings[item.key];

          return (
            <div key={String(item.key)} className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.label}</span>
                {item.format && (
                  <span className="text-lg font-bold text-saturn-accent">
                    {item.format(value)}
                  </span>
                )}
              </div>

              {item.type === "slider" && (
                <>
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={value}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        [item.key]: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-saturn-border rounded-lg appearance-none cursor-pointer accent-saturn-accent"
                  />

                  {/* Tick labels */}
                  {item.ticks && (
                    <div className="relative w-full mt-2 h-6">
                      {item.ticks.map((tick) => {
                        const percent =
                          (((tick - item.min!) / (item.max! - item.min!)) * 100 - 50) *
                          0.97 +
                          50;

                        return (
                          <span
                            key={tick}
                            className="absolute text-[10px] text-saturn-text-secondary font-bold uppercase tracking-widest -translate-x-1/2 whitespace-nowrap"
                            style={{ left: `${percent}%` }}
                          >
                            {tick / 1024} GB
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Info box */}
                  {item.info && (
                    <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex gap-3">
                      <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-300/80 leading-relaxed">
                        {item.info}
                      </p>
                    </div>
                  )}
                </>
              )}

              {item.description && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex gap-3">
                  <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsSection;
