'use client'

import { useState } from 'react'

export default function InstallTabs() {
  const [activeTab, setActiveTab] = useState('curl')

  const tabs = ['curl', 'npm', 'bun', 'brew', 'yay']

  return (
    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
      {/* Tab Strip */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-xs)',
          borderBottom: '1px solid var(--colors-hairline-strong)',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="button-md"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer',
              color: activeTab === tab ? 'var(--colors-ink)' : 'var(--colors-mute)',
              borderBottom: activeTab === tab ? '2px solid var(--colors-ash)' : '2px solid transparent',
              fontFamily: 'var(--font-mono)',
              fontWeight: activeTab === tab ? 500 : 400,
              lineHeight: 2,
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
