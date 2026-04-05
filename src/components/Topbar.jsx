import { useState } from 'react'
import { useApp } from '../context/AppContext'

const PAGE_TITLES = { overview: 'Overview', transactions: 'Transactions', insights: 'Insights' }

export default function Topbar() {
  const { page, role, setRole, theme, setTheme, exportData } = useApp()
  const [showExport, setShowExport] = useState(false)

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', background: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
      flexWrap: 'wrap', gap: 8,
    }}>
      <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
        {PAGE_TITLES[page]}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

        {/* Role switcher */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '5px 12px',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: role === 'admin' ? '#f59e6b' : '#22c55e',
          }} />
          <select value={role} onChange={e => setRole(e.target.value)} style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontSize: 12, color: 'var(--text2)', cursor: 'pointer',
          }}>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Dark mode toggle */}
        <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '5px 12px', fontSize: 12,
          color: 'var(--text2)',
        }}>
          {theme === 'light' ? '☾ Dark' : '☀ Light'}
        </button>

        {/* Export */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowExport(s => !s)} style={{
            background: 'var(--accent)', border: 'none',
            borderRadius: 20, padding: '5px 14px', fontSize: 12,
            color: '#fff', fontWeight: 500,
          }}>
            ↓ Export
          </button>
          {showExport && (
            <div style={{
              position: 'absolute', right: 0, top: 36,
              background: 'var(--bg)', border: '1px solid var(--border2)',
              borderRadius: 10, padding: 6, zIndex: 100, minWidth: 120,
              boxShadow: 'var(--shadow)',
            }}>
              {['csv', 'json'].map(f => (
                <button key={f} onClick={() => { exportData(f); setShowExport(false) }} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', fontSize: 12, color: 'var(--text2)',
                  background: 'transparent', border: 'none', borderRadius: 6,
                }}>
                  Download .{f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}