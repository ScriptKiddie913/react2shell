import { Card, CardSuit, CardRank } from '../stores/gameStore'

// Card values for comparison
const cardValues: Record<CardRank, number> = {
  'A': 14,
  'K': 13,
  'Q': 12,
  'J': 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6
}

// Evaluate which card wins a trick
export function evaluateTrick(
  trick: Card[],
  trumpSuit: CardSuit,
  leadSuit: CardSuit | null
): number {
  let winningCardIndex = 0
  let winningCard = trick[0]
  
  for (let i = 1; i < trick.length; i++) {
    const card = trick[i]
    const isTrump = card.suit === trumpSuit
    const wasTrump = winningCard.suit === trumpSuit
    const followsSuit = card.suit === leadSuit
    const winnerFollowsSuit = winningCard.suit === leadSuit
    
    // Trump always beats non-trump
    if (isTrump && !wasTrump) {
      winningCard = card
      winningCardIndex = i
    } else if (!isTrump && wasTrump) {
      continue
    } else if (isTrump && wasTrump) {
      // Higher trump wins
      if (cardValues[card.rank] > cardValues[winningCard.rank]) {
        winningCard = card
        winningCardIndex = i
      }
    } else if (followsSuit && !winnerFollowsSuit) {
      winningCard = card
      winningCardIndex = i
    } else if (followsSuit && winnerFollowsSuit) {
      // Higher card of same suit wins
      if (cardValues[card.rank] > cardValues[winningCard.rank]) {
        winningCard = card
        winningCardIndex = i
      }
    }
  }
  
  return winningCardIndex
}

// Calculate points in a round
export function calculateTrickPoints(trick: Card[]): number {
  let points = 0
  
  for (const card of trick) {
    if (card.rank === 'A') points += 4
    else if (card.rank === 'K') points += 3
    else if (card.rank === 'Q') points += 2
    else if (card.rank === 'J') points += 1
    else if (card.rank === '10') points += 10 // Ten = 10 points!
  }
  
  return points
}

// Check if a card can be played (must follow suit if possible)
export function canPlayCard(
  card: Card,
  hand: Card[],
  leadSuit: CardSuit | null,
  trumpSuit: CardSuit | null
): boolean {
  if (!leadSuit) return true // First card, can play anything
  
  // Check if player has any cards of lead suit
  const hasLeadSuit = hand.some(c => c.suit === leadSuit)
  
  if (hasLeadSuit) {
    return card.suit === leadSuit
  }
  
  // If no lead suit, check if has trump
  if (trumpSuit) {
    const hasTrump = hand.some(c => c.suit === trumpSuit)
    if (hasTrump) {
      return card.suit === trumpSuit
    }
  }
  
  return true // Can play anything if can't follow suit
}

// Get card display symbol
export function getSuitSymbol(suit: CardSuit): string {
  switch (suit) {
    case 'hearts': return '♥'
    case 'diamonds': return '♦'
    case 'clubs': return '♣'
    case 'spades': return '♠'
  }
}

// Get suit color
export function getSuitColor(suit: CardSuit): string {
  return (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black'
}

// Format card for display
export function formatCard(card: Card): string {
  const symbol = getSuitSymbol(card.suit)
  return `${card.rank}${symbol}`
}

// Shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }
  return shuffled
}
