import { useEffect, useRef } from 'react'
import { useElementWidth } from '../hooks/useElementWidth'
import type { PlacedCard, RoundResult } from '../types'
import { CardTile } from './CardTile'

export const CARD_WIDTH_MIN = 52
export const CARD_WIDTH_BASE = 132
export const CARD_WIDTH_MAX = 210
const COMPACT_BELOW = 106
const ROW_GAP = 2

// Insertion gaps must stay tappable, but eleven of them at full width eat more
// room than the cards do, so they shrink first when space runs short.
const GAP_PREFERRED = { interactive: 18, static: 8 }
const GAP_MIN = { interactive: 12, static: 4 }

interface TimelineProps {
  board: PlacedCard[]
  interactive: boolean
  onSelectGap?: (index: number) => void
  lastResult?: RoundResult | null
  /** 1 = base size. Ignored while `fit` is on. */
  zoom?: number
  /** Shrink cards and gaps so the whole row fits the available width. */
  fit?: boolean
  /** Reports the card width actually used, so zoom can continue from it. */
  onResolvedWidth?: (width: number) => void
  /** Slot holding a card that has been placed but not yet turned over. Shown
   * face down so everyone can see where it went without seeing what it is. */
  pendingIndex?: number | null
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function Timeline({
  board,
  interactive,
  onSelectGap,
  lastResult,
  zoom = 1,
  fit = true,
  onResolvedWidth,
  pendingIndex = null,
}: TimelineProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const available = useElementWidth(viewportRef)

  const gapCount = board.length + 1
  // A face-down card occupies a slot of its own, so it counts toward the fit.
  const cardCount = board.length + (pendingIndex !== null ? 1 : 0)
  const kind = interactive ? 'interactive' : 'static'
  // Trailing slack absorbs sub-pixel rounding and any scrollbar gutter.
  const chromeFor = (gap: number) => gapCount * gap + (gapCount + cardCount) * ROW_GAP + 14

  let gapWidth = GAP_PREFERRED[kind]
  let cardWidth: number

  if (fit && available > 0 && cardCount > 0) {
    cardWidth = Math.floor((available - chromeFor(gapWidth)) / cardCount)
    if (cardWidth < CARD_WIDTH_BASE) {
      // Buy back card width from the gaps before shrinking cards any further.
      gapWidth = GAP_MIN[kind]
      cardWidth = Math.floor((available - chromeFor(gapWidth)) / cardCount)
    }
  } else {
    cardWidth = CARD_WIDTH_BASE * zoom
  }

  cardWidth = clamp(cardWidth, CARD_WIDTH_MIN, CARD_WIDTH_MAX)
  const compact = cardWidth < COMPACT_BELOW

  const contentWidth = cardCount * cardWidth + gapCount * gapWidth + (gapCount + cardCount) * ROW_GAP
  const overflowing = available > 0 && contentWidth > available + 1

  useEffect(() => {
    onResolvedWidth?.(cardWidth)
  }, [cardWidth, onResolvedWidth])

  return (
    <div
      className={`timeline-viewport ${overflowing ? 'timeline-viewport--overflow' : ''}`}
      ref={viewportRef}
    >
      <div
        className={`timeline ${interactive ? 'timeline--interactive' : ''}`}
        style={{ ['--card-w' as string]: `${cardWidth}px`, ['--gap-w' as string]: `${gapWidth}px` }}
      >
        {Array.from({ length: gapCount }).map((_, gapIndex) => {
          const card = board[gapIndex]
          const justPlaced = !!lastResult && lastResult.correct && lastResult.insertIndex === gapIndex
          return (
            <div className="timeline-slot" key={gapIndex}>
              {interactive ? (
                <button
                  type="button"
                  className="timeline-gap"
                  onClick={() => onSelectGap?.(gapIndex)}
                  aria-label={`Placér sangen her (position ${gapIndex + 1} af ${gapCount})`}
                >
                  <span aria-hidden="true">+</span>
                </button>
              ) : (
                <div className="timeline-gap timeline-gap--static" aria-hidden="true" />
              )}
              {pendingIndex === gapIndex && (
                <div className="card-tile card-tile--facedown" aria-label="Placeret kort, endnu ikke vendt">
                  <span aria-hidden="true">?</span>
                </div>
              )}
              {card && <CardTile card={card} justPlaced={justPlaced} compact={compact} />}
            </div>
          )
        })}
        {board.length === 0 && <p className="timeline-empty">Ingen kort endnu</p>}
      </div>
    </div>
  )
}
