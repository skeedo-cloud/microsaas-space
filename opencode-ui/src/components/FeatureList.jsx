export default function FeatureList() {
  const features = [
    { marker: '[+]', label: 'LSP enabled', description: 'Automatically loads the right LSPs for the IDE' },
    { marker: '[+]', label: 'Multi-model support', description: 'Switch between Claude, GPT-4, and local models' },
    { marker: '[+]', label: 'Terminal-native', description: 'Runs in your existing terminal environment' },
    { marker: '[-]', label: 'Extensible', description: 'Build custom commands and integrations' },
    { marker: '[x]', label: 'Open source', description: 'MIT licensed, community-driven development' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {features.map((feature, index) => (
        <div
          key={index}
          className="body-md"
          style={{
            padding: '8px 0',
            color: 'var(--colors-body)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span style={{ color: 'var(--colors-ink)', marginRight: 'var(--spacing-md)' }}>
            {feature.marker}
          </span>
          <span style={{ fontWeight: 500, color: 'var(--colors-ink)', marginRight: 'var(--spacing-md)' }}>
            {feature.label}
          </span>
          <span style={{ color: 'var(--colors-body)' }}>
            {feature.description}
          </span>
        </div>
      ))}
    </div>
  )
}
