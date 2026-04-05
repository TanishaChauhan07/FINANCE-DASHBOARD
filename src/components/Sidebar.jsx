import { useApp } from '../context/AppContext'
import { useEffect, useState } from 'react'

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )},
  { id: 'transactions', label: 'Transactions', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  )},
  { id: 'insights', label: 'Insights', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )},
]

export default function Sidebar() {
  const { page, setPage } = useApp()
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  )
  const [hoverId, setHoverId] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 0 env(safe-area-inset-bottom, 14px)',
        backdropFilter: 'blur(12px)',
      }}>
        {NAV.map(n => {
          const active = page === n.id
          return (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
              background: 'transparent', border: 'none',
              color: active ? 'var(--accent)' : 'var(--text3)',
              fontSize: 11,
              fontWeight: active ? 600 : 400,
              transform: active ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              cursor: 'pointer',
            }}>
              {n.icon}
              {n.label}
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <aside style={{
      width: 210, flexShrink: 0,
      background: 'var(--bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px 20px',
      gap: 2,
      position: 'sticky', top: 0, height: '100vh',
      overflowY: 'auto',
    }}>
      <style>{`
        @keyframes logoShine {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ringRotateReverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes corePulse {
          0%, 100% { r: 5; opacity: 1; }
          50%       { r: 6; opacity: 0.85; }
        }
        @keyframes dotOrbit1 {
          0%   { transform: rotate(0deg)   translateX(11px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(11px) rotate(-360deg); }
        }
        @keyframes dotOrbit2 {
          0%   { transform: rotate(180deg) translateX(11px) rotate(-180deg); }
          100% { transform: rotate(540deg) translateX(11px) rotate(-540deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
        .nav-btn {
          transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1) !important;
        }
        .nav-btn:active {
          transform: scale(0.95) !important;
        }
        .nav-btn:hover {
          background: var(--bg2) !important;
        }
      `}</style>

      {/* ── Finora Logo ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '4px 6px 20px 6px',
        borderBottom: '1px solid var(--border)',
        marginBottom: 12,
      }}>
        {/* Animated SVG symbol */}
        <svg width="34" height="34" viewBox="0 0 34 34" style={{ flexShrink: 0, overflow: 'visible' }}>
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b7ef8"/>
              <stop offset="100%" stopColor="#a78bfa"/>
            </linearGradient>
            <linearGradient id="g2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa"/>
              <stop offset="100%" stopColor="#3b7ef8"/>
            </linearGradient>
          </defs>

          {/* Outer ring — rotates */}
          <g style={{ transformOrigin: '17px 17px', animation: 'ringRotate 8s linear infinite' }}>
            <circle cx="17" cy="17" r="15" fill="none" stroke="url(#g1)" strokeWidth="1.5"
              strokeDasharray="12 6" strokeLinecap="round"/>
          </g>

          {/* Inner ring — counter rotates */}
          <g style={{ transformOrigin: '17px 17px', animation: 'ringRotateReverse 5s linear infinite' }}>
            <circle cx="17" cy="17" r="10" fill="none" stroke="url(#g2)" strokeWidth="1"
              strokeDasharray="6 4" strokeLinecap="round" opacity="0.6"/>
          </g>

          {/* Core circle */}
          <circle cx="17" cy="17" r="7" fill="url(#g1)" opacity="0.95"/>

          {/* F letter — clean, centered, upright */}
          <text
            x="17" y="21.5"
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
            style={{ letterSpacing: '0px', userSelect: 'none' }}
          >F</text>

          {/* Orbiting dot 1 */}
          <g style={{ transformOrigin: '17px 17px', animation: 'dotOrbit1 3s linear infinite' }}>
            <circle cx="17" cy="17" r="2.5" fill="#3b7ef8"/>
          </g>

          {/* Orbiting dot 2 */}
          <g style={{ transformOrigin: '17px 17px', animation: 'dotOrbit2 3s linear infinite' }}>
            <circle cx="17" cy="17" r="2" fill="#a78bfa" opacity="0.8"/>
          </g>
        </svg>

        {/* Finora text */}
        <span style={{
          fontSize: 19, fontWeight: 800,
          background: 'linear-gradient(90deg, #3b7ef8, #a78bfa, #3b7ef8)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'logoShine 3s linear infinite',
          letterSpacing: '-0.3px',
          lineHeight: 1,
        }}>
          Finora
        </span>
      </div>

      {/* ── Nav label ── */}
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '1px',
        textTransform: 'uppercase', color: 'var(--text3)',
        paddingLeft: 12, marginBottom: 6,
      }}>
        Menu
      </div>

      {/* ── Nav items ── */}
      {NAV.map((n, idx) => {
        const active = page === n.id
        const hovered = hoverId === n.id
        return (
          <button
            key={n.id}
            className="nav-btn"
            onClick={() => setPage(n.id)}
            onMouseEnter={() => setHoverId(n.id)}
            onMouseLeave={() => setHoverId(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              borderRadius: 10,
              border: active ? '1px solid var(--border2)' : '1px solid transparent',
              background: active
                ? 'linear-gradient(135deg, rgba(59,126,248,0.13), rgba(167,139,250,0.08))'
                : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text2)',
              fontSize: 13, fontWeight: active ? 600 : 500,
              cursor: 'pointer', width: '100%', textAlign: 'left',
              transform: hovered && !active ? 'translateX(3px)' : 'translateX(0)',
              boxShadow: active ? '0 2px 12px rgba(59,126,248,0.12)' : 'none',
              opacity: mounted ? 1 : 0,
              animation: mounted ? `fadeSlideIn 0.3s ease both` : 'none',
              animationDelay: `${idx * 70}ms`,
            }}
          >
            <span style={{
              display: 'flex', flexShrink: 0,
              transition: 'transform 0.2s ease',
              transform: active ? 'scale(1.12)' : 'scale(1)',
            }}>
              {n.icon}
            </span>
            <span style={{ flex: 1 }}>{n.label}</span>
            {active && (
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 8px rgba(59,126,248,0.7)',
                animation: 'pulse 2s ease infinite',
                flexShrink: 0,
              }} />
            )}
          </button>
        )
      })}

      {/* ── Bottom ── */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', paddingLeft: 6, letterSpacing: '0.5px' }}>
          FINORA v1.0
        </div>
      </div>
    </aside>
  )
}