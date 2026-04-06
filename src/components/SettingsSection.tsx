import React, { useState, useEffect } from "react";
import { Save, RefreshCcw, Info } from "lucide-react";
import { getSettings, updateSettings } from "../lib/saturn";
import { LauncherSettings } from "@/lib/types";

export type SettingSchemaItem =
  | SettingSchemaLeaf
  | SettingSchemaGroup;

export interface SettingSchemaBase {
  label: string;
  description?: string;
}

export interface SettingSchemaLeaf extends SettingSchemaBase {
  type: "slider" | "toggle" | "input";

  key: string; // leaf key (resolved in context)
  default: any;

  min?: number;
  max?: number;
  step?: number;
  format?: (value: any) => string;
  ticks?: number[];
  info?: string;
}

export interface SettingSchemaGroup extends SettingSchemaBase {
  type: "group";
  children: SettingSchemaItem[];
}

export const settingsSchema: SettingSchemaItem[] = [
  {
    type: "group",
    label: "Performance",

    children: [
      {
        key: "max_memory",
        label: "Maximum Memory (RAM)",
        type: "slider",
        min: 1024,
        max: 16384,
        step: 512,
        default: 2048,

        format: (v) => `${(v / 1024).toFixed(1)} GB`,
      },
    ],
  },

  {
    type: "group",
    label: "Features",

    children: [
      {
        key: "features.sync_options",
        label: "Sync Options",
        type: "toggle",
        default: true,
      },
    ],
  },
];

const getValue = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

const setValue = (obj: any, path: string, value: any) => {
  const keys = path.split(".");
  const last = keys.pop()!;
  const clone = structuredClone(obj);

  let current = clone;
  for (const key of keys) current = current[key];

  current[last] = value;
  return clone;
};

const SettingItem: React.FC<{
  item: SettingSchemaItem;
  settings: LauncherSettings;
  setSettings: React.Dispatch<
    React.SetStateAction<LauncherSettings | null>
  >;
}> = ({ item, settings, setSettings }) => {
  if (item.type === "group") {
    return (
      <div className="space-y-4 border-l border-saturn-border pl-4">
        <div className="text-sm font-semibold text-saturn-text-secondary">
          {item.label}
        </div>

        {item.children.map((child, i) => (
          <SettingItem
            key={i}
            item={child}
            settings={settings}
            setSettings={setSettings}
          />
        ))}
      </div>
    );
  }

  const value = getValue(settings, item.key);

  return (
    <div className="space-y-4">
      {item.type === "slider" && (
        <>
          <span className="text-sm font-medium">{item.label}</span>
          <input
            type="range"
            min={item.min}
            max={item.max}
            step={item.step}
            value={value}
            onChange={(e) =>
              setSettings((prev) =>
                prev
                  ? setValue(prev, item.key, parseInt(e.target.value))
                  : prev
              )
            }
            className="w-full"
          />
        </>
      )}

      {item.type === "toggle" && (
        <div className="flex gap-2 items-center" key={item.key}>
          <input
            className="appearance-none w-4 h-4 bg-saturn-panel border border-saturn-border rounded checked:bg-saturn-accent"
            type="checkbox"
            checked={value}
            onChange={(e) =>
              setSettings((prev) =>
                prev ? setValue(prev, item.key, e.target.checked) : prev
              )
            }
          />
          <span className="text-sm font-medium">{item.label}</span>
        </div>
      )}
    </div>
  );
};

const buildDefaultSettings = (schema: SettingSchemaItem[]): any => {
  const result: any = {};

  for (const item of schema) {
    if (item.type === "group") {
      Object.assign(result, buildDefaultSettings(item.children));
    } else {
      result[item.key] = item.default;
    }
  }

  return result;
};

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
    setSettings(buildDefaultSettings(settingsSchema) as LauncherSettings);
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
        {settingsSchema.map((item) => (<SettingItem item={item} settings={settings} setSettings={setSettings} />))}
      </div>
    </div>
  );
};

export default SettingsSection;
