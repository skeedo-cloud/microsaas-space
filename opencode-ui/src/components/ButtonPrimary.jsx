export default function ButtonPrimary({ children, onClick, type = 'button', disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="button-md"
      style={{
        backgroundColor: disabled ? 'var(--colors-surface-card)' : 'var(--colors-ink)',
        color: 'var(--colors-canvas)',
        padding: '4px 20px',
        height: '36px',
        borderRadius: 'var(--rounded-sm)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        lineHeight: 2,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
