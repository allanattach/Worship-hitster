import { useState, type ReactNode } from 'react'
import { ALL_YEARS, availableSongs } from '../lib/gameLogic'
import { loadMinYear } from '../lib/storage'

interface PlayerSetupProps {
  onStart: (names: string[], minYear: number) => void
  standings: { name: string; wins: number }[]
  onResetStandings: () => void
  children?: ReactNode
}

const MIN_PLAYERS = 2
const YEAR_PRESETS = [ALL_YEARS, 1950, 1970, 1990, 2000, 2010]
/** Below this the same songs would come round too often to be fun. */
const MIN_SONGS = 12

export function PlayerSetup({ onStart, standings, onResetStandings, children }: PlayerSetupProps) {
  const [names, setNames] = useState<string[]>(['', ''])
  const [minYear, setMinYear] = useState<number>(() => loadMinYear())

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
  const songCount = availableSongs(minYear).length
  const tooFewSongs = songCount < MIN_SONGS
  const canStart =
    validNames.length >= MIN_PLAYERS && !hasDuplicates && validNames.length === names.length && !tooFewSongs

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

        <h2 className="setup-section-heading">Ældste årgang</h2>
        <p className="setup-note">
          Vælg hvor gamle sange der må være med. Salmer og gamle klassikere kan slås fra, hvis I helst vil spille om
          nyere musik.
        </p>
        <div className="year-presets">
          {YEAR_PRESETS.map((year) => (
            <button
              type="button"
              key={year}
              className={`year-chip ${minYear === year ? 'year-chip--active' : ''}`}
              onClick={() => setMinYear(year)}
            >
              {year === ALL_YEARS ? 'Alle årgange' : `${year} og nyere`}
            </button>
          ))}
        </div>
        <label className="year-custom">
          <span>Eller vælg selv:</span>
          <input
            className="player-input year-input"
            type="number"
            inputMode="numeric"
            min={0}
            max={2026}
            step={1}
            value={minYear === ALL_YEARS ? '' : minYear}
            placeholder="fx 1963"
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10)
              setMinYear(Number.isNaN(next) ? ALL_YEARS : Math.min(2026, Math.max(0, next)))
            }}
          />
        </label>
        <p className={tooFewSongs ? 'setup-warning' : 'setup-note'}>
          {songCount} sange med
          {tooFewSongs ? ` – vælg et tidligere årstal, der skal være mindst ${MIN_SONGS}.` : ''}
        </p>

        {standings.length > 0 && (
          <div className="standings standings--setup">
            <div className="standings-header">
              <h3 className="standings-heading">Vundne spil</h3>
              <button type="button" className="link-btn link-btn--inline" onClick={onResetStandings}>
                Nulstil
              </button>
            </div>
            <ol className="standings-list">
              {standings.map((entry, index) => (
                <li key={entry.name}>
                  <span className="standings-rank">{index + 1}.</span>
                  <span className="standings-name">{entry.name}</span>
                  <span className="standings-wins">{entry.wins}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {children}

        <button type="button" className="btn btn-primary start-btn" disabled={!canStart} onClick={() => onStart(validNames, minYear)}>
          Start spil
        </button>
      </div>
    </div>
  )
}
