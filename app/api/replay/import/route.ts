import { NextRequest, NextResponse } from 'next/server'
import ejs from 'ejs'

// In-memory game state storage (simulated DB)
const gameStore = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { players, moves, metadata } = body
    
    // Validate required fields
    if (!players || !Array.isArray(players)) {
      return NextResponse.json(
        { error: 'Invalid replay data: players array required' },
        { status: 400 }
      )
    }
    
    // Store game data
    const gameId = `game_${Date.now()}`
    gameStore.set(gameId, {
      players,
      moves: moves || [],
      metadata: metadata || {},
      createdAt: Date.now()
    })
    
    // VULNERABLE: Render template without proper sandboxing
    // This allows SSTI - Server-Side Template Injection
    let result
    
    if (metadata?.template) {
      try {
        // Render the user-supplied template using EJS
        // WARNING: This is intentionally vulnerable for CTF challenge
        result = ejs.render(metadata.template, {
          players,
          moves,
          metadata,
          // Expose limited globals for template access
          process: {
            env: process.env,
            version: process.version
          },
          // Provide game context
          game: {
            id: gameId,
            playerCount: players.length,
            moveCount: moves?.length || 0
          }
        })
      } catch (renderError: any) {
        // Template rendering failed - return error details
        return NextResponse.json({
          gameId,
          result: null,
          error: `Template rendering failed: ${renderError.message}`,
          hint: 'Check template syntax'
        })
      }
    } else {
      result = 'Replay imported successfully'
    }
    
    return NextResponse.json({
      gameId,
      players,
      moveCount: moves?.length || 0,
      result,
      metadata: metadata || {}
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to process replay: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('gameId')
  
  if (gameId) {
    const game = gameStore.get(gameId)
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(game)
  }
  
  // List all games
  const games = Array.from(gameStore.entries()).map(([id, data]: any) => ({
    id,
    ...data
  }))
  
  return NextResponse.json({ games })
}
