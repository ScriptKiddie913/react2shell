'use client'

import { useState } from 'react'
import { useGameStore, ReplayData } from '../stores/gameStore'

export default function ReplayViewer() {
  const { replayData, setView, setReplayData, leaveGame } = useGameStore()
  const [importJson, setImportJson] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  if (!replayData) {
    return (
      <div className="max-w-md mx-auto">
        <div className="panel animate-fadeIn">
          <div className="panel-header">
            📺 Replay Viewer
          </div>
          
          <p className="text-[#8b8b9a] mb-6">
            Analyze your games with our AI-powered strategy review system.
            Import game data to get started.
          </p>
          
          <div className="mb-6">
            <label className="block text-sm text-[#8b8b9a] mb-2">
              Import Replay JSON
            </label>
            <textarea
              className="input font-mono text-xs h-48"
              placeholder='{"players": ["Alice", "Bob"], "moves": [...], "metadata": {"template": "default"}}'
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  setError('')
                  setSuccess('')
                  
                  const data = JSON.parse(importJson)
                  
                  // Send to API for processing
                  const response = await fetch('/api/replay/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  })
                  
                  const result = await response.json()
                  
                  if (result.error) {
                    setError(result.error)
                  } else {
                    setSuccess('Replay imported successfully!')
                    setReplayData(data)
                  }
                } catch (e) {
                  setError('Invalid JSON format')
                }
              }}
            >
              📥 Import
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={() => setView('lobby')}
            >
              🔙 Back
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-[#f87171]/20 border border-[#f87171] rounded-lg p-3 text-center text-[#f87171]">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-4 bg-[#4ade80]/20 border border-[#4ade80] rounded-lg p-3 text-center text-[#4ade80]">
              {success}
            </div>
          )}
        </div>
        
        <div className="panel mt-6">
          <div className="panel-header">
            💡 Advanced Features
          </div>
          <p className="text-[#8b8b9a] text-sm">
            Pro players can use custom templates to customize replay analysis.
            Try using different metadata template values for unique insights!
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          📺 Replay Analysis
        </h2>
        <button
          className="btn btn-secondary"
          onClick={() => setView('lobby')}
        >
          Back to Lobby
        </button>
      </div>
      
      <div className="panel mb-6">
        <div className="panel-header">Game Info</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#8b8b9a]">Game ID: </span>
            <span className="font-mono">{replayData.gameId}</span>
          </div>
          <div>
            <span className="text-[#8b8b9a]">Players: </span>
            <span>{replayData.players.join(', ')}</span>
          </div>
          <div>
            <span className="text-[#8b8b9a]">Moves: </span>
            <span>{replayData.moves.length}</span>
          </div>
          <div>
            <span className="text-[#8b8b9a]">Version: </span>
            <span className="font-mono">{replayData.metadata?.version}</span>
          </div>
        </div>
      </div>
      
      <div className="panel">
        <div className="panel-header">Raw Data</div>
        <pre className="font-mono text-xs text-[#8b8b9a] overflow-auto max-h-96">
          {JSON.stringify(replayData, null, 2)}
        </pre>
      </div>
    </div>
  )
}
