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
}

export function CardTile({ card, justPlaced }: CardTileProps) {
  return (
    <div className={`card-tile ${justPlaced ? 'card-tile--correct' : ''}`}>
      <span className="card-tile-year">{card.year}</span>
      <span className="card-tile-title">{card.title}</span>
      <span className="card-tile-artist">{card.artist}</span>
      <span className="card-tile-genre">{GENRE_LABELS[card.genre] ?? card.genre}</span>
    </div>
  )
}
