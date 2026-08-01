import { SONGS } from '../data/songs'
import type { GameState, PlacedCard, Player, Song } from '../types'

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
    challengerId: null,
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
    // A wrongly placed card is not discarded yet: another player may still bid
    // in and claim it. advanceTurn discards whatever nobody took.
    currentCard: song,
    currentCardRevealed: true,
    lastResult: { correct, song, insertIndex },
    phase: won ? 'gameover' : 'reveal',
    winnerId: won ? updatedPlayer.id : null,
  }
}

/** Players other than the one in turn who could still bid in on this card. */
export function eligibleChallengers(state: GameState): Player[] {
  if (state.phase !== 'reveal') return []
  const result = state.lastResult
  if (!result || result.correct || result.challengerId) return []
  const current = state.players[state.currentPlayerIndex]
  return state.players.filter((p) => p.id !== current.id && p.tokens > 0)
}

/** Spends a token to let `playerId` try to claim the card the player in turn
 * placed wrongly. */
export function beginChallenge(state: GameState, playerId: string): GameState {
  if (!eligibleChallengers(state).some((p) => p.id === playerId)) return state
  const index = state.players.findIndex((p) => p.id === playerId)
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? { ...p, tokens: p.tokens - 1 } : p)),
    challengerId: playerId,
    viewingPlayerIndex: index,
    phase: 'challenge',
  }
}

export function cancelChallenge(state: GameState): GameState {
  if (state.phase !== 'challenge' || !state.challengerId) return state
  // Hand the token back, since nothing was staked in the end.
  return {
    ...state,
    players: state.players.map((p) => (p.id === state.challengerId ? { ...p, tokens: p.tokens + 1 } : p)),
    challengerId: null,
    viewingPlayerIndex: state.currentPlayerIndex,
    phase: 'reveal',
  }
}

export function resolveChallenge(state: GameState, insertIndex: number): GameState {
  const song = state.currentCard
  if (state.phase !== 'challenge' || !song || !state.challengerId) return state
  const challengerIndex = state.players.findIndex((p) => p.id === state.challengerId)
  if (challengerIndex < 0) return state

  const challenger = state.players[challengerIndex]
  const correct = validatePlacement(challenger.board, insertIndex, song)

  const players = state.players.map((p, idx) => {
    if (idx !== challengerIndex || !correct) return p
    const board = [...p.board]
    board.splice(insertIndex, 0, song)
    return { ...p, board }
  })

  const won = correct && players[challengerIndex].board.length >= state.targetCards

  return {
    ...state,
    players,
    lastResult: { ...state.lastResult!, challengerId: state.challengerId, challengerCorrect: correct },
    phase: won ? 'gameover' : 'reveal',
    winnerId: won ? players[challengerIndex].id : null,
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
  const unclaimed = result && !result.correct && !result.challengerCorrect ? result.song : null
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    viewingPlayerIndex: nextIndex,
    discard: unclaimed ? [...state.discard, unclaimed] : state.discard,
    currentCard: null,
    currentCardRevealed: false,
    lastResult: null,
    challengerId: null,
    phase: 'playing',
  }
}

export function setViewingPlayer(state: GameState, index: number): GameState {
  if (index < 0 || index >= state.players.length) return state
  return { ...state, viewingPlayerIndex: index }
}
