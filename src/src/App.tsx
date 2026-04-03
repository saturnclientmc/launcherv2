import React, { useState, useEffect } from 'react'
import { Play, Puzzle, Settings, ChevronDown, User, LogOut, Check } from 'lucide-react'
import { launcherService, type GameVersion } from './services/LauncherService'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Components
import PlaySection from './components/PlaySection'
import ModsSection from './components/ModsSection'
import SettingsSection from './components/SettingsSection'

type Section = 'play' | 'mods' | 'settings'

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('play')
  const [versions, setVersions] = useState<GameVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<GameVersion | null>(null)
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)

  useEffect(() => {
    const fetchVersions = async () => {
      const v = await launcherService.getVersions()
      setVersions(v)
      if (v.length > 0) setSelectedVersion(v[0])
    }
    fetchVersions()
  }, [])

  return (
    <div className="flex h-screen w-screen bg-saturn-bg text-saturn-text-primary overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-16 border-r border-saturn-border flex flex-col items-center py-6 gap-6 bg-saturn-panel/50">
        <div className="mb-4">
          <div className="w-10 h-10 bg-saturn-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <span className="font-bold text-white text-xl">S</span>
          </div>
        </div>
        
        <nav className="flex flex-col gap-4">
          <button 
            onClick={() => setActiveSection('play')}
            className={cn("sidebar-icon", activeSection === 'play' && "active")}
            title="Play"
          >
            <Play size={22} fill={activeSection === 'play' ? "currentColor" : "none"} />
          </button>
          
          <button 
            onClick={() => setActiveSection('mods')}
            className={cn("sidebar-icon", activeSection === 'mods' && "active")}
            title="Mods"
          >
            <Puzzle size={22} fill={activeSection === 'mods' ? "currentColor" : "none"} />
          </button>
          
          <button 
            onClick={() => setActiveSection('settings')}
            className={cn("sidebar-icon", activeSection === 'settings' && "active")}
            title="Settings"
          >
            <Settings size={22} fill={activeSection === 'settings' ? "currentColor" : "none"} />
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-saturn-border flex items-center justify-between px-6 bg-saturn-panel/30 backdrop-blur-md">
          {/* Version Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors text-sm font-medium border border-transparent hover:border-saturn-border"
            >
              <span className="text-saturn-text-secondary">Version:</span>
              <span>{selectedVersion?.name || 'Loading...'}</span>
              <ChevronDown size={14} className={cn("transition-transform", isVersionDropdownOpen && "rotate-180")} />
            </button>
            
            {isVersionDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-saturn-panel border border-saturn-border rounded-lg shadow-2xl z-50 py-1 overflow-hidden">
                {versions.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVersion(v)
                      setIsVersionDropdownOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-saturn-accent/10 hover:text-saturn-accent transition-colors"
                  >
                    <span>{v.name}</span>
                    {selectedVersion?.id === v.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account Display */}
          <div className="relative">
            <button 
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-saturn-border"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none">SaturnDev</p>
                <p className="text-[10px] text-saturn-text-secondary leading-none mt-1">Microsoft Account</p>
              </div>
              <div className="w-8 h-8 rounded-md bg-zinc-800 border border-saturn-border overflow-hidden flex items-center justify-center">
                <User size={18} className="text-saturn-text-secondary" />
              </div>
            </button>

            {isAccountDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-saturn-panel border border-saturn-border rounded-lg shadow-2xl z-50 py-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-saturn-border">
                  <p className="text-sm font-bold">SaturnDev</p>
                  <p className="text-xs text-saturn-text-secondary truncate">dev@saturnclient.com</p>
                </div>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                  <User size={14} />
                  <span>Switch Account</span>
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-500/10 text-red-400 transition-colors">
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8">
          {activeSection === 'play' && selectedVersion && <PlaySection version={selectedVersion} />}
          {activeSection === 'mods' && selectedVersion && <ModsSection version={selectedVersion} />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  )
}

export default App
