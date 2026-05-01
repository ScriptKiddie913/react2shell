'use client'

import { useGameStore } from './stores/gameStore'
import GameLobby from './components/GameLobby'
import CardTable from './components/CardTable'
import ReplayViewer from './components/ReplayViewer'

export default function Home() {
  const { view, currentGame, replayData } = useGameStore()
  
  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">
          <span className="text-[#e94560]">The Trump</span> of Spades
        </h1>
        <p className="text-[#8b8b9a] text-lg">
          Master the art of trick-taking domination
        </p>
      </header>
      
      <div className="max-w-6xl mx-auto">
        {view === 'lobby' && <GameLobby />}
        {view === 'game' && currentGame && <CardTable />}
        {view === 'replay' && replayData && <ReplayViewer />}
      </div>
      
      <footer className="text-center mt-12 text-[#8b8b9a] text-sm">
        <p>Trump of Spades v2.4.1 • Build: dev</p>
        <p className="mt-1">AI-Powered Strategy Review Available in Replay Mode</p>
      </footer>
    </main>
  )
}
