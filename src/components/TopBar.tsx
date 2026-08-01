interface TopBarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onShowRules: () => void
  onNewGame?: () => void
  onUndo?: () => void
  canUndo?: boolean
}

export function TopBar({
  theme,
  onToggleTheme,
  isFullscreen,
  onToggleFullscreen,
  onShowRules,
  onNewGame,
  onUndo,
  canUndo,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar-brand">
        <span className="brand-mark">♪</span>
        <span className="brand-name">Worship Hitster</span>
      </div>
      <div className="top-bar-actions">
        {onUndo && (
          <button
            type="button"
            className="icon-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title={canUndo ? 'Fortryd sidste handling' : 'Der er intet at fortryde'}
            aria-label="Fortryd"
          >
            ↶
          </button>
        )}
        {onNewGame && (
          <button type="button" className="icon-btn" onClick={onNewGame} title="Nyt spil" aria-label="Nyt spil">
            ↺
          </button>
        )}
        <button type="button" className="icon-btn" onClick={onShowRules} title="Regler" aria-label="Vis regler">
          ?
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Afslut fuldskærm' : 'Fuldskærm'}
          aria-label="Fuldskærm"
        >
          {isFullscreen ? '⤡' : '⤢'}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Skift til lyst tema' : 'Skift til mørkt tema'}
          aria-label="Skift tema"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  )
}
