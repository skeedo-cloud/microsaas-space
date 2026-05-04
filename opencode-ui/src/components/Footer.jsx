export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--colors-hairline)',
        padding: '32px 0',
        backgroundColor: 'var(--colors-canvas)',
      }}
    >
      <div 
        className="container"
        style={{
          maxWidth: '960px',
        }}
      >
        {/* Top Row - Link Grid */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-xl)',
            flexWrap: 'wrap',
            gap: 'var(--spacing-lg)',
          }}
        >
          <a href="https://github.com/opencode" className="caption-md" style={{ color: 'var(--colors-body)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            GitHub [150K]
          </a>
          <span style={{ color: 'var(--colors-hairline-strong)' }}>|</span>
          <a href="/docs" className="caption-md" style={{ color: 'var(--colors-body)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            Docs
          </a>
          <span style={{ color: 'var(--colors-hairline-strong)' }}>|</span>
          <a href="/changelog" className="caption-md" style={{ color: 'var(--colors-body)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            Changelog
          </a>
          <span style={{ color: 'var(--colors-hairline-strong)' }}>|</span>
          <a href="/discord" className="caption-md" style={{ color: 'var(--colors-body)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            Discord
          </a>
          <span style={{ color: 'var(--colors-hairline-strong)' }}>|</span>
          <a href="https://x.com/opencode" className="caption-md" style={{ color: 'var(--colors-body)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            X
          </a>
        </div>

        {/* Bottom Row - Copyright & Utilities */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
          }}
        >
          <span className="caption-md" style={{ color: 'var(--colors-mute)', fontFamily: 'var(--font-mono)' }}>
            ©2026 Anomaly
          </span>
          <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
            <a href="/brand" className="caption-md" style={{ color: 'var(--colors-mute)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
              Brand
            </a>
            <a href="/privacy" className="caption-md" style={{ color: 'var(--colors-mute)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
              Privacy
            </a>
            <a href="/terms" className="caption-md" style={{ color: 'var(--colors-mute)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
              Terms
            </a>
            <span className="caption-md" style={{ color: 'var(--colors-mute)', fontFamily: 'var(--font-mono)' }}>
              English ▼
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
