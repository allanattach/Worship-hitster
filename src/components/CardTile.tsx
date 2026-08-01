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
}

export function CardTile({ card, justPlaced, compact }: CardTileProps) {
  return (
    <div className={`card-tile ${justPlaced ? 'card-tile--placed' : ''} ${compact ? 'card-tile--compact' : ''}`}>
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
    </div>
  )
}
