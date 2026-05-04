'use client'

export default function InstallSnippet() {
  const installCommand = 'curl -fsSL https://opencode.ai/install | bash'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installCommand)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--colors-surface-card)',
        padding: '12px 16px',
        borderRadius: 'var(--rounded-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <code className="body-md" style={{ color: 'var(--colors-ink)' }}>
        {installCommand}
      </code>
      <button
        onClick={handleCopy}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 'var(--spacing-xs)',
          color: 'var(--colors-ink)',
          fontFamily: 'var(--font-mono)',
        }}
        aria-label="Copy install command"
      >
        [copy]
      </button>
    </div>
  )
}
