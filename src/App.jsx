import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Overview from './pages/Overview'
import Transactions from './pages/Transactions'
import Insights from './pages/Insights'
import { useEffect, useRef, useState } from 'react'

// Animated page wrapper — re-mounts on page change to trigger animation
function PageWrapper({ children, pageKey }) {
  const [key, setKey] = useState(pageKey)
  const [display, setDisplay] = useState(children)

  useEffect(() => {
    if (pageKey !== key) {
      setKey(pageKey)
      setDisplay(children)
    }
  }, [pageKey, children])

  return (
    <div key={key} className="page-enter" style={{ height: '100%' }}>
      {display}
    </div>
  )
}

function Dashboard() {
  const { page, theme } = useApp()

  return (
    <div data-theme={theme} style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg2)' }}>
          <PageWrapper pageKey={page}>
            {page === 'overview'     && <Overview />}
            {page === 'transactions' && <Transactions />}
            {page === 'insights'     && <Insights />}
          </PageWrapper>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  )
}