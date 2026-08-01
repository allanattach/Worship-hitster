import type { PlacedCard, RoundResult } from '../types'
import { CardTile } from './CardTile'

interface TimelineProps {
  board: PlacedCard[]
  interactive: boolean
  onSelectGap?: (index: number) => void
  lastResult?: RoundResult | null
}

export function Timeline({ board, interactive, onSelectGap, lastResult }: TimelineProps) {
  const gapCount = board.length + 1

  return (
    <div className={`timeline ${interactive ? 'timeline--interactive' : ''}`}>
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
                aria-label={`Placér sang her (position ${gapIndex + 1})`}
              >
                +
              </button>
            ) : (
              <div className="timeline-gap timeline-gap--static" aria-hidden="true" />
            )}
            {card && <CardTile card={card} justPlaced={justPlaced} />}
          </div>
        )
      })}
      {board.length === 0 && <p className="timeline-empty">Ingen kort endnu</p>}
    </div>
  )
}
