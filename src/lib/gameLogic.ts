import { SONGS } from '../data/songs'
import type { GameState, PlacedCard, Player, Song } from '../types'

export const TARGET_CARDS = 10

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

export function placeCard(state: GameState, insertIndex: number): GameState {
  const song = state.currentCard
  if (!song) return state
  const player = state.players[state.currentPlayerIndex]
  const correct = validatePlacement(player.board, insertIndex, song)

  const players = state.players.map((p, idx) => {
    if (idx !== state.currentPlayerIndex || !correct) return p
    const board = [...p.board]
    board.splice(insertIndex, 0, song)
    return { ...p, board }
  })

  const updatedPlayer = players[state.currentPlayerIndex]
  const won = correct && updatedPlayer.board.length >= state.targetCards

  return {
    ...state,
    players,
    discard: correct ? state.discard : [...state.discard, song],
    currentCard: song,
    currentCardRevealed: true,
    lastResult: { correct, song, insertIndex },
    phase: won ? 'gameover' : 'reveal',
    winnerId: won ? updatedPlayer.id : null,
  }
}

export function advanceTurn(state: GameState): GameState {
  if (state.phase === 'gameover') return state
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    viewingPlayerIndex: nextIndex,
    currentCard: null,
    currentCardRevealed: false,
    lastResult: null,
    phase: 'playing',
  }
}

export function setViewingPlayer(state: GameState, index: number): GameState {
  if (index < 0 || index >= state.players.length) return state
  return { ...state, viewingPlayerIndex: index }
}
