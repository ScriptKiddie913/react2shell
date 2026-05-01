'use client'

import { useState } from 'react'
import { useGameStore } from '../stores/gameStore'

export default function GameLobby() {
  const { setPlayerName, createGame, joinGame, playerName } = useGameStore()
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  
  const handleCreate = () => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }
    setError('')
    createGame(playerName)
  }
  
  const handleJoin = () => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }
    setError('')
    const success = joinGame(roomCode, playerName)
    if (!success) {
      setError('Failed to join game. Check room code.')
    }
  }
  
  return (
    <div className="max-w-md mx-auto">
      <div className="panel animate-fadeIn">
        <div className="panel-header">
          🎮 Enter the Arena
        </div>
        
        <div className="mb-6">
          <label className="block text-sm text-[#8b8b9a] mb-2">
            Your Name
          </label>
          <input
            type="text"
            className="input"
            placeholder="Enter your nickname..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            className="btn btn-primary"
            onClick={() => {
              setIsJoining(false)
              handleCreate()
            }}
          >
            <span className="mr-2">🆕</span>
            Create Game
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => setIsJoining(true)}
          >
            <span className="mr-2">🚪</span>
            Join Game
          </button>
        </div>
        
        {isJoining && (
          <div className="mb-6 animate-fadeIn">
            <label className="block text-sm text-[#8b8b9a] mb-2">
              Room Code
            </label>
            <input
              type="text"
              className="input font-mono text-center text-xl tracking-widest uppercase"
              placeholder="XXXX"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={4}
            />
            <button
              className="btn btn-primary w-full mt-4"
              onClick={handleJoin}
            >
              Join Room
            </button>
          </div>
        )}
        
        {error && (
          <div className="bg-[#f87171]/20 border border-[#f87171] rounded-lg p-3 text-center text-[#f87171]">
            {error}
          </div>
        )}
      </div>
      
      <div className="panel mt-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="panel-header">
          📋 Game Rules
        </div>
        <ul className="text-[#8b8b9a] space-y-2 text-sm">
          <li>• Choose a trump suit to dominate the table</li>
          <li>• Must follow suit if possible</li>
          <li>• Highest trump wins the trick</li>
          <li>• Score points: A=4, K=3, Q=2, J=1, 10=10</li>
          <li>• First to 100 points wins!</li>
        </ul>
      </div>
      
      <div className="panel mt-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <div className="panel-header">
          💡 Pro Tips
        </div>
        <div className="text-[#8b8b9a] text-sm">
          <p>• <span className="text-[#f5c518]">Spades</span> is the most powerful suit</p>
          <p>• Save your high cards for the right moment</p>
          <p>• Watch your opponents' patterns in Replay</p>
        </div>
      </div>
    </div>
  )
}
