import { User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Props } from "./props";

function UserComponent({
  username,
  uuid,
  onClick,
}: {
  username: string;
  uuid: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-2.5 border-b border-saturn-border p-3 pb-2 cursor-default",
        onClick && "cursor-pointer hover:bg-white/5 transition-colors",
      )}
      onClick={onClick}
    >
      <img
        src={"https://render.crafty.gg/2d/head/" + uuid}
        className="w-10 h-10 object-cover shrink-0"
      />
      <div className="min-w-0 select-none">
        <p className="text-sm font-bold truncate">{username}</p>
        <p className="text-xs text-saturn-text-secondary truncate">{uuid}</p>
      </div>
    </div>
  );
}

export default function AccountDropdown({
  isAccountDropdownOpen,
  setIsAccountDropdownOpen,
  accountRef,
}: Props) {
  return (
    <div ref={accountRef} className="relative group overflow-visible">
      <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition pointer-events-none duration-700" />

      <button
        className="relative z-10 flex items-center gap-3 pl-20 pr-4 py-2 rounded-lg btn-primary"
        onClick={() => setIsAccountDropdownOpen((prev: boolean) => !prev)}
      >
        <div className="absolute -top-2 left-4 group-hover:scale-110 transition-transform duration-700 w-12 overflow-hidden z-20">
          <img
            src="https://render.crafty.gg/3d/bust/swight"
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
        {/* Current account */}
        <div>
          <UserComponent
            username="SaturnDev"
            uuid="123e4567-e89b-12d3-a456-426614174000"
          />
        </div>

        {/* Accounts (current account should be filtered) */}

        <div>
          <UserComponent
            username="SaturnDev2"
            uuid="123e4567-e89b-12d3-a456-426614174000"
            onClick={() => {}}
          />
        </div>

        {/* Account Options */}

        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors">
          <User size={14} />
          <span>Add Account</span>
        </button>

        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-500/10 text-red-400 transition-colors">
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
