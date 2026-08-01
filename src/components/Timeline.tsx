import { useEffect, useRef } from 'react'
import { useElementWidth } from '../hooks/useElementWidth'
import { useViewportSize } from '../hooks/useViewportSize'
import type { PlacedCard, RoundResult } from '../types'
import { CardTile } from './CardTile'

export const CARD_WIDTH_MIN = 52
export const CARD_WIDTH_BASE = 132
export const CARD_WIDTH_MAX = 210
const COMPACT_BELOW = 106
const ROW_GAP = 2
/** A card is roughly this many times taller than it is wide, including its text. */
const CARD_ASPECT = 1.4
/** Above this many cards the row wraps onto a second line, so cards stay wide
 * enough to read instead of shrinking to fit one line. */
const WRAP_ABOVE = 5
/** Vertical space between wrapped rows, matching the CSS row-gap. */
const WRAP_ROW_GAP = 10
/** Share of a short landscape viewport the board may take, leaving room for the
 * turn banner, the switcher and the mystery card without scrolling. */
const LANDSCAPE_BOARD_SHARE = 0.44

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
  /** Share of a short landscape viewport this board may occupy. Lower it where
   * the board shares the screen with more than the mystery card. */
  heightShare?: number
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
  heightShare = LANDSCAPE_BOARD_SHARE,
}: TimelineProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const available = useElementWidth(viewportRef)
  const viewport = useViewportSize()

  const gapCount = board.length + 1
  // A face-down card occupies a slot of its own, so it counts toward the fit.
  const cardCount = board.length + (pendingIndex !== null ? 1 : 0)
  const kind = interactive ? 'interactive' : 'static'

  // Past a handful of cards, wrapping onto a second line buys back roughly
  // double the width per card. Only fit mode wraps; manual zoom stays on one
  // line so zooming in can still be scrolled through.
  const rows = fit && cardCount > WRAP_ABOVE ? 2 : 1
  const perRow = Math.ceil(cardCount / rows)
  // Chrome for a single line: one gap per slot plus the trailing one, the flex
  // gaps between them, and slack for rounding and any scrollbar gutter.
  const chromeFor = (gap: number) => (perRow + 1) * gap + (2 * perRow + 1) * ROW_GAP + 14

  let gapWidth = GAP_PREFERRED[kind]
  let cardWidth: number

  if (fit && available > 0 && cardCount > 0) {
    cardWidth = Math.floor((available - chromeFor(gapWidth)) / perRow)
    if (cardWidth < CARD_WIDTH_BASE) {
      // Buy back card width from the gaps before shrinking cards any further.
      gapWidth = GAP_MIN[kind]
      cardWidth = Math.floor((available - chromeFor(gapWidth)) / perRow)
    }
  } else {
    cardWidth = CARD_WIDTH_BASE * zoom
  }

  // On a wide, short screen large cards would push the mystery card off the
  // bottom, so cap the width by the vertical space the board may use. Two rows
  // have to share that space, so the cap halves when wrapping.
  const isLandscape = viewport.width > viewport.height
  const heightCap = isLandscape
    ? Math.floor((viewport.height * heightShare - (rows - 1) * WRAP_ROW_GAP) / (rows * CARD_ASPECT))
    : CARD_WIDTH_MAX

  cardWidth = clamp(cardWidth, CARD_WIDTH_MIN, Math.max(CARD_WIDTH_MIN, Math.min(CARD_WIDTH_MAX, heightCap)))
  const compact = cardWidth < COMPACT_BELOW

  // Wrapped rows reflow rather than overflow, so the scroll hint is only for
  // the single-line case.
  const contentWidth = perRow * cardWidth + (perRow + 1) * gapWidth + (2 * perRow + 1) * ROW_GAP
  const overflowing = rows === 1 && available > 0 && contentWidth > available + 1

  // Split the slots into rows here rather than leaving it to flex-wrap, which
  // fills the first row greedily and strands the remainder. Each slot is one
  // insertion gap plus the card after it; the final gap-only slot joins the
  // last row so it never forms a row of its own.
  const rowsOfSlots: number[][] = []
  for (let r = 0; r < rows; r++) {
    const start = r * perRow
    const end = Math.min(start + perRow, board.length)
    const slots: number[] = []
    for (let i = start; i < end; i++) slots.push(i)
    if (slots.length > 0 || r === 0) rowsOfSlots.push(slots)
  }
  rowsOfSlots[rowsOfSlots.length - 1].push(board.length)

  useEffect(() => {
    onResolvedWidth?.(cardWidth)
  }, [cardWidth, onResolvedWidth])

  return (
    <div
      className={`timeline-viewport ${overflowing ? 'timeline-viewport--overflow' : ''}`}
      ref={viewportRef}
    >
      <div
        className={`timeline ${interactive ? 'timeline--interactive' : ''} ${rows > 1 ? 'timeline--wrap' : ''}`}
        style={{ ['--card-w' as string]: `${cardWidth}px`, ['--gap-w' as string]: `${gapWidth}px` }}
      >
        {rowsOfSlots.map((slots, rowIndex) => (
          <div className="timeline-row" key={rowIndex}>
            {slots.map((gapIndex) => {
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
          </div>
        ))}
        {board.length === 0 && <p className="timeline-empty">Ingen kort endnu</p>}
      </div>
    </div>
  )
}
