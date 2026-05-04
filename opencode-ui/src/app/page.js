import Navbar from '../components/Navbar'
import HeroTuiMockup from '../components/HeroTuiMockup'
import InstallTabs from '../components/InstallTabs'
import InstallSnippet from '../components/InstallSnippet'
import FeatureList from '../components/FeatureList'
import FaqSection from '../components/FaqSection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section - TUI Mockup */}
      <section style={{ padding: 'var(--spacing-section) var(--spacing-lg)' }}>
        <HeroTuiMockup />
      </section>

      {/* Install Section */}
      <section className="section">
        <div className="container" style={{ maxWidth: '960px' }}>
          <h2 className="heading-md" style={{ marginBottom: 'var(--spacing-lg)' }}>Install OpenCode</h2>
          <InstallTabs />
          <InstallSnippet />
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="section"
        style={{
          borderTop: '1px solid var(--colors-hairline)',
        }}
      >
        <div className="container" style={{ maxWidth: '960px' }}>
          <h2 className="heading-md" style={{ marginBottom: 'var(--spacing-lg)' }}>What is OpenCode?</h2>
          <p className="body-md" style={{ color: 'var(--colors-body)', marginBottom: 'var(--spacing-xl)', fontFamily: 'var(--font-mono)' }}>
            The open source AI coding agent that runs in your terminal. Built for developers who want AI assistance without leaving their command line.
          </p>
          <FeatureList />
        </div>
      </section>

      {/* FAQ Section */}
      <div className="container" style={{ maxWidth: '960px' }}>
        <FaqSection />
      </div>

      <Footer />
    </>
  )
}
