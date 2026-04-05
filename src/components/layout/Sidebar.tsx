import { Play, Puzzle, Settings } from "lucide-react";
import Logo from "@/assets/logo_no_bg.png";
import { cn } from "@/lib/utils";

export default function Sidebar({ active, setActive }: any) {
  return (
    <aside className="w-16 border-r border-saturn-border flex flex-col items-center py-6 gap-6 bg-saturn-panel/50">
      <div>
        <img src={Logo} alt="Saturn Logo" className="w-10 h-10" />
      </div>

      <nav className="flex flex-col gap-4 h-full">
        <button
          onClick={() => setActive("play")}
          className={cn("sidebar-icon", active === "play" && "active")}
        >
          <Play size={22} fill={active === "play" ? "currentColor" : "none"} />
        </button>

        <button
          onClick={() => setActive("mods")}
          className={cn("sidebar-icon", active === "mods" && "active")}
        >
          <Puzzle
            size={22}
            fill={active === "mods" ? "currentColor" : "none"}
          />
        </button>

        <button
          onClick={() => setActive("settings")}
          className={cn("sidebar-icon", active === "settings" && "active")}
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
