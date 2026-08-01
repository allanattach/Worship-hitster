import { useCallback, useEffect, useState } from 'react'
import {
  advanceTurn,
  attachTrackMeta,
  awardToken,
  cancelBid,
  commitBid,
  commitPlacement,
  createInitialGameState,
  drawNextCard,
  redrawCard,
  revealRound,
  setViewingPlayer,
  startBid,
} from '../lib/gameLogic'
import {
  clearGameState,
  clearResults,
  loadGameState,
  recordResult,
  removeResult,
  saveGameState,
  saveMinYear,
  winsByName,
} from '../lib/storage'
import type { GameState } from '../types'

/** How many steps back undo can reach. Deep enough for a misclick and the turn
 * or two after it, without holding the whole game in memory. */
const UNDO_LIMIT = 25

const SETUP_STATE: GameState = {
  gameId: '',
  phase: 'setup',
  players: [],
  currentPlayerIndex: 0,
  viewingPlayerIndex: 0,
  deck: [],
  discard: [],
  currentCard: null,
  currentCardRevealed: false,
  lastResult: null,
  winnerId: null,
  targetCards: 10,
  minYear: 0,
  pendingPlacement: null,
  bids: [],
  activeBidderId: null,
}

/** Current state plus the snapshots undo can step back through. Kept in one
 * piece of state so every transition is a single pure update. */
interface Tracked {
  present: GameState
  past: GameState[]
}

export function useGameState() {
  const [tracked, setTracked] = useState<Tracked>(() => ({
    present: loadGameState() ?? SETUP_STATE,
    past: [],
  }))
  const state = tracked.present
  const [standings, setStandings] = useState(() => winsByName())

  // Record the win once the game is over, keyed by game id so a re-render
  // cannot double count. Undoing back out of the win removes it again.
  const winnerName = state.players.find((p) => p.id === state.winnerId)?.name
  useEffect(() => {
    if (!state.gameId) return
    if (state.phase === 'gameover' && winnerName) recordResult(state.gameId, winnerName)
    else removeResult(state.gameId)
    setStandings(winsByName())
  }, [state.gameId, state.phase, winnerName])

  useEffect(() => {
    if (state.phase === 'setup') {
      clearGameState()
    } else {
      saveGameState(state)
    }
  }, [state])

  /** Applies a player action, remembering the state before it. An action that
   * changes nothing does not become an undo step. */
  const commit = useCallback((change: (s: GameState) => GameState) => {
    setTracked(({ present, past }) => {
      const next = change(present)
      if (next === present) return { present, past }
      return { present: next, past: [...past, present].slice(-UNDO_LIMIT) }
    })
  }, [])

  /** For changes that are not player moves, so they leave history alone. */
  const amend = useCallback((change: (s: GameState) => GameState) => {
    setTracked(({ present, past }) => {
      const next = change(present)
      return next === present ? { present, past } : { present: next, past }
    })
  }, [])

  const undo = useCallback(() => {
    setTracked(({ present, past }) => {
      if (past.length === 0) return { present, past }
      return { present: past[past.length - 1], past: past.slice(0, -1) }
    })
  }, [])

  const startGame = useCallback((playerNames: string[], minYear: number) => {
    saveMinYear(minYear)
    setTracked({ present: createInitialGameState(playerNames, minYear), past: [] })
  }, [])

  const resetGame = useCallback(() => {
    clearGameState()
    setTracked({ present: SETUP_STATE, past: [] })
  }, [])

  /** Straight into another game with the same players and the same year range. */
  const rematch = useCallback(() => {
    setTracked(({ present }) => ({
      present: createInitialGameState(
        present.players.map((p) => p.name),
        present.minYear,
      ),
      past: [],
    }))
  }, [])

  const resetStandings = useCallback(() => {
    clearResults()
    setStandings(winsByName())
  }, [])

  const draw = useCallback(() => commit(drawNextCard), [commit])
  const redraw = useCallback(() => commit(redrawCard), [commit])
  const place = useCallback((insertIndex: number) => commit((s) => commitPlacement(s, insertIndex)), [commit])
  const next = useCallback(() => commit(advanceTurn), [commit])
  const claimToken = useCallback(() => commit(awardToken), [commit])
  const reveal = useCallback(() => commit(revealRound), [commit])
  const bidStart = useCallback((playerId: string) => commit((s) => startBid(s, playerId)), [commit])
  const bidCancel = useCallback(() => commit(cancelBid), [commit])
  const bidPlace = useCallback((insertIndex: number) => commit((s) => commitBid(s, insertIndex)), [commit])

  // Cover art arrives from Spotify, not from a player, so it is not a move.
  const attachMeta = useCallback(
    (songId: string, meta: { uri?: string; albumImageUrl?: string }) => {
      amend((s) => attachTrackMeta(s, songId, meta))
    },
    [amend],
  )

  // Browsing another player's board is navigation, not a move to undo.
  const viewPlayer = useCallback((index: number) => amend((s) => setViewingPlayer(s, index)), [amend])

  return {
    state,
    canUndo: tracked.past.length > 0,
    undo,
    startGame,
    draw,
    redraw,
    attachMeta,
    place,
    next,
    claimToken,
    reveal,
    bidStart,
    bidCancel,
    bidPlace,
    viewPlayer,
    resetGame,
    rematch,
    standings,
    resetStandings,
  }
}
