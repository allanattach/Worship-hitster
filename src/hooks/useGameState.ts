import { useCallback, useEffect, useState } from 'react'
import {
  advanceTurn,
  attachTrackMeta,
  createInitialGameState,
  drawNextCard,
  placeCard,
  redrawCard,
  setViewingPlayer,
} from '../lib/gameLogic'
import { clearGameState, loadGameState, saveGameState } from '../lib/storage'
import type { GameState } from '../types'

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
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadGameState() ?? SETUP_STATE)

  useEffect(() => {
    if (state.phase === 'setup') {
      clearGameState()
    } else {
      saveGameState(state)
    }
  }, [state])

  const startGame = useCallback((playerNames: string[]) => {
    setState(createInitialGameState(playerNames))
  }, [])

  const draw = useCallback(() => {
    setState((s) => drawNextCard(s))
  }, [])

  const redraw = useCallback(() => {
    setState((s) => redrawCard(s))
  }, [])

  const attachMeta = useCallback((songId: string, meta: { uri?: string; albumImageUrl?: string }) => {
    setState((s) => attachTrackMeta(s, songId, meta))
  }, [])

  const place = useCallback((insertIndex: number) => {
    setState((s) => placeCard(s, insertIndex))
  }, [])

  const next = useCallback(() => {
    setState((s) => advanceTurn(s))
  }, [])

  const viewPlayer = useCallback((index: number) => {
    setState((s) => setViewingPlayer(s, index))
  }, [])

  const resetGame = useCallback(() => {
    clearGameState()
    setState(SETUP_STATE)
  }, [])

  return { state, startGame, draw, redraw, attachMeta, place, next, viewPlayer, resetGame }
}
