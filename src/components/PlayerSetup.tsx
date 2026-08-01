import { useState, type ReactNode } from 'react'

interface PlayerSetupProps {
  onStart: (names: string[]) => void
  children?: ReactNode
}

const MIN_PLAYERS = 2

export function PlayerSetup({ onStart, children }: PlayerSetupProps) {
  const [names, setNames] = useState<string[]>(['', ''])

  function updateName(index: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)))
  }

  function addPlayer() {
    setNames((prev) => [...prev, ''])
  }

  function removePlayer(index: number) {
    setNames((prev) => (prev.length <= MIN_PLAYERS ? prev : prev.filter((_, i) => i !== index)))
  }

  const trimmed = names.map((n) => n.trim())
  const validNames = trimmed.filter(Boolean)
  const lowerSet = new Set(validNames.map((n) => n.toLowerCase()))
  const hasDuplicates = lowerSet.size !== validNames.length
  const canStart = validNames.length >= MIN_PLAYERS && !hasDuplicates && validNames.length === names.length

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <h1 className="setup-title">Worship Hitster</h1>
        <p className="setup-subtitle">
          Gæt årstallet for kristne sange, salmer, lovsange og worship-hits. Placér hvert kort rigtigt på din
          tidslinje – den første med 10 kort i rækkefølge vinder!
        </p>

        <h2 className="setup-section-heading">Spillere</h2>
        <div className="player-list">
          {names.map((name, index) => (
            <div className="player-row" key={index}>
              <input
                className="player-input"
                value={name}
                onChange={(e) => updateName(index, e.target.value)}
                placeholder={`Spiller ${index + 1}`}
                maxLength={24}
              />
              {names.length > MIN_PLAYERS && (
                <button
                  type="button"
                  className="icon-btn remove-player"
                  onClick={() => removePlayer(index)}
                  aria-label={`Fjern spiller ${index + 1}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-secondary add-player-btn" onClick={addPlayer}>
          + Tilføj spiller
        </button>

        {hasDuplicates && <p className="setup-warning">To spillere har samme navn – navnene skal være unikke.</p>}

        {children}

        <button type="button" className="btn btn-primary start-btn" disabled={!canStart} onClick={() => onStart(validNames)}>
          Start spil
        </button>
      </div>
    </div>
  )
}
