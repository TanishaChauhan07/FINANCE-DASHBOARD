import { useEffect, useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Filler, Tooltip, Legend, ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement)

function fmt(n)  { return '₹' + Math.abs(n).toLocaleString('en-IN') }
function fmtK(n) { return n >= 1000 ? '₹' + (n / 1000).toFixed(0) + 'k' : '₹' + n }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

function useCountUp(target, duration = 900) {
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
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

const CAT_COLORS = ['#3b7ef8','#a78bfa','#22c55e','#f59e6b','#e05c5c','#38bdf8','#fb7185','#34d399','#fbbf24']

function KpiCard({ label, value, sub, subColor, accent, delay = 0 }) {
  const [ref, inView] = useInView()
  const num = useCountUp(inView && typeof value === 'number' ? value : 0)
  return (
    <div ref={ref} style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '20px 22px',
      borderTop: `3px solid ${accent}`,
      flex: '1 1 160px', minWidth: 0,
      display: 'flex', flexDirection: 'column', gap: 8,
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
      transition: `opacity 0.4s ease ${delay}ms, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
      e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)'
      e.currentTarget.style.borderColor = accent
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)'
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.borderColor = 'var(--border)'
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1 }}>
        {typeof value === 'number' ? fmt(num) : value}
      </div>
      {sub && <div style={{ fontSize: 11, color: subColor || 'var(--text3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function SegmentBar({ catEntries, total, inView }) {
  return (
    <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 1.5 }}>
      {catEntries.map(([cat, amt], i) => {
        const pct = total > 0 ? (amt / total) * 100 : 0
        return pct > 0.5 ? (
          <div key={cat} title={`${cat}: ${fmt(amt)}`} style={{
            width: pct + '%', height: '100%',
            background: CAT_COLORS[i % CAT_COLORS.length],
            transform: inView ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: `transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms`,
          }} />
        ) : null
      })}
    </div>
  )
}

function monthLabel(k) {
  const [y, m] = k.split('-')
  return new Date(y, m - 1).toLocaleString('default', { month: 'short', year: 'numeric' })
}

export default function Insights() {
  const { transactions, stats } = useApp()
  const isMobile = useIsMobile()
  const [monthRange, setMonthRange] = useState(6)
  const [tableMode, setTableMode] = useState('current')
  const [tableRange, setTableRange] = useState(6)
  const [expenseMode, setExpenseMode] = useState('current')
  const [expenseMonth, setExpenseMonth] = useState('')
  const [chartRef, chartInView] = useInView(0.1)
  const [row3Ref, row3InView] = useInView(0.1)
  const [row4Ref, row4InView] = useInView(0.1)

  const monthly = {}
  transactions.forEach(t => {
    const [y, m] = t.date.split('-')
    const key = `${y}-${m}`
    if (!monthly[key]) monthly[key] = { income: 0, expense: 0, txns: [] }
    monthly[key][t.type] += t.amt
    monthly[key].txns.push(t)
  })

  const allMonths = Object.keys(monthly).sort()
  const latestKey = allMonths[allMonths.length - 1]
  const prevKey   = allMonths[allMonths.length - 2]

  useEffect(() => {
    if (latestKey && !expenseMonth) setExpenseMonth(latestKey)
  }, [latestKey])

  const selectedMonths = allMonths.slice(-monthRange)
  const labels   = selectedMonths.map(k => monthLabel(k))
  const incomes  = selectedMonths.map(k => monthly[k].income)
  const expenses = selectedMonths.map(k => monthly[k].expense)
  const balances = selectedMonths.map(k => monthly[k].income - monthly[k].expense)

  const catMap = {}
  transactions.filter(t => t.type === 'expense').forEach(t => { catMap[t.cat] = (catMap[t.cat] || 0) + t.amt })
  const catEntries   = Object.entries(catMap).sort((a, b) => b[1] - a[1])
  const totalExpense = catEntries.reduce((s, [, v]) => s + v, 0)

  const lastMonth = monthly[latestKey] || { income: 0, expense: 0, txns: [] }
  const prevMonth = monthly[prevKey]   || { income: 0, expense: 0, txns: [] }

  const thisMonthSpent  = lastMonth.expense
  const thisMonthEarned = lastMonth.income
  const thisMonthSaved  = thisMonthEarned - thisMonthSpent
  const dailyAvg   = Math.round(thisMonthSpent / 30)
  const spentDiff  = prevMonth.expense > 0 ? Math.round(((thisMonthSpent  - prevMonth.expense) / prevMonth.expense) * 100) : 0
  const earnedDiff = prevMonth.income  > 0 ? Math.round(((thisMonthEarned - prevMonth.income)  / prevMonth.income)  * 100) : 0
  const topCat = catEntries[0]?.[0] || '—'

  const expKey = expenseMode === 'current' ? latestKey : expenseMonth
  const expData = monthly[expKey] || { income: 0, expense: 0, txns: [] }
  const topExpenses = [...(expData.txns || [])].filter(t => t.type === 'expense').sort((a, b) => b.amt - a.amt).slice(0, 5)

  const tableRows = tableMode === 'current'
    ? [latestKey].filter(Boolean)
    : [...allMonths].reverse().slice(0, tableRange)

  const selectStyle = {
    background: 'var(--bg)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '6px 10px', fontSize: 12,
    color: 'var(--text2)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
  }

  const tabBtn = (active) => ({
    padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: 'none',
    background: active ? 'var(--accent)' : 'var(--bg2)',
    color: active ? '#fff' : 'var(--text3)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ padding: isMobile ? 12 : 24, display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: isMobile ? 80 : 24 }}>
      <style>{`
        .kpi-row { display:flex; gap:12px; flex-wrap:wrap; }
        .ins-card { transition: transform 0.2s ease, box-shadow 0.2s ease !important; }
        .ins-card:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
      `}</style>

      {/* KPI CARDS */}
      <div className="kpi-row">
        <KpiCard label="Spent this month"      value={thisMonthSpent}           sub={spentDiff  <= 0 ? `↓ ${Math.abs(spentDiff)}% less than last month`  : `↑ ${spentDiff}% more than last month`}  subColor={spentDiff  <= 0 ? 'var(--income)' : 'var(--expense)'} accent="#e05c5c" delay={0}   />
        <KpiCard label="Earned this month"     value={thisMonthEarned}          sub={earnedDiff >= 0 ? `↑ ${earnedDiff}% more than last month` : `↓ ${Math.abs(earnedDiff)}% less than last month`} subColor={earnedDiff >= 0 ? 'var(--income)' : 'var(--expense)'} accent="#22c55e" delay={70}  />
        <KpiCard label="Net saved this month"  value={Math.abs(thisMonthSaved)} sub={thisMonthSaved >= 0 ? '🟢 You are in the green' : '🔴 You overspent'}                                                                                                               accent="#3b7ef8" delay={140} />
        <KpiCard label="Daily average spend"   value={dailyAvg}                 sub={`Top category: ${topCat}`}                                                                                                                                                             accent="#a78bfa" delay={210} />
        <KpiCard label="All time savings rate" value={`${stats.savingsRate}%`}  sub={stats.savingsRate >= 20 ? '🎉 Above recommended 20%' : '⚠️ Aim for at least 20%'} subColor={stats.savingsRate >= 20 ? 'var(--income)' : 'var(--expense)'}                           accent="#f59e6b" delay={280} />
      </div>

      {/* BIG BAR CHART */}
      <div ref={chartRef} className="ins-card" style={{
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 24,
        opacity: chartInView ? 1 : 0,
        transform: chartInView ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Income · Expenses · Net saved</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>All three in one view — the complete picture of your finances</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text2)', alignItems: 'center' }}>
              {[['#22c55e','Income'],['#e05c5c','Expenses'],['#3b7ef8','Saved']].map(([c,l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
            <select value={monthRange} onChange={e => setMonthRange(Number(e.target.value))} style={selectStyle}>
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
              <option value={allMonths.length}>All time</option>
            </select>
          </div>
        </div>
        <div style={{ height: 280, position: 'relative' }}>
          <Bar data={{
            labels,
            datasets: [
              { label: 'Income',    data: incomes,  backgroundColor: 'rgba(34,197,94,0.8)',  borderRadius: 5, borderSkipped: false },
              { label: 'Expenses',  data: expenses, backgroundColor: 'rgba(224,92,92,0.8)',  borderRadius: 5, borderSkipped: false },
              { label: 'Net Saved', data: balances, backgroundColor: 'rgba(59,126,248,0.8)', borderRadius: 5, borderSkipped: false },
            ]
          }} options={{
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 900, easing: 'easeInOutQuart' },
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString('en-IN')}` }}},
            scales: {
              x: { grid: { color: 'rgba(128,128,128,0.06)' }, ticks: { color: '#9399ad', font: { size: 11 }, maxRotation: 30 } },
              y: { grid: { color: 'rgba(128,128,128,0.06)' }, ticks: { color: '#9399ad', font: { size: 11 }, callback: v => '₹'+(v/1000).toFixed(0)+'k' } }
            }
          }} />
        </div>
      </div>

      {/* TOP EXPENSES + MONTH TABLE */}
      <div ref={row3Ref} style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.3fr', gap: 16,
        opacity: row3InView ? 1 : 0,
        transform: row3InView ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.5s ease 0.05s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.05s',
      }}>
        {/* Top expenses */}
        <div className="ins-card" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Top expenses</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Biggest single spends</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 9, padding: 3, gap: 3, border: '1px solid var(--border)' }}>
                <button style={tabBtn(expenseMode === 'current')} onClick={() => setExpenseMode('current')}>Current</button>
                <button style={tabBtn(expenseMode === 'custom')}  onClick={() => setExpenseMode('custom')}>Custom</button>
              </div>
              {expenseMode === 'custom' && (
                <select value={expenseMonth} onChange={e => setExpenseMonth(e.target.value)} style={selectStyle}>
                  {[...allMonths].reverse().map(k => (
                    <option key={k} value={k}>{monthLabel(k)}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase' }}>
            {monthLabel(expKey)}
          </div>
          {topExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px' }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>No expenses</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Nothing spent in {monthLabel(expKey)}</div>
            </div>
          ) : topExpenses.map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
              borderBottom: i < topExpenses.length - 1 ? '1px solid var(--border)' : 'none',
              opacity: row3InView ? 1 : 0,
              transform: row3InView ? 'translateX(0)' : 'translateX(-12px)',
              transition: `opacity 0.35s ease ${i * 60}ms, transform 0.35s ease ${i * 60}ms`,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: i === 0 ? '#f59e6b22' : 'var(--bg2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
                color: i === 0 ? '#f59e6b' : 'var(--text3)',
              }}>#{i+1}</div>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: CAT_COLORS[i % CAT_COLORS.length] + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLORS[i % CAT_COLORS.length] }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{t.cat}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--expense)', flexShrink: 0 }}>-{fmt(t.amt)}</div>
            </div>
          ))}
        </div>

        {/* Month-by-month table */}
        <div className="ins-card" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Month-by-month breakdown</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Income, expenses and savings</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 9, padding: 3, gap: 3, border: '1px solid var(--border)' }}>
                <button style={tabBtn(tableMode === 'current')} onClick={() => setTableMode('current')}>Current</button>
                <button style={tabBtn(tableMode === 'custom')}  onClick={() => setTableMode('custom')}>Custom</button>
              </div>
              {tableMode === 'custom' && (
                <select value={tableRange} onChange={e => setTableRange(Number(e.target.value))} style={selectStyle}>
                  <option value={3}>Last 3 months</option>
                  <option value={6}>Last 6 months</option>
                  <option value={12}>Last 12 months</option>
                  <option value={allMonths.length}>All time</option>
                </select>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '0 0 8px', borderBottom: '1px solid var(--border)' }}>
            {['Month','Income','Expenses','Saved'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text3)' }}>{h}</div>
            ))}
          </div>
          {tableRows.map((k, i) => {
            const d = monthly[k]
            if (!d) return null
            const saved = d.income - d.expense
            return (
              <div key={k} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8,
                padding: i === 0 ? '10px 8px' : '10px 0',
                borderBottom: i < tableRows.length - 1 ? '1px solid var(--border)' : 'none',
                background: i === 0 ? 'var(--bg2)' : 'transparent',
                borderRadius: i === 0 ? 8 : 0,
                opacity: row3InView ? 1 : 0,
                transform: row3InView ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity 0.35s ease ${i * 55}ms, transform 0.35s ease ${i * 55}ms`,
              }}>
                <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: i === 0 ? 600 : 400, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {monthLabel(k)}
                  {i === 0 && tableMode === 'custom' && <span style={{ fontSize: 9, color: '#3b7ef8', fontWeight: 700 }}>LATEST</span>}
                  {tableMode === 'current' && <span style={{ fontSize: 9, color: '#3b7ef8', fontWeight: 700 }}>CURRENT</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--income)', fontWeight: 500 }}>{fmtK(d.income)}</div>
                <div style={{ fontSize: 12, color: 'var(--expense)', fontWeight: 500 }}>{fmtK(d.expense)}</div>
                <div style={{ fontSize: 12, color: saved >= 0 ? 'var(--income)' : 'var(--expense)', fontWeight: 600 }}>
                  {saved >= 0 ? '+' : ''}{fmtK(saved)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SPENDING BREAKDOWN — pixel matched to inspo */}
      <div ref={row4Ref} className="ins-card" style={{
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 24,
        opacity: row4InView ? 1 : 0,
        transform: row4InView ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.5s ease 0.1s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Spending breakdown — all time</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16 }}>Detailed category-wise distribution</div>

        {/* Segment bar — full width */}
        <SegmentBar catEntries={catEntries} total={totalExpense} inView={row4InView} />

        {/* Pills with % inline */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0 28px' }}>
          {catEntries.map(([cat, amt], i) => {
            const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0
            return (
              <div key={cat} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--bg2)', borderRadius: 20,
                padding: '5px 12px', border: '1px solid var(--border)',
                opacity: row4InView ? 1 : 0,
                transform: row4InView ? 'scale(1)' : 'scale(0.8)',
                transition: `opacity 0.3s ease ${i * 40}ms, transform 0.3s cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms`,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: CAT_COLORS[i % CAT_COLORS.length], flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500 }}>{cat}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>{pct}%</span>
              </div>
            )
          })}
        </div>

        {/* LEFT list + RIGHT donut — exactly like inspo */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 0, alignItems: 'center' }}>

          {/* LEFT — category list, stops at middle */}
          <div style={{ display: 'flex', flexDirection: 'column', paddingRight: isMobile ? 0 : 40 }}>
            {catEntries.map(([cat, amt], i) => (
              <div key={cat} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 0',
                borderBottom: i < catEntries.length - 1 ? '1px solid var(--border)' : 'none',
                opacity: row4InView ? 1 : 0,
                transform: row4InView ? 'translateX(0)' : 'translateX(-16px)',
                transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 60}ms`,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: CAT_COLORS[i % CAT_COLORS.length], flexShrink: 0,
                }} />
                <div style={{ flex: 1, fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{cat}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{fmt(amt)}</div>
              </div>
            ))}
          </div>

          {/* RIGHT — donut only, centered, total INSIDE */}
          {!isMobile && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderLeft: '1px solid var(--border)', paddingLeft: 40,
            }}>
              {/* Wrapper with exact size so absolute center label works */}
              <div style={{ position: 'relative', width: 260, height: 260 }}>
                <Doughnut
                  data={{
                    labels: catEntries.map(([c]) => c),
                    datasets: [{
                      data: catEntries.map(([,v]) => v),
                      backgroundColor: CAT_COLORS.slice(0, catEntries.length),
                      borderWidth: 3,
                      borderColor: 'var(--bg)',
                      hoverOffset: 10,
                    }]
                  }}
                  options={{
                    responsive: false,
                    maintainAspectRatio: false,
                    cutout: '68%',
                    animation: { duration: 1000, easing: 'easeInOutQuart' },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}`,
                          afterLabel: ctx => {
                            const pct = totalExpense > 0 ? Math.round((ctx.parsed / totalExpense) * 100) : 0
                            return ` ${pct}% of total`
                          }
                        }
                      }
                    }
                  }}
                  width={260}
                  height={260}
                />
                {/* TOTAL text — perfectly centered inside donut hole */}
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '2px',
                    textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6,
                  }}>TOTAL</div>
                  <div style={{
                    fontSize: 22, fontWeight: 800, color: 'var(--text)',
                    letterSpacing: '-0.5px', lineHeight: 1,
                  }}>{fmt(totalExpense)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}