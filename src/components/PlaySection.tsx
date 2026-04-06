import React, { useEffect, useState } from "react";
import { Play, Loader2 } from "lucide-react";
import Bg from "@/assets/bg.png";
import { listen } from "@tauri-apps/api/event";
import { GameVersion } from "@/lib/types";
import { launch } from "@/lib/launcher";
import { authGetValid } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { SetState } from "./layout/props";

interface PlaySectionProps {
  version: GameVersion | null;
  activeAccount: [string, string] | null;
  setActiveAccount: SetState<[string, string] | null>,
  accounts: [string, string][],
  setAccounts: SetState<[string, string][]>,
}

const PlaySection: React.FC<PlaySectionProps> = ({ version, activeAccount: account }) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unlistenProgress = listen<number>("launch-progress", (event) => {
      setProgress(event.payload);
    });

    const unlistenLaunchStatus = listen<string>("launch-status", (event) => {
      setLaunchStatus(event.payload);
    });

    const unlistenIsLaunching = listen<string>("is-launching", (event) => {
      setIsLaunching(event.payload === "true");
      if (event.payload === "false") setProgress(0); // reset when done
    });

    return () => {
      unlistenProgress.then((f) => f());
      unlistenLaunchStatus.then((f) => f());
      unlistenIsLaunching.then((f) => f());
    };
  }, []);

  const handleLaunch = async () => {
    if (version && account) {
      const validAccount = await authGetValid(account[0]);
      launch(version, validAccount);
    }
  }

  return (
    <div className="h-full relative">
      {/* Background Image */}
      <img
        src={Bg}
        alt="Background"
        className="w-full h-full object-cover rounded-2xl brightness-50"
      />

      {/* Centered Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

          <button
            onClick={handleLaunch}
            disabled={isLaunching || !version || !account}
            className={cn(
              "relative btn-primary px-16 py-4 text-xl flex items-center gap-3 min-w-60 justify-center",
              (isLaunching || !version || !account) &&
              "cursor-not-allowed opacity-70",
            )}
          >
            {isLaunching ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>{launchStatus}</span>
              </>
            ) : (
              <>
                <Play size={24} fill="currentColor" />
                <span>LAUNCH {version?.id}</span>
              </>
            )}
          </button>
        </div>
        {
          <div
            className={cn(
              "w-64 transition-opacity duration-700 opacity-0 absolute mt-28",
              isLaunching && "opacity-100",
            )}
          >
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="text-xs text-center mt-1 text-white/70">
              {progress}%
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default PlaySection;
