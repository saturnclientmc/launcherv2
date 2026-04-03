import React, { useState } from 'react'
import { Play, Loader2, Info, ExternalLink } from 'lucide-react'
import { launcherService, type GameVersion } from '../services/LauncherService'
import { motion } from 'framer-motion'

interface PlaySectionProps {
  version: GameVersion
}

const PlaySection: React.FC<PlaySectionProps> = ({ version }) => {
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchStatus, setLaunchStatus] = useState('')

  const handleLaunch = async () => {
    setIsLaunching(true)
    setLaunchStatus('Preparing...')
    
    // Simulate launch steps
    setTimeout(() => setLaunchStatus('Verifying assets...'), 500)
    setTimeout(() => setLaunchStatus('Applying Saturn optimizations...'), 1200)
    
    const result = await launcherService.launchGame(version.id)
    
    if (result.success) {
      setLaunchStatus('Game running')
      // In a real app, we might minimize or close the launcher here
    }
    
    setTimeout(() => {
      setIsLaunching(false)
      setLaunchStatus('')
    }, 3000)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-6xl font-black tracking-tighter mb-2 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          SATURN
        </h1>
        <p className="text-saturn-text-secondary text-lg tracking-widest font-light uppercase">
          Fabric-Only Optimization Client
        </p>
      </motion.div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="panel p-6 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-saturn-accent">
            <Info size={20} />
          </div>
          <div>
            <p className="text-xs text-saturn-text-secondary uppercase tracking-wider font-bold">Instance</p>
            <p className="text-sm font-medium">Saturn Default</p>
          </div>
        </div>

        <div className="panel p-6 flex flex-col items-center gap-3 border-saturn-accent/30 bg-saturn-accent/5">
          <div className="w-10 h-10 rounded-full bg-saturn-accent/20 flex items-center justify-center text-saturn-accent">
            <Play size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-xs text-saturn-text-secondary uppercase tracking-wider font-bold">Current Version</p>
            <p className="text-sm font-medium">{version.name}</p>
          </div>
        </div>

        <div className="panel p-6 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-saturn-accent">
            <ExternalLink size={20} />
          </div>
          <div>
            <p className="text-xs text-saturn-text-secondary uppercase tracking-wider font-bold">Modloader</p>
            <p className="text-sm font-medium">Fabric Loader</p>
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <button 
          onClick={handleLaunch}
          disabled={isLaunching}
          className="relative btn-primary px-16 py-4 text-xl flex items-center gap-3 min-w-[240px] justify-center"
        >
          {isLaunching ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              <span>{launchStatus}</span>
            </>
          ) : (
            <>
              <Play size={24} fill="currentColor" />
              <span>PLAY</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-12 text-saturn-text-secondary text-xs max-w-md">
        <p>Saturn Client is not affiliated with Mojang AB. Use at your own risk. Performance may vary based on hardware.</p>
      </div>
    </div>
  )
}

export default PlaySection
