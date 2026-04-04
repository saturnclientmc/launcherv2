import { Play, Puzzle, Settings } from "lucide-react";
import { twMerge } from "tailwind-merge";

type Section = "play" | "mods" | "settings";

interface Props {
  active: Section;
  setActive: (s: Section) => void;
}

export default function Sidebar({ active, setActive }: Props) {
  return (
    <aside className="w-16 border-r border-saturn-border flex flex-col items-center py-6 gap-6 bg-saturn-panel/50">
      <nav className="flex flex-col gap-4 h-full">
        <button
          onClick={() => setActive("play")}
          className={twMerge("sidebar-icon", active === "play" && "active")}
        >
          <Play size={22} fill={active === "play" ? "currentColor" : "none"} />
        </button>

        <button
          onClick={() => setActive("mods")}
          className={twMerge("sidebar-icon", active === "mods" && "active")}
        >
          <Puzzle
            size={22}
            fill={active === "mods" ? "currentColor" : "none"}
          />
        </button>

        <button
          onClick={() => setActive("settings")}
          className={twMerge("sidebar-icon", active === "settings" && "active")}
        >
          <Settings
            size={22}
            fill={active === "settings" ? "currentColor" : "none"}
          />
        </button>
      </nav>
    </aside>
  );
}
