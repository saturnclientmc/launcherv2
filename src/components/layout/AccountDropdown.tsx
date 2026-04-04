import { useEffect, useState } from "react";
import { User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Props } from "./props";
import { authList, authRemove, authCreateLink } from "@/lib/auth";

interface Account {
  uuid: string;
  username: string;
}

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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [active, setActive] = useState<Account | null>(null);

  // Load accounts
  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    const accs = await authList();
    setAccounts(accs);

    if (accs.length && !active) {
      setActive(accs[0]); // default
    }
  }

  // Switch account
  function switchAccount(acc: Account) {
    setActive(acc);
    setIsAccountDropdownOpen(false);
  }

  // Logout (remove account)
  async function logout() {
    if (!active) return;

    await authRemove(active.uuid);

    const updated = await authList();
    setAccounts(updated);
    setActive(updated[0] || null);
  }

  // Add account (open Microsoft login)
  async function addAccount() {
    const url = await authCreateLink();
    console.log("Opening auth URL:", url);
  }

  const otherAccounts = accounts.filter((a) => a.uuid !== active?.uuid);

  return (
    <div ref={accountRef} className="relative group overflow-visible">
      {/* Glow */}
      <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition pointer-events-none duration-700" />

      {/* Button */}
      <button
        className="relative z-10 flex items-center gap-3 pl-20 pr-4 py-2 rounded-lg btn-primary"
        onClick={() => setIsAccountDropdownOpen((prev: boolean) => !prev)}
      >
        <div className="absolute -top-2 left-4 group-hover:scale-110 transition-transform duration-700 w-12 overflow-hidden z-20">
          {active && (
            <img
              src={`https://render.crafty.gg/3d/bust/${active.uuid}`}
              className="w-full h-full object-cover"
            />
          )}
          {!active && (
            <img
              src={`https://render.crafty.gg/3d/bust/MHF_Steve`}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="leading-tight">
          <p className="text-[10px] text-white/80 uppercase tracking-wide">
            Playing as
          </p>
          <p className="text-sm font-bold text-white">
            {active?.username || "No Account"}
          </p>
        </div>
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute top-full right-0 mt-2 w-56 bg-saturn-panel border border-saturn-border rounded-lg shadow-2xl z-50 py-1 overflow-hidden transition-all duration-200 origin-top",
          isAccountDropdownOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
        )}
      >
        {/* Current account */}
        {active && (
          <UserComponent username={active.username} uuid={active.uuid} />
        )}

        {/* Other accounts */}
        {otherAccounts.map((acc) => (
          <UserComponent
            key={acc.uuid}
            username={acc.username}
            uuid={acc.uuid}
            onClick={() => switchAccount(acc)}
          />
        ))}

        {/* Actions */}
        <button
          onClick={addAccount}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
        >
          <User size={14} />
          <span>Add Account</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-500/10 text-red-400 transition-colors"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
