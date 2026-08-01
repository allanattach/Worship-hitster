import type { Player } from '../types'

interface PlayerSwitcherProps {
  players: Player[]
  currentPlayerIndex: number
  viewingPlayerIndex: number
  onView: (index: number) => void
  targetCards: number
}

export function PlayerSwitcher({ players, currentPlayerIndex, viewingPlayerIndex, onView, targetCards }: PlayerSwitcherProps) {
  function step(delta: number) {
    const next = (viewingPlayerIndex + delta + players.length) % players.length
    onView(next)
  }

  return (
    <div className="player-switcher">
      <button type="button" className="icon-btn" onClick={() => step(-1)} aria-label="Forrige spiller">
        ‹
      </button>
      <div className="player-pills">
        {players.map((player, index) => (
          <button
            type="button"
            key={player.id}
            className={`player-pill ${index === viewingPlayerIndex ? 'player-pill--viewing' : ''} ${
              index === currentPlayerIndex ? 'player-pill--turn' : ''
            }`}
            onClick={() => onView(index)}
          >
            <span className="player-pill-name">{player.name}</span>
            <span className="player-pill-count">
              {player.board.length}/{targetCards}
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="icon-btn" onClick={() => step(1)} aria-label="Næste spiller">
        ›
      </button>
    </div>
  )
}
