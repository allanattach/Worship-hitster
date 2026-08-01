import type { Player } from '../types'
import { Timeline } from './Timeline'

interface WinnerScreenProps {
  winner: Player
  onNewGame: () => void
}

export function WinnerScreen({ winner, onNewGame }: WinnerScreenProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-panel winner-panel">
        <h2>🏆 {winner.name} vinder!</h2>
        <p>{winner.name} har samlet {winner.board.length} kort i korrekt årgangsrækkefølge.</p>
        <div className="winner-board">
          <Timeline board={winner.board} interactive={false} />
        </div>
        <button type="button" className="btn btn-primary" onClick={onNewGame}>
          Spil igen
        </button>
      </div>
    </div>
  )
}
