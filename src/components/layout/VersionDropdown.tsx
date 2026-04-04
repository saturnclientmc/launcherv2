import { ChevronDown, Check } from "lucide-react";
import { GameVersion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Props } from "./props";

export default function VersionDropdown({
  versions,
  selectedVersion,
  setSelectedVersion,
  isVersionDropdownOpen,
  setIsVersionDropdownOpen,
  setIsAccountDropdownOpen,
  versionRef,
}: Props) {
  return (
    <div ref={versionRef} className="relative">
      <div className="relative group overflow-visible inline-block">
        <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-md blur opacity-25 group-hover:opacity-50 transition duration-500 pointer-events-none" />

        <button
          onClick={() => {
            setIsVersionDropdownOpen((prev: boolean) => !prev);
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
        {versions.map((v: GameVersion) => (
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
  );
}
