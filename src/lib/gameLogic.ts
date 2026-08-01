import { SONGS } from '../data/songs'
import type { GameState, PlacedCard, Player, ResolvedBid, Song } from '../types'

export const TARGET_CARDS = 10
export const START_TOKENS = 2

export function shuffle<T>(input: T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function makePlayerId(name: string, index: number) {
  return `${index}-${name.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`
}

export function createInitialGameState(playerNames: string[]): GameState {
  const players: Player[] = playerNames.map((name, index) => ({
    id: makePlayerId(name, index),
    name: name.trim(),
    board: [],
    tokens: START_TOKENS,
  }))

  const deck = shuffle(SONGS)
  // Give each player one free starter card to seed their timeline.
  const startCards: PlacedCard[] = []
  for (let i = 0; i < players.length; i++) {
    const card = deck.pop()
    if (card) startCards.push(card)
  }
  players.forEach((player, index) => {
    if (startCards[index]) player.board = [startCards[index]]
  })

  return {
    phase: 'playing',
    players,
    currentPlayerIndex: 0,
    viewingPlayerIndex: 0,
    deck,
    discard: [],
    currentCard: null,
    currentCardRevealed: false,
    lastResult: null,
    winnerId: null,
    targetCards: TARGET_CARDS,
    pendingPlacement: null,
    bids: [],
    activeBidderId: null,
  }
}

export function drawNextCard(state: GameState): GameState {
  let deck = state.deck
  let discard = state.discard
  if (deck.length === 0) {
    if (discard.length === 0) return state
    deck = shuffle(discard)
    discard = []
  }
  const [card, ...rest] = deck
  return {
    ...state,
    deck: rest,
    discard,
    currentCard: card,
    currentCardRevealed: false,
    phase: 'placing',
  }
}

/** Records the Spotify lookup on the drawn card so the cover art follows it
 * onto the board and into saved state. */
export function attachTrackMeta(
  state: GameState,
  songId: string,
  meta: { uri?: string; albumImageUrl?: string },
): GameState {
  if (!state.currentCard || state.currentCard.id !== songId) return state
  return {
    ...state,
    currentCard: {
      ...state.currentCard,
      spotifyUri: meta.uri ?? state.currentCard.spotifyUri,
      albumImageUrl: meta.albumImageUrl ?? state.currentCard.albumImageUrl,
    },
  }
}

/** Swaps the current card for a fresh one when it cannot be played. This is not
 * a wrong guess: nothing is scored and the same player stays in turn. */
export function redrawCard(state: GameState): GameState {
  if (state.phase !== 'placing' || !state.currentCard) return state
  const withoutCurrent: GameState = {
    ...state,
    discard: [...state.discard, state.currentCard],
    currentCard: null,
  }
  return drawNextCard(withoutCurrent)
}

/** A song fits at insertIndex if it's not earlier than its left neighbour
 * and not later than its right neighbour. Equal years are always valid
 * next to a matching year. */
export function validatePlacement(board: PlacedCard[], insertIndex: number, song: Song): boolean {
  const left = board[insertIndex - 1]
  const right = board[insertIndex]
  if (left && song.year < left.year) return false
  if (right && song.year > right.year) return false
  return true
}

/** Records where the player in turn put the card, without revealing anything.
 * The card stays face down so the others can bid blind. */
export function commitPlacement(state: GameState, insertIndex: number): GameState {
  if (state.phase !== 'placing' || !state.currentCard) return state
  return { ...state, pendingPlacement: insertIndex, phase: 'bidding' }
}

/** Players who could still bid in this round: everyone except the player in
 * turn, who holds a token and has not already bid. */
export function eligibleBidders(state: GameState): Player[] {
  if (state.phase !== 'bidding') return []
  const current = state.players[state.currentPlayerIndex]
  return state.players.filter(
    (p) => p.id !== current.id && p.tokens > 0 && !state.bids.some((b) => b.playerId === p.id),
  )
}

/** Takes the token up front and hands the bidder their own board to place on. */
export function startBid(state: GameState, playerId: string): GameState {
  if (!eligibleBidders(state).some((p) => p.id === playerId)) return state
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? { ...p, tokens: p.tokens - 1 } : p)),
    activeBidderId: playerId,
    viewingPlayerIndex: state.players.findIndex((p) => p.id === playerId),
    phase: 'bidPlacing',
  }
}

