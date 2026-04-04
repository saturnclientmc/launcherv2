import { ChevronDown, Check } from "lucide-react";
import { GameVersion } from "@/lib/types";
import { twMerge } from "tailwind-merge";

interface Props {
  versions: GameVersion[];
  selected: GameVersion | null;
  onSelect: (v: GameVersion) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

export default function VersionDropdown({
  versions,
  selected,
  onSelect,
  open,
  setOpen,
}: Props) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md btn-primary text-sm"
      >
        <span>{selected?.name || "Loading..."}</span>
        <ChevronDown
          size={14}
          className={twMerge("transition-transform", open && "rotate-180")}
        />
      </button>

      <div
        className={twMerge(
          "absolute top-full left-0 mt-2 w-48 bg-saturn-panel border rounded-lg",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {versions.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              onSelect(v);
              setOpen(false);
            }}
            className="w-full flex justify-between px-4 py-2 text-sm hover:bg-saturn-accent/10"
          >
            {v.name}
            {selected?.id === v.id && <Check size={14} />}
          </button>
        ))}
      </div>
    </div>
  );
}
