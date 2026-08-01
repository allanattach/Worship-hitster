import { CARD_WIDTH_BASE } from './Timeline'

interface ZoomControlsProps {
  zoom: number
  fit: boolean
  /** Card width currently on screen, used so the first manual step continues
   * from the fitted size instead of jumping back to 100%. */
  resolvedWidth: number
  onZoomChange: (zoom: number) => void
  onFitChange: (fit: boolean) => void
}

const STEP = 0.15
const MIN = 0.4
const MAX = 1.6

const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v * 100) / 100))

export function ZoomControls({ zoom, fit, resolvedWidth, onZoomChange, onFitChange }: ZoomControlsProps) {
  const effectiveZoom = fit ? resolvedWidth / CARD_WIDTH_BASE : zoom

  // Zooming manually is what leaves fit mode — no need to toggle it first.
  function step(delta: number) {
    onFitChange(false)
    onZoomChange(clamp(effectiveZoom + delta))
  }

  const atMin = !fit && zoom <= MIN
  const atMax = !fit && zoom >= MAX

  return (
    <div className="zoom-controls">
      <button
        type="button"
        className="icon-btn icon-btn--sm"
        onClick={() => step(-STEP)}
        disabled={atMin}
        title="Zoom ud"
        aria-label="Zoom ud"
      >
        −
      </button>
      <button
        type="button"
        className={`zoom-fit-btn ${fit ? 'zoom-fit-btn--active' : ''}`}
        onClick={() => onFitChange(!fit)}
        title={fit ? 'Vis kortene i fast størrelse' : 'Tilpas alle kort til skærmen'}
      >
        {fit ? 'Tilpasset' : `${Math.round(zoom * 100)}%`}
      </button>
      <button
        type="button"
        className="icon-btn icon-btn--sm"
        onClick={() => step(STEP)}
        disabled={atMax}
        title="Zoom ind"
        aria-label="Zoom ind"
      >
        +
      </button>
    </div>
  )
}
