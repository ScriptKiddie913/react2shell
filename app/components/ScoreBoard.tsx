'use client'

import { useGameStore } from '../stores/gameStore'

export default function ScoreBoard() {
  const { currentGame } = useGameStore()
  
  if (!currentGame) return null
  
  const sortedPlayers = [...currentGame.players].sort((a, b) => b.score - a.score)
  
  return (
    <div className="panel">
      <div className="panel-header">
        🏆 Scoreboard
      </div>
      
      <div className="space-y-2">
        {sortedPlayers.map((player, idx) => (
          <div key={player.id} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
              </span>
              <span>{player.name}</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-[#f5c518]">{player.score}</span>
              <span className="text-sm text-[#8b8b9a] ml-2">
                ({player.tricks} tricks)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
