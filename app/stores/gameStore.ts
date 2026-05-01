import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type CardRank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6'

export interface Card {
  suit: CardSuit
  rank: CardRank
}

export interface Player {
  id: string
  name: string
  hand: Card[]
  score: number
  tricks: number
  ready: boolean
}

export interface GameState {
  id: string
  roomCode: string
  players: Player[]
  currentPlayer: number
  trumpSuit: CardSuit | null
  leadSuit: CardSuit | null
  currentTrick: Card[]
  roundNumber: number
  deck: Card[]
  status: 'waiting' | 'playing' | 'finished'
  createdAt: number
}

export interface ReplayData {
  id: string
  gameId: string
  players: string[]
  moves: Array<{
    player: number
    card: Card
    timestamp: number
  }>
  metadata: {
    template?: string
    importedFrom?: string
    version?: string
  }
}

interface GameStore {
  // Game state
  currentGame: GameState | null
  playerName: string
  playerId: string
  isHost: boolean
  
  // Actions
  setPlayerName: (name: string) => void
  createGame: (hostName: string) => string
  joinGame: (roomCode: string, playerName: string) => boolean
  leaveGame: () => void
  selectTrump: (suit: CardSuit) => void
  playCard: (card: Card) => void
  dealCards: () => void
  nextTurn: () => void
  
  // Replay
  replayData: ReplayData | null
  setReplayData: (data: ReplayData) => void
  exportReplay: () => ReplayData | null
  
  // UI state
  view: 'lobby' | 'game' | 'replay'
  setView: (view: 'lobby' | 'game' | 'replay') => void
}

// Generate deck
function generateDeck(): Card[] {
  const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: CardRank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6']
  const deck: Card[] = []
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank })
    }
  }
  
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  
  return deck
}

// Generate room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentGame: null,
  playerName: '',
  playerId: uuidv4(),
  isHost: false,
  replayData: null,
  view: 'lobby',
  
  setPlayerName: (name) => set({ playerName: name }),
  
  createGame: (hostName) => {
    const roomCode = generateRoomCode()
    const hostId = uuidv4()
    const deck = generateDeck()
    
    const newGame: GameState = {
      id: uuidv4(),
      roomCode,
      players: [
        {
          id: hostId,
          name: hostName,
          hand: [],
          score: 0,
          tricks: 0,
          ready: true
        }
      ],
      currentPlayer: 0,
      trumpSuit: null,
      leadSuit: null,
      currentTrick: [],
      roundNumber: 1,
      deck,
      status: 'waiting',
      createdAt: Date.now()
    }
    
    set({ 
      currentGame: newGame, 
      playerId: hostId,
      playerName: hostName,
      isHost: true,
      view: 'game'
    })
    
    return roomCode
  },
  
  joinGame: (roomCode, playerName) => {
    const game = get().currentGame
    if (!game || game.roomCode !== roomCode) {
      return false
    }
    
    if (game.players.length >= 4) {
      return false
    }
    
    const newPlayer: Player = {
      id: uuidv4(),
      name: playerName,
      hand: [],
      score: 0,
      tricks: 0,
      ready: false
    }
    
    set({
      currentGame: {
        ...game,
        players: [...game.players, newPlayer]
      },
      playerName,
      isHost: false
    })
    
    return true
  },
  
  leaveGame: () => {
    set({
      currentGame: null,
      isHost: false,
      view: 'lobby',
      replayData: null
    })
  },
  
  selectTrump: (suit) => {
    const game = get().currentGame
    if (!game) return
    
    set({
      currentGame: {
        ...game,
        trumpSuit: suit,
        status: 'playing'
      }
    })
  },
  
  playCard: (card) => {
    const game = get().currentGame
    if (!game) return
    
    const playerIndex = game.players.findIndex(p => p.id === get().playerId)
    if (playerIndex !== game.currentPlayer) return
    
    const player = game.players[playerIndex]
    const cardIndex = player.hand.findIndex(
      c => c.suit === card.suit && c.rank === card.rank
    )
    
    if (cardIndex === -1) return
    
    // Remove card from hand
    const newHand = [...player.hand]
    newHand.splice(cardIndex, 1)
    
    // Set lead suit if first card
    const leadSuit = game.currentTrick.length === 0 ? card.suit : game.leadSuit
    
    // Update player and trick
    const updatedPlayers = [...game.players]
    updatedPlayers[playerIndex] = { ...player, hand: newHand }
    
    set({
      currentGame: {
        ...game,
        players: updatedPlayers,
        currentTrick: [...game.currentTrick, card],
        leadSuit: leadSuit
      }
    })
    
    get().nextTurn()
  },
  
  dealCards: () => {
    const game = get().currentGame
    if (!game || game.deck.length < game.players.length) return
    
    const newPlayers = game.players.map(player => {
      const newHand: Card[] = []
      for (let i = 0; i < 5 && game.deck.length > 0; i++) {
        newHand.push(game.deck.pop()!)
      }
      return { ...player, hand: newHand }
    })
    
    set({
      currentGame: {
        ...game,
        players: newPlayers
      }
    })
  },
  
  nextTurn: () => {
    const game = get().currentGame
    if (!game) return
    
    const nextPlayer = (game.currentPlayer + 1) % game.players.length
    
    // Check if trick is complete
    if (nextPlayer === 0 && game.currentTrick.length === game.players.length) {
      // Evaluate trick
      set({
        currentGame: {
          ...game,
          currentPlayer: 0,
          currentTrick: [],
          leadSuit: null
        }
      })
    } else {
      set({
        currentGame: {
          ...game,
          currentPlayer: nextPlayer
        }
      })
    }
  },
  
  setReplayData: (data) => set({ replayData: data, view: 'replay' }),
  
  exportReplay: () => {
    const game = get().currentGame
    if (!game) return null
    
    const replay: ReplayData = {
      id: uuidv4(),
      gameId: game.id,
      players: game.players.map(p => p.name),
      moves: [], // Would track actual moves in real implementation
      metadata: {
        version: '2.4.1',
        importedFrom: 'local'
      }
    }
    
    return replay
  },
  
  setView: (view) => set({ view })
}))
