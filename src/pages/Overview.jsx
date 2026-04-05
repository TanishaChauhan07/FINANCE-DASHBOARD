import { useEffect, useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORY_ICONS } from '../data/transactions'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Filler, Tooltip
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip)

function fmt(n) { return '₹' + Math.abs(n).toLocaleString('en-IN') }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) { setVal(0); return }
    let step = 0
    const totalSteps = Math.ceil(duration / 16)
    const t = setInterval(() => {
      step++
      const ease = 1 - Math.pow(1 - step / totalSteps, 3)
      setVal(Math.round(ease * target))
      if (step >= totalSteps) { setVal(target); clearInterval(t) }
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return val
}

function useInView(threshold = 0.1) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

// ── Brand logos ──────────────────────────────────────────────────
const BRAND_DOMAINS = {
  'netflix': 'netflix.com',
  'amazon prime': 'amazon.com',
  'prime video': 'amazon.com',
  'amazon': 'amazon.com',
  'spotify': 'spotify.com',
  'youtube premium': 'youtube.com',
  'youtube': 'youtube.com',
  'swiggy': 'swiggy.com',
  'zomato': 'zomato.com',
  'uber eats': 'uber.com',
  'uber': 'uber.com',
  'ola': 'olacabs.com',
  'apple': 'apple.com',
  'google pay': 'pay.google.com',
  'google': 'google.com',
  'phonepe': 'phonepe.com',
  'paytm': 'paytm.com',
  'myntra': 'myntra.com',
  'flipkart': 'flipkart.com',
  'airtel': 'airtel.in',
  'jio': 'jio.com',
  'blinkit': 'blinkit.com',
  'zepto': 'zeptonow.com',
  'hotstar': 'hotstar.com',
  'disney': 'disneyplus.com',
  'discord': 'discord.com',
  'slack': 'slack.com',
  'notion': 'notion.so',
  'zoom': 'zoom.us',
  'linkedin': 'linkedin.com',
  'twitter': 'twitter.com',
  'instagram': 'instagram.com',
  'facebook': 'facebook.com',
  'microsoft': 'microsoft.com',
  'openai': 'openai.com',
  'chatgpt': 'openai.com',
  'canva': 'canva.com',
  'figma': 'figma.com',
  'github': 'github.com',
  'dropbox': 'dropbox.com',
  'adobe': 'adobe.com',
  'razorpay': 'razorpay.com',
  'hdfc': 'hdfcbank.com',
  'icici': 'icicibank.com',
  'sbi': 'sbi.co.in',
  'axis bank': 'axisbank.com',
  'kotak': 'kotak.com',
  'indigo': 'goindigo.in',
  'air india': 'airindia.in',
  'makemytrip': 'makemytrip.com',
  'irctc': 'irctc.co.in',
  'meesho': 'meesho.com',
  'nykaa': 'nykaa.com',
  'rapido': 'rapido.bike',
  'cred': 'cred.club',
  'groww': 'groww.in',
  'zerodha': 'zerodha.com',
  'upstox': 'upstox.com',
  'dream11': 'dream11.com',
  'sharechat': 'sharechat.com',
  'whatsapp': 'whatsapp.com',
  'telegram': 'telegram.org',
  'snapchat': 'snapchat.com',
}

function getBrandDomain(name) {
  const lower = name.toLowerCase().trim()
  const sorted = Object.entries(BRAND_DOMAINS).sort((a, b) => b[0].length - a[0].length)
  for (const [keyword, domain] of sorted) {
    if (lower.includes(keyword)) return domain
  }
  return null
}

function BrandIcon({ name, cat, size = 36, radius = 10, fontSize = 16, isCredit }) {
  const [failed, setFailed] = useState(false)
  const domain = getBrandDomain(name)
  useEffect(() => { setFailed(false) }, [name])
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: isCredit ? 'rgba(34,197,94,0.1)' : 'rgba(224,92,92,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {domain && !failed ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt={name}
          width={size * 0.55} height={size * 0.55}
          style={{ objectFit: 'contain', display: 'block' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span style={{ fontSize }}>{CATEGORY_ICONS[cat]}</span>
      )}
    </div>
  )
}

const CAT_COLORS = ['#3b7ef8', '#a78bfa', '#22c55e', '#f59e6b', '#e05c5c', '#38bdf8', '#fb7185']

