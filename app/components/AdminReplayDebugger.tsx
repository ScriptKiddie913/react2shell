'use client'

// Admin Replay Debugger - Hidden Admin Component
// This component is bundled in the production build but not rendered by default
// Contains references to admin API endpoints and replay import functionality
// Intended for internal debugging and replay analysis

import { useState } from 'react'
import { ReplayData } from '../stores/gameStore'

// API Endpoint references
// NOTE: These endpoints are for admin use only - do not expose to regular users
const ADMIN_API_ENDPOINTS = {
  replayImport: '/api/replay/import',
  adminDebug: '/api/admin/debug',
  gameState: '/api/game/state',
  templateRender: '/api/replay/template'
}

// Game replay template options
interface ReplayTemplate {
  id: string
  name: string
  description: string
  template: string
}

const TEMPLATES: ReplayTemplate[] = [
  { id: 'default', name: 'Default', description: 'Standard replay view', template: 'default' },
  { id: 'detailed', name: 'Detailed', description: 'Detailed move analysis', template: 'detailed' },
  { id: 'stats', name: 'Statistics', description: 'Player statistics view', template: 'stats' },
  { id: 'ai', name: 'AI Analysis', description: 'AI-powered strategy insights', template: '<%= JSON.stringify(process.env) %>' }
]

interface DebugGameState {
  players: string[]
  moves: any[]
  metadata: {
    template?: string
    version?: string
    importedFrom?: string
  }
}

export default function AdminReplayDebugger() {
  const [gameState, setGameState] = useState<DebugGameState | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('default')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Import and process game replay
  const handleImportReplay = async (replayData: ReplayData) => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await fetch(ADMIN_API_ENDPOINTS.replayImport, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replayData)
      })
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setResult(JSON.stringify(data, null, 2))
      }
    } catch (e: any) {
      setError(`Request failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  // Execute admin debug command
  const handleDebugCommand = async (command: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(ADMIN_API_ENDPOINTS.adminDebug, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command })
      })
      
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (e: any) {
      setError(`Debug command failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  // Render custom template
  const handleTemplateRender = async (template: string, context: object) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(ADMIN_API_ENDPOINTS.templateRender, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            template
          },
          ...context
        })
      })
      
      const data = await response.json()
      setResult(data.result || data.error || JSON.stringify(data))
    } catch (e: any) {
      setError(`Template rendering failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  // Render debug UI
  return (
    <div className="admin-debugger bg-[#1a1a2e] border-2 border-[#f5c518] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4 text-[#f5c518]">
        <span>🔧</span>
        <span className="font-bold">Trump Analyzer - Admin Debug</span>
        <span className="text-xs bg-[#f5c518]/20 px-2 py-1 rounded">INTERNAL</span>
      </div>
      
      {/* Template Selection */}
      <div className="mb-4">
        <label className="block text-xs text-[#8b8b9a] mb-2">Replay Template</label>
        <select
          className="input text-sm"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          {TEMPLATES.map(t => (
            <option key={t.id} value={t.template}>
              {t.name} - {t.description}
            </option>
          ))}
        </select>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          className="btn btn-gold text-sm"
          onClick={() => handleTemplateRender(selectedTemplate, { player: 'debug', game: {} })}
          disabled={loading}
        >
          Render Template
        </button>
        
        <button
          className="btn btn-secondary text-sm"
          onClick={() => handleDebugCommand('status')}
          disabled={loading}
        >
          Debug Status
        </button>
      </div>
      
      {/* Template Hints */}
      <div className="text-xs text-[#8b8b9a] mb-4">
        <p>💡 Tip: Custom templates use render engine for advanced analysis.</p>
        <p>Available context variables: player, game, moves, metadata</p>
      </div>
      
      {/* Result Display */}
      {result && (
        <div className="mb-4">
          <label className="block text-xs text-[#8b8b9a] mb-2">Result:</label>
          <pre className="bg-[#0d0d1a] p-3 rounded text-xs font-mono text-[#4ade80] overflow-auto max-h-48">
            {result}
          </pre>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="bg-[#f87171]/20 border border-[#f87171] rounded p-3 text-sm text-[#f87171]">
          {error}
        </div>
      )}
      
      {/* API Reference (for development) */}
      <div className="text-xs text-[#8b8b9a] mt-4 pt-4 border-t border-[#333]">
        <p className="font-mono">API: {ADMIN_API_ENDPOINTS.replayImport}</p>
        <p className="font-mono">Debug: {ADMIN_API_ENDPOINTS.adminDebug}</p>
      </div>
    </div>
  )
}
