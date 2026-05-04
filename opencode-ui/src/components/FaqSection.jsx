'use client'

import { useState } from 'react'

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'What is OpenCode?',
      answer: 'OpenCode is an open source AI coding agent that runs in your terminal. It helps you write, debug, and refactor code using natural language commands.',
    },
    {
      question: 'How do I install OpenCode?',
      answer: 'Run the install command: curl -fsSL https://opencode.ai/install | bash. This will set up OpenCode in your local environment.',
    },
    {
      question: 'Is OpenCode free to use?',
      answer: 'Yes, OpenCode is completely free and open source under the MIT license. You can use it for personal and commercial projects.',
    },
    {
      question: 'Which AI models does OpenCode support?',
      answer: 'OpenCode supports multiple AI models including Claude, GPT-4, and various local models. You can switch between them using the model selector.',
    },
    {
      question: 'Can I contribute to OpenCode?',
      answer: 'Absolutely! OpenCode is community-driven. Check out our GitHub repository to contribute code, documentation, or report issues.',
    },
  ]

  return (
    <section className="section">
      <h2 className="heading-md" style={{ marginBottom: 'var(--spacing-lg)' }}>FAQ</h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              padding: '12px 0',
              borderBottom: '1px solid var(--colors-hairline)',
              cursor: 'pointer',
            }}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <div 
              className="body-md"
              style={{
                color: 'var(--colors-ink)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ marginRight: 'var(--spacing-md)', color: 'var(--colors-mute)' }}>
                {openIndex === index ? '−' : '+'}
              </span>
              {faq.question}
            </div>
            {openIndex === index && (
              <div 
                className="body-md"
                style={{
                  marginTop: 'var(--spacing-md)',
                  marginLeft: 'var(--spacing-xl)',
                  color: 'var(--colors-body)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
