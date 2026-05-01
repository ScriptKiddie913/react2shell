'use client'

import { useGameStore, Card, CardSuit } from '../stores/gameStore'
import { getSuitSymbol, getSuitColor } from '../lib/gameLogic'

function CardComponent({ card, onClick, playable }: { card: Card; onClick?: () => void; playable?: boolean }) {
  const suitSymbol = getSuitSymbol(card.suit)
  const colorClass = getSuitColor(card.suit) === 'red' ? 'red' : 'black'
  
  return (
    <div 
      className={`card ${colorClass} ${playable ? 'cursor-pointer hover:scale-105' : 'opacity-60'}`}
      onClick={playable ? onClick : undefined}
    >
      <span className="rank">{card.rank}</span>
      <span className="suit">{suitSymbol}</span>
      <span className="rank-bottom">{card.rank}</span>
    </div>
  )
}

export default function CardTable() {
  const { 
    currentGame, 
    playerId, 
    playCard, 
    selectTrump, 
    leaveGame,
    setReplayData,
    exportReplay
  } = useGameStore()
  
  if (!currentGame) return null
  
  const currentPlayer = currentGame.players[currentGame.currentPlayer]
  const isMyTurn = currentPlayer?.id === playerId
  const myPlayer = currentGame.players.find(p => p.id === playerId)
  const myHand = myPlayer?.hand || []
  
  const suits: CardSuit[] = ['spades', 'hearts', 'clubs', 'diamonds']
  
  const handleExportReplay = async () => {
    const replay = exportReplay()
    if (!replay) return
    
    // Send to API endpoint for processing
    try {
      const response = await fetch('/api/replay/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replay)
      })
      
      const data = await response.json()
      console.log('Replay exported:', data)
    } catch (error) {
      console.error('Failed to export replay:', error)
    }
  }
  
  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[#8b8b9a]">Room: </span>
          <span className="font-mono text-xl tracking-widest text-[#f5c518]">
            {currentGame.roomCode}
          </span>
        </div>
        
        <div className="flex gap-3">
          <button 
            className="btn btn-secondary text-sm"
            onClick={handleExportReplay}
          >
            📤 Replay
          </button>
          <button 
            className="btn text-sm bg-[#f87171]/20 text-[#f87171]"
            onClick={leaveGame}
          >
            Leave
          </button>
        </div>
      </div>
      
      {/* Trump Selection (if not selected yet) */}
      {!currentGame.trumpSuit && currentGame.status === 'waiting' && (
        <div className="panel mb-6 text-center">
          <div className="panel-header">🃏 Select Your Trump</div>
          <p className="text-[#8b8b9a] mb-4">Choose wisely - this defines the game!</p>
          <div className="flex justify-center gap-4">
            {suits.map(suit => (
              <button
                key={suit}
                className="btn btn-gold"
                onClick={() => selectTrump(suit)}
              >
                <span className="text-2xl mr-2">{getSuitSymbol(suit)}</span>
                {suit.charAt(0).toUpperCase() + suit.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Game Table */}
      <div className="table-bg p-8 mb-6 relative">
        {/* Trump Indicator */}
        <div className="absolute top-4 right-4">
          <div className="trump-badge">
            <span className="suit-icon">{getSuitSymbol(currentGame.trumpSuit || 'spades')}</span>
            <span>TRUMP</span>
          </div>
        </div>
        
        {/* Current Turn Indicator */}
        <div className="absolute top-4 left-4">
          <div className={`player-badge ${isMyTurn ? 'active' : ''}`}>
            {isMyTurn && <span className="animate-pulse">▶</span>}
            <span>{currentPlayer?.name}'s turn</span>
          </div>
        </div>
        
        {/* Center - Current Trick */}
        <div className="flex justify-center items-center gap-4 min-h-[140px]">
          {currentGame.currentTrick.length === 0 ? (
            <span className="text-[#8b8b9a] italic">Play a card to lead the trick...</span>
          ) : (
            currentGame.currentTrick.map((card, idx) => (
              <CardComponent key={idx} card={card} />
            ))
          )}
        </div>
        
        {/* Players */}
        <div className="flex justify-around mt-8">
          {currentGame.players.map((player, idx) => (
            <div key={player.id} className="text-center">
              <div className="player-badge mb-2">
                <span>{player.name}</span>
                {idx === currentGame.currentPlayer && <span className="text-[#e94560] animate-pulse">●</span>}
              </div>
              <div className="text-sm text-[#8b8b9a]">
                Tricks: {player.tricks} • Score: {player.score}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* My Hand */}
      <div className="panel">
        <div className="panel-header">Your Hand</div>
        <div className="flex justify-center gap-2 flex-wrap">
          {myHand.map((card, idx) => (
            <CardComponent 
              key={idx} 
              card={card} 
              playable={isMyTurn}
              onClick={() => playCard(card)}
            />
          ))}
        </div>
        {myHand.length === 0 && (
          <p className="text-center text-[#8b8b9a]">No cards in hand</p>
        )}
      </div>
      
      {/* Hidden Admin Component Reference */}
      {/* NOTE: AdminReplayDebugger.jsx is bundled but not rendered by default */}
      {/* It handles advanced replay features including template import */}
    </div>
  )
}
