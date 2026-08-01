import { songLinks } from '../lib/songLinks'
import type { PlacedCard } from '../types'

const GENRE_LABELS: Record<string, string> = {
  hymn: 'Salme',
  gospel: 'Gospel',
  ccm: 'CCM',
  worship: 'Lovsang',
  rock: 'Rock',
  pop: 'Pop',
}

interface CardDetailsProps {
  card: PlacedCard
  onClose: () => void
}

/**
 * Folds out over the board when a card is tapped, so a card placed earlier can
 * still be read about. Overlays rather than takes up layout space, which keeps
 * the board from being squeezed on a short landscape screen.
 */
export function CardDetails({ card, onClose }: CardDetailsProps) {
  return (
    <div className="card-details" role="dialog" aria-label={`Om ${card.title}`}>
      {card.albumImageUrl && <img className="card-details-art" src={card.albumImageUrl} alt="" />}
      <div className="card-details-text">
        <span className="card-details-title">
          {card.title}
          <span className="card-details-year">{card.year}</span>
        </span>
        <span className="card-details-artist">
          {card.artist}
          <span className="card-details-genre">{GENRE_LABELS[card.genre] ?? card.genre}</span>
        </span>
        <div className="song-links">
          {songLinks(card).map((link) => (
            <a key={link.href} className="song-link" href={link.href} target="_blank" rel="noreferrer">
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
      <button type="button" className="icon-btn icon-btn--sm card-details-close" onClick={onClose} aria-label="Luk">
        ×
      </button>
    </div>
  )
}
