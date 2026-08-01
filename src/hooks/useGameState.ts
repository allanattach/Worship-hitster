import { useCallback, useEffect, useState } from 'react'
import {
  advanceTurn,
  attachTrackMeta,
  awardToken,
  beginChallenge,
  cancelChallenge,
  createInitialGameState,
  drawNextCard,
  placeCard,
  redrawCard,
  resolveChallenge,
  setViewingPlayer,
} from '../lib/gameLogic'
import { clearGameState, loadGameState, saveGameState } from '../lib/storage'
import type { GameState } from '../types'

/** How many steps back undo can reach. Deep enough for a misclick and the turn
 * or two after it, without holding the whole game in memory. */
const UNDO_LIMIT = 25

const SETUP_STATE: GameState = {
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
  challengerId: null,
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

  const startGame = useCallback((playerNames: string[]) => {
    setTracked({ present: createInitialGameState(playerNames), past: [] })
  }, [])

  const resetGame = useCallback(() => {
    clearGameState()
    setTracked({ present: SETUP_STATE, past: [] })
  }, [])

  const draw = useCallback(() => commit(drawNextCard), [commit])
  const redraw = useCallback(() => commit(redrawCard), [commit])
  const place = useCallback((insertIndex: number) => commit((s) => placeCard(s, insertIndex)), [commit])
  const next = useCallback(() => commit(advanceTurn), [commit])
  const claimToken = useCallback(() => commit(awardToken), [commit])
  const startChallenge = useCallback((playerId: string) => commit((s) => beginChallenge(s, playerId)), [commit])
  const abortChallenge = useCallback(() => commit(cancelChallenge), [commit])
  const settleChallenge = useCallback(
    (insertIndex: number) => commit((s) => resolveChallenge(s, insertIndex)),
    [commit],
  )

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
    startChallenge,
    abortChallenge,
    settleChallenge,
    viewPlayer,
    resetGame,
  }
}
