'use client'

import { useState } from 'react'
import OpenCodeWordmark from './Wordmark'
import ButtonPrimary from './ButtonPrimary'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav 
      style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--colors-canvas)',
        borderBottom: '1px solid var(--colors-hairline)',
        height: '56px',
        zIndex: 1000,
      }}
    >
      <div 
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          maxWidth: '1100px',
        }}
      >
        {/* ASCII Wordmark */}
        <div style={{ flexShrink: 0 }}>
          <OpenCodeWordmark size="small" />
        </div>

        {/* Desktop Navigation Links */}
        <div 
          className="desktop-nav"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'var(--spacing-xl)',
          }}
        >
          <a href="https://github.com/opencode" className="body-strong" style={{ color: 'var(--colors-ink)', textDecoration: 'none' }}>
            GitHub [150K]
          </a>
          <a href="/docs" className="body-strong" style={{ color: 'var(--colors-ink)', textDecoration: 'none' }}>
            Docs
          </a>
          <a href="/zen" className="body-strong" style={{ color: 'var(--colors-ink)', textDecoration: 'none' }}>
            Zen
          </a>
          <a href="/go" className="body-strong" style={{ color: 'var(--colors-ink)', textDecoration: 'none' }}>
            Go
          </a>
          <a href="/enterprise" className="body-strong" style={{ color: 'var(--colors-ink)', textDecoration: 'none' }}>
            Enterprise
          </a>
        </div>

        {/* Download CTA */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ButtonPrimary>Download</ButtonPrimary>
          
          {/* Mobile Menu Toggle */}
          <button
            className="tablet-narrow-nav"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--spacing-sm)',
              marginLeft: 'var(--spacing-md)',
            }}
          >
            <span className="body-strong">[≡]</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu"
          style={{
            position: 'absolute',
            top: '56px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--colors-canvas)',
            borderBottom: '1px solid var(--colors-hairline)',
            padding: 'var(--spacing-lg)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <a href="https://github.com/opencode" className="body-strong" style={{ color: 'var(--colors-ink)', textDecoration: 'none' }}>
              GitHub [150K]
            </a>
            <a href="/docs" className="body-strong" style={{ color: 'var(--colors-ink)', textDecoration: 'none' }}>
              Docs
            </a>
            <a href="/zen" className="body-strong" style={{ color: 'var(--colors-ink)', textDecoration: 'none' }}>
              Zen
            </a>
            <a href="/go" className="body-strong" style={{ color: 'var(--colors-ink)', textDecoration: 'none' }}>
              Go
            </a>
            <a href="/enterprise" className="body-strong" style={{ color: 'var(--colors-ink)', textDecoration: 'none' }}>
              Enterprise
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .tablet-narrow-nav {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
          .tablet-narrow-nav {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  )
}
