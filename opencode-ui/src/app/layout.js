import './globals.css'

export const metadata = {
  title: 'OpenCode - The open source AI coding agent',
  description: 'An open source AI coding agent built for developers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
