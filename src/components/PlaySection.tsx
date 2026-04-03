import React, { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { launcherService, type GameVersion } from "../services/LauncherService";

interface PlaySectionProps {
  version: GameVersion;
}

const PlaySection: React.FC<PlaySectionProps> = ({ version }) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState("");

  const handleLaunch = async () => {
    setIsLaunching(true);
    setLaunchStatus("Preparing...");

    // Simulate launch steps
    setTimeout(() => setLaunchStatus("Verifying assets..."), 500);
    setTimeout(() => setLaunchStatus("Applying Saturn optimizations..."), 1200);

    const result = await launcherService.launchGame(version.id);

    if (result.success) {
      setLaunchStatus("Game running");
      // In a real app, we might minimize or close the launcher here
    }

    setTimeout(() => {
      setIsLaunching(false);
      setLaunchStatus("");
    }, 3000);
  };

  return (
    <div className="h-full relative">
      {/* Background Image */}
      <img
        src="/bg.png"
        alt="Background"
        className="w-full h-full object-cover rounded-2xl brightness-50"
      />

      {/* Centered Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

          <button
            onClick={handleLaunch}
            disabled={isLaunching}
            className="relative btn-primary px-16 py-4 text-xl flex items-center gap-3 min-w-60 justify-center"
          >
            {isLaunching ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>{launchStatus}</span>
              </>
            ) : (
              <>
                <Play size={24} fill="currentColor" />
                <span>LAUNCH {version.id}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaySection;