function StatCard({ label, value, delta, deltaType, accent, icon, note, delay = 0 }) {
  const [ref, inView] = useInView()
  const num = useCountUp(inView && typeof value === 'number' ? Math.abs(value) : 0)

  return (
    <div
      ref={ref}
      style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '18px 16px',
        minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0,
        position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
        e.currentTarget.style.borderColor = accent
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent, borderRadius: '16px 16px 0 0',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text3)', paddingRight: 4 }}>{label}</div>
        <div style={{ fontSize: 18, flexShrink: 0, animation: inView ? 'iconBounce 0.5s ease both' : 'none', animationDelay: `${delay + 200}ms` }}>{icon}</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 8, wordBreak: 'break-all' }}>
        {typeof value === 'number' ? fmt(num) : value}
      </div>
      {delta && (
        <div style={{ fontSize: 10, color: deltaType === 'up' ? 'var(--income)' : deltaType === 'dn' ? 'var(--expense)' : 'var(--text3)', fontWeight: 500 }}>
          {delta}
        </div>
      )}
      {note && <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>{note}</div>}
    </div>
  )
}

export default function Overview() {
  const { transactions, stats, setPage, role } = useApp()
  const isMobile = useIsMobile()
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  const [headerRef, headerInView] = useInView(0.1)
  const [chartRef, chartInView] = useInView(0.1)
  const [recentRef, recentInView] = useInView(0.1)

  const chronological = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date))
  const balanceMap = {}
  let running = 0
  chronological.forEach(t => {
    running += t.type === 'income' ? t.amt : -t.amt
    balanceMap[t.id] = running
  })

  const monthly = {}
  transactions.forEach(t => {
    const [y, m] = t.date.split('-')
    const key = `${y}-${m}`
    if (!monthly[key]) monthly[key] = { income: 0, expense: 0 }
    monthly[key][t.type] += t.amt
  })
  const months = Object.keys(monthly).sort().slice(-6)
  const labels = months.map(k => {
    const [y, m] = k.split('-')
    return new Date(y, m - 1).toLocaleString('default', { month: 'short', year: '2-digit' })
  })
  const balances = months.map(k => monthly[k].income - monthly[k].expense)

  const lastKey = months[months.length - 1]
  const prevKey = months[months.length - 2]
  const lastIncome  = monthly[lastKey]?.income  || 0
  const prevIncome  = monthly[prevKey]?.income  || 0
  const lastExpense = monthly[lastKey]?.expense || 0
  const prevExpense = monthly[prevKey]?.expense || 0
  const incDiff = prevIncome  > 0 ? Math.round(((lastIncome  - prevIncome)  / prevIncome)  * 100) : 0
  const expDiff = prevExpense > 0 ? Math.round(((lastExpense - prevExpense) / prevExpense) * 100) : 0

  const catMap = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.cat] = (catMap[t.cat] || 0) + t.amt
  })
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const totalCat = catEntries.reduce((s, [, v]) => s + v, 0)

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)

  const sortedAll = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  const currentBalance = balanceMap[sortedAll[0]?.id] || 0
  const balNum = useCountUp(headerInView ? Math.abs(currentBalance) : 0, 1200)
  const lineColor = '#3b7ef8'
  const accountName = role === 'admin' ? 'Admin User' : 'Guest Viewer'

  return (
    <div style={{
      padding: isMobile ? '12px 12px 80px' : 24,
      display: 'flex', flexDirection: 'column', gap: 16,
      boxSizing: 'border-box', width: '100%', overflowX: 'hidden',
    }}>
      <style>{`
        @keyframes iconBounce {
          0%   { transform: scale(0) rotate(-10deg); }
          60%  { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes barGrow {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
        @keyframes rowSlide {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .txn-row { transition: background 0.15s ease, transform 0.15s ease !important; }
        .txn-row:hover { background: var(--bg2) !important; transform: translateX(3px) !important; }
        .view-btn { transition: all 0.2s ease !important; }
        .view-btn:hover {
          background: var(--accent) !important;
          color: #fff !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(59,126,248,0.3) !important;
        }
        .stat-chip { transition: all 0.2s ease !important; }
        .stat-chip:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
        }
      `}</style>

      {/* ── Account header ── */}
      <div
        ref={headerRef}
        style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 16, padding: isMobile ? '16px' : '20px 24px',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 16, boxSizing: 'border-box',
          opacity: headerInView ? 1 : 0,
          transform: headerInView ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
            Current account balance
          </div>
          <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, letterSpacing: '-1.5px', color: currentBalance >= 0 ? 'var(--income)' : 'var(--expense)', lineHeight: 1 }}>
            {currentBalance < 0 ? '-' : ''}{fmt(balNum)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
            Account holder · <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{accountName}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          {[
            { label: 'Total credited', value: fmt(stats.income),       color: 'var(--income)'  },
            { label: 'Total debited',  value: fmt(stats.expense),      color: 'var(--expense)' },
            { label: 'Savings rate',   value: stats.savingsRate + '%', color: '#a78bfa'        },
          ].map((c, i) => (
            <div key={c.label} className="stat-chip" style={{
              background: 'var(--bg2)', borderRadius: 12,
              padding: isMobile ? '10px 14px' : '12px 16px',
              border: '1px solid var(--border)',
              minWidth: isMobile ? 0 : 100,
              flex: isMobile ? '1 1 0' : 'none',
              textAlign: 'center',
              opacity: headerInView ? 1 : 0,
              transform: headerInView ? 'translateY(0)' : 'translateY(10px)',
              transition: `opacity 0.4s ease ${200 + i * 80}ms, transform 0.4s ease ${200 + i * 80}ms`,
            }}>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text3)', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI stat cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 12,
      }}>
        <StatCard label="Total Balance"  value={stats.balance}           delta="Net all time"           accent="#3b7ef8" icon="💰" note={`${transactions.length} transactions`} delay={0}   />
        <StatCard label="Month Income"   value={lastIncome}              delta={incDiff >= 0 ? `↑ ${incDiff}% vs last` : `↓ ${Math.abs(incDiff)}% vs last`} deltaType={incDiff >= 0 ? 'up' : 'dn'} accent="#22c55e" icon="📈" delay={80}  />
        <StatCard label="Month Expenses" value={lastExpense}             delta={expDiff <= 0 ? `↓ ${Math.abs(expDiff)}% vs last` : `↑ ${expDiff}% more`}    deltaType={expDiff <= 0 ? 'up' : 'dn'} accent="#e05c5c" icon="📉" delay={160} />
        <StatCard label="Savings Rate"   value={`${stats.savingsRate}%`} delta={stats.savingsRate >= 20 ? '🟢 Above target' : '🔴 Below target'} accent="#a78bfa" icon="🎯" delay={240} />
      </div>

      {/* ── Charts row ── */}
      <div
        ref={chartRef}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1fr',
          gap: 16,
          opacity: chartInView ? 1 : 0,
          transform: chartInView ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.5s ease 0.1s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s',
        }}
      >
        {/* Balance trend */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: isMobile ? 16 : 20, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Balance trend</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Net savings · last 6 months</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Latest</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: (balances[balances.length - 1] || 0) >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                {fmt(balances[balances.length - 1] || 0)}
              </div>
            </div>
          </div>
          <div style={{ height: isMobile ? 160 : 180, position: 'relative' }}>
            <Line
              data={{
                labels,
                datasets: [{
                  data: balances,
                  borderColor: lineColor,
                  backgroundColor: isDark ? 'rgba(59,126,248,0.08)' : 'rgba(59,126,248,0.06)',
                  tension: 0.4, fill: true,
                  pointRadius: 4, pointBackgroundColor: lineColor,
                  pointBorderColor: isDark ? '#0d0f14' : '#fff',
                  pointBorderWidth: 2, pointHoverRadius: 6,
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                animation: { duration: 1000, easing: 'easeInOutQuart' },
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.parsed.y)}` } } },
                scales: {
                  x: { grid: { color: 'rgba(128,128,128,0.06)' }, ticks: { color: '#9399ad', font: { size: isMobile ? 9 : 10 }, maxRotation: isMobile ? 45 : 0 } },
                  y: { grid: { color: 'rgba(128,128,128,0.06)' }, ticks: { color: '#9399ad', font: { size: 10 }, callback: v => '₹' + (v / 1000).toFixed(0) + 'k' } }
                }
              }}
            />
          </div>
        </div>

        {/* Spending breakdown */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: isMobile ? 16 : 20, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Spending split</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14 }}>Top categories by spend</div>

          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: 1.5, marginBottom: 16 }}>
            {catEntries.map(([cat, amt], i) => (
              <div key={cat} style={{
                width: (totalCat > 0 ? (amt / totalCat) * 100 : 0) + '%',
                background: CAT_COLORS[i],
                animation: chartInView ? `barGrow 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms both` : 'none',
              }} />
            ))}
          </div>

          {catEntries.map(([cat, amt], i) => {
            const pct = totalCat > 0 ? Math.round((amt / totalCat) * 100) : 0
            return (
              <div key={cat} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0',
                borderBottom: i < catEntries.length - 1 ? '1px solid var(--border)' : 'none',
                opacity: chartInView ? 1 : 0,
                transform: chartInView ? 'translateX(0)' : 'translateX(-10px)',
                transition: `opacity 0.35s ease ${300 + i * 60}ms, transform 0.35s ease ${300 + i * 60}ms`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[i], flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginRight: 6, flexShrink: 0 }}>{pct}%</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>{fmt(amt)}</div>
              </div>
            )
          })}

          <button className="view-btn" onClick={() => setPage('insights')} style={{
            marginTop: 14, width: '100%', padding: '9px',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 8, fontSize: 12, fontWeight: 600,
            color: 'var(--accent)', cursor: 'pointer',
          }}>View full insights →</button>
        </div>
      </div>

      {/* ── Recent transactions ── */}
      <div
        ref={recentRef}
        style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 16, overflow: 'hidden',
          opacity: recentInView ? 1 : 0,
          transform: recentInView ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.5s ease 0.15s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '14px 16px' : '16px 22px',
          borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
          flexWrap: 'wrap', gap: 8,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Recent transactions</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Last 6 activity</div>
          </div>
          <button className="view-btn" onClick={() => setPage('transactions')} style={{
            background: 'transparent', border: '1px solid var(--border2)',
            borderRadius: 8, padding: '7px 14px', fontSize: 12,
            fontWeight: 600, color: 'var(--accent)', cursor: 'pointer',
          }}>View all →</button>
        </div>

        {/* Column headers — desktop only */}
        {!isMobile && (
          <div style={{
            display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr',
            padding: '10px 22px', fontSize: 10, fontWeight: 700,
            color: 'var(--text3)', letterSpacing: '0.8px', textTransform: 'uppercase',
            borderBottom: '1px solid var(--border)',
          }}>
            <div>Description</div>
            <div>Category</div>
            <div>Date</div>
            <div style={{ textAlign: 'right' }}>Amount</div>
          </div>
        )}

        {/* Rows */}
        {recent.map((t, i) => {
          const isCredit = t.type === 'income'
          return (
            <div
              key={t.id}
              className="txn-row"
              onClick={() => setPage('transactions')}
              style={{
                display: isMobile ? 'flex' : 'grid',
                gridTemplateColumns: '2.5fr 1fr 1fr 1fr',
                alignItems: 'center',
                padding: isMobile ? '13px 16px' : '14px 22px',
                borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                gap: isMobile ? 12 : 0,
                opacity: recentInView ? 1 : 0,
                animation: recentInView ? `rowSlide 0.35s ease ${i * 50}ms both` : 'none',
              }}
            >
              {/* Description */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <BrandIcon
                  name={t.name}
                  cat={t.cat}
                  size={isMobile ? 42 : 36}
                  radius={isMobile ? 12 : 10}
                  fontSize={isMobile ? 18 : 16}
                  isCredit={isCredit}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: isMobile ? 14 : 13,
                    fontWeight: 600, color: 'var(--text)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isMobile ? (
                      <span>{t.cat} · {fmtDate(t.date)}</span>
                    ) : (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                        background: isCredit ? 'rgba(34,197,94,0.15)' : 'rgba(224,92,92,0.12)',
                        color: isCredit ? 'var(--income)' : 'var(--expense)',
                      }}>{isCredit ? 'CREDIT' : 'DEBIT'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Category — desktop */}
              {!isMobile && (
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{t.cat}</div>
              )}

              {/* Date — desktop */}
              {!isMobile && (
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{fmtDate(t.date)}</div>
              )}

              {/* Amount */}
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: isMobile ? 'auto' : 0 }}>
                <div style={{
                  fontSize: isMobile ? 14 : 13, fontWeight: 700,
                  color: isCredit ? 'var(--income)' : 'var(--expense)',
                  whiteSpace: 'nowrap',
                }}>
                  {isCredit ? '+' : '-'}{fmt(t.amt)}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2, fontWeight: 600 }}>✓ SUCCESS</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}