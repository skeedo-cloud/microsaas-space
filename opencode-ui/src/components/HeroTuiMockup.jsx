import OpenCodeWordmark from './Wordmark'
import ButtonPrimary from './ButtonPrimary'

export default function HeroTuiMockup() {
  return (
    <section
      style={{
        backgroundColor: 'var(--colors-surface-dark)',
        padding: '64px 32px',
        borderRadius: 'var(--rounded-none)',
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      {/* ASCII Wordmark centered */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <OpenCodeWordmark size="large" color="var(--colors-canvas)" />
      </div>

      {/* TUI Prompt Row */}
      <div
        style={{
          backgroundColor: 'var(--colors-surface-dark-elevated)',
          padding: '8px 12px',
          borderRadius: 'var(--rounded-sm)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        <span 
          className="body-md" 
          style={{ color: 'var(--colors-canvas)', fontFamily: 'var(--font-mono)' }}
        >
          │ Build <span style={{ color: 'var(--colors-accent)' }}>Claude Opus 4.5</span> <span style={{ color: 'var(--colors-success)' }}>OpenCode Zen</span>
        </span>
      </div>

      {/* Keybinding hints */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-xl)',
          marginTop: 'var(--spacing-lg)',
        }}
      >
        <span 
          className="caption-md" 
          style={{ color: 'var(--colors-ash)', fontFamily: 'var(--font-mono)' }}
        >
          tab switch agent
        </span>
        <span 
          className="caption-md" 
          style={{ color: 'var(--colors-ash)', fontFamily: 'var(--font-mono)' }}
        >
          ctrl-p commands
        </span>
      </div>
    </section>
  )
}