export function cancelBid(state: GameState): GameState {
  if (state.phase !== 'bidPlacing' || !state.activeBidderId) return state
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === state.activeBidderId ? { ...p, tokens: p.tokens + 1 } : p,
    ),
    activeBidderId: null,
    viewingPlayerIndex: state.currentPlayerIndex,
    phase: 'bidding',
  }
}

export function commitBid(state: GameState, insertIndex: number): GameState {
  if (state.phase !== 'bidPlacing' || !state.activeBidderId) return state
  return {
    ...state,
    bids: [...state.bids, { playerId: state.activeBidderId, insertIndex }],
    activeBidderId: null,
    viewingPlayerIndex: state.currentPlayerIndex,
    phase: 'bidding',
  }
}

/**
 * Turns the card face up and settles every placement at once.
 *
 * The player in turn is checked first. Only if they were wrong can a bid take
 * the card, and then the earliest correct bid wins it. Tokens were already
 * spent when bidding, so a losing bid simply keeps nothing.
 */
export function revealRound(state: GameState): GameState {
  const song = state.currentCard
  if (state.phase !== 'bidding' || !song || state.pendingPlacement === null) return state

  const currentPlayer = state.players[state.currentPlayerIndex]
  const insertIndex = state.pendingPlacement
  const correct = validatePlacement(currentPlayer.board, insertIndex, song)

  const resolvedBids: ResolvedBid[] = state.bids.map((bid) => {
    const bidder = state.players.find((p) => p.id === bid.playerId)
    return {
      ...bid,
      correct: !!bidder && validatePlacement(bidder.board, bid.insertIndex, song),
    }
  })

  const winningBid = correct ? undefined : resolvedBids.find((b) => b.correct)
  const takerId = correct ? currentPlayer.id : winningBid?.playerId

  const players = state.players.map((p) => {
    if (p.id !== takerId) return p
    const at = correct ? insertIndex : winningBid!.insertIndex
    const board = [...p.board]
    board.splice(at, 0, song)
    return { ...p, board }
  })

  const taker = players.find((p) => p.id === takerId)
  const won = !!taker && taker.board.length >= state.targetCards

  return {
    ...state,
    players,
    currentCardRevealed: true,
    pendingPlacement: null,
    lastResult: {
      song,
      correct,
      insertIndex,
      bids: resolvedBids,
      wonByBidderId: winningBid?.playerId,
    },
    phase: won ? 'gameover' : 'reveal',
    winnerId: won ? taker!.id : null,
  }
}

/** Awards the player in turn a token for also naming the title and artist.
 * The group vouches for the answer; the app only tracks the count. */
export function awardToken(state: GameState): GameState {
  if (state.phase !== 'reveal' || !state.lastResult || state.lastResult.tokenAwarded) return state
  return {
    ...state,
    players: state.players.map((p, idx) =>
      idx === state.currentPlayerIndex ? { ...p, tokens: p.tokens + 1 } : p,
    ),
    lastResult: { ...state.lastResult, tokenAwarded: true },
  }
}

export function advanceTurn(state: GameState): GameState {
  if (state.phase === 'gameover') return state
  const result = state.lastResult
  const unclaimed = result && !result.correct && !result.wonByBidderId ? result.song : null
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    viewingPlayerIndex: nextIndex,
    discard: unclaimed ? [...state.discard, unclaimed] : state.discard,
    currentCard: null,
    currentCardRevealed: false,
    lastResult: null,
    pendingPlacement: null,
    bids: [],
    activeBidderId: null,
    phase: 'playing',
  }
}

export function setViewingPlayer(state: GameState, index: number): GameState {
  if (index < 0 || index >= state.players.length) return state
  return { ...state, viewingPlayerIndex: index }
}
