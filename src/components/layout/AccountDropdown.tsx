import { User, LogOut } from "lucide-react";

import { twMerge } from "tailwind-merge";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
}

export default function AccountDropdown({ open, setOpen }: Props) {
  return (
    <div className="relative">
      <button
        className="flex items-center gap-3 px-4 py-2 rounded-lg btn-primary"
        onClick={() => setOpen(!open)}
      >
        <div>
          <p className="text-xs opacity-70">Playing as</p>
          <p className="font-bold">SaturnDev</p>
        </div>
      </button>

      <div
        className={twMerge(
          "absolute top-full right-0 mt-2 w-48 bg-saturn-panel border rounded-lg",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <button className="w-full flex gap-2 px-4 py-2 hover:bg-white/5">
          <User size={14} /> Switch Account
        </button>
        <button className="w-full flex gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}
