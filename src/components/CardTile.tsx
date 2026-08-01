import type { PlacedCard } from '../types'

const GENRE_LABELS: Record<string, string> = {
  hymn: 'Salme',
  gospel: 'Gospel',
  ccm: 'CCM',
  worship: 'Lovsang',
  rock: 'Rock',
  pop: 'Pop',
}

interface CardTileProps {
  card: PlacedCard
  justPlaced?: boolean
  /** Below roughly 110px there is no room for artist and genre lines. */
  compact?: boolean
  /** Tapping the card folds out its details. Omit to render a plain tile. */
  onSelect?: () => void
  selected?: boolean
}

export function CardTile({ card, justPlaced, compact, onSelect, selected }: CardTileProps) {
  const className = [
    'card-tile',
    justPlaced ? 'card-tile--placed' : '',
    compact ? 'card-tile--compact' : '',
    onSelect ? 'card-tile--tappable' : '',
    selected ? 'card-tile--selected' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <div className="card-tile-art">
        {card.albumImageUrl ? (
          <img src={card.albumImageUrl} alt="" loading="lazy" />
        ) : (
          <span className="card-tile-art-fallback" aria-hidden="true">
            ♪
          </span>
        )}
        <span className="card-tile-year">{card.year}</span>
      </div>
      <div className="card-tile-text">
        <span className="card-tile-title">{card.title}</span>
        {!compact && (
          <>
            <span className="card-tile-artist">{card.artist}</span>
            <span className="card-tile-genre">{GENRE_LABELS[card.genre] ?? card.genre}</span>
          </>
        )}
      </div>
    </>
  )

  if (!onSelect) return <div className={className}>{content}</div>

  return (
    <button
      type="button"
      className={className}
      onClick={onSelect}
      aria-expanded={selected}
      title={`${card.title} – ${card.artist} (${card.year})`}
    >
      {content}
    </button>
  )
}
