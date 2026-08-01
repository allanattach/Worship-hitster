import type { Player } from '../types'
import { Timeline } from './Timeline'

interface WinnerScreenProps {
  winner: Player
  standings: { name: string; wins: number }[]
  onRematch: () => void
  onNewGame: () => void
  /** This panel covers the top bar, so undo has to be reachable from here too
   * - a game can end on a mistaken tap. */
  onUndo: () => void
  canUndo: boolean
}

export function WinnerScreen({ winner, standings, onRematch, onNewGame, onUndo, canUndo }: WinnerScreenProps) {
  const winnerWins = standings.find((s) => s.name.toLowerCase() === winner.name.trim().toLowerCase())?.wins ?? 1

  return (
    <div className="modal-overlay">
      <div className="modal-panel winner-panel">
        <h2>🏆 {winner.name} vinder!</h2>
        <p>
          {winner.name} har samlet {winner.board.length} kort i korrekt årgangsrækkefølge
          {winnerWins > 1 ? ` – det er sejr nummer ${winnerWins}.` : '.'}
        </p>

        <div className="winner-board">
          {/* Smaller share than the in-game board: this panel also carries the
              standings and the buttons. */}
          <Timeline board={winner.board} interactive={false} fit heightShare={0.3} />
        </div>

        {standings.length > 0 && (
          <div className="standings">
            <h3 className="standings-heading">Vundne spil</h3>
            <ol className="standings-list">
              {standings.map((entry, index) => (
                <li
                  key={entry.name}
                  className={entry.name.toLowerCase() === winner.name.trim().toLowerCase() ? 'standings-row--winner' : undefined}
                >
                  <span className="standings-rank">{index + 1}.</span>
                  <span className="standings-name">{entry.name}</span>
                  <span className="standings-wins">{entry.wins}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="winner-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={onRematch}>
            Spil igen med samme spillere
          </button>
          <button type="button" className="btn btn-secondary" onClick={onNewGame}>
            Nye spillere
          </button>
        </div>
        {canUndo && (
          <button type="button" className="link-btn link-btn--inline winner-undo" onClick={onUndo}>
            ↶ Fortryd sidste træk
          </button>
        )}
      </div>
    </div>
  )
}
