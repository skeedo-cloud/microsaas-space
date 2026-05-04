// OpenCode ASCII Wordmark - Block pixel art style
export default function OpenCodeWordmark({ size = 'default', color = 'var(--colors-ink)' }) {
  const sizes = {
    small: { fontSize: '12px', lineHeight: '12px' },
    default: { fontSize: '16px', lineHeight: '14px' },
    large: { fontSize: '24px', lineHeight: '20px' },
  }

  const style = {
    ...sizes[size],
    color: color,
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    whiteSpace: 'pre',
    display: 'block',
  }

  // Block-pixel ASCII art representation of OPENCODE
  const wordmark = `
 ██████╗ ███████╗███╗   ██╗███████╗
██╔════╝ ██╔════╝████╗  ██║██╔════╝
██║  ███╗█████╗  ██╔██╗ ██║█████╗  
██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  
╚██████╔╝███████╗██║ ╚████║███████╗
 ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝
  ██████╗ ███████╗ █████╗ ██████╗ ██╗   ██╗███████╗
 ██╔════╝ ██╔════╝██╔══██╗██╔══██╗██║   ██║██╔════╝
 ██║  ███╗█████╗  ███████║██║  ██║██║   ██║█████╗  
 ██║   ██║██╔══╝  ██╔══██║██║  ██║██║   ██║██╔══╝  
 ╚██████╔╝███████╗██║  ██║██████╔╝╚██████╔╝███████╗
  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚══════╝
`.trim()

  return (
    <pre style={style} aria-label="OpenCode">
      {wordmark}
    </pre>
  )
}
