import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORY_ICONS, CATEGORIES } from '../data/transactions'

function fmt(n) { return '₹' + Math.abs(n).toLocaleString('en-IN') }
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtDateShort(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}
function generateTxnId(id) { return 'TXN' + String(id).padStart(8, '0') + 'IND' }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

const EMPTY_FORM = {
  name: '', amt: '', type: 'expense', cat: 'Food',
  date: new Date().toISOString().split('T')[0]
}

// ── Brand map: keyword → domain ──────────────────────────────────────────────
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
  'phone pe': 'phonepe.com',
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
  'mpl': 'mpl.live',
  'dream11': 'dream11.com',
  'dunzo': 'dunzo.com',
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

// ── BrandIcon: tries Google favicon, falls back to category emoji ─────────────
function BrandIcon({ name, cat, size = 38, radius = 11, fontSize = 18, isCredit }) {
  const [failed, setFailed] = useState(false)
  const domain = getBrandDomain(name)

  // Reset failed state if name changes
  useEffect(() => { setFailed(false) }, [name])

  const bgColor = isCredit ? 'rgba(34,197,94,0.1)' : 'rgba(224,92,92,0.08)'

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: radius,
      background: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {domain && !failed ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt={name}
          width={size * 0.55}
          height={size * 0.55}
          style={{ objectFit: 'contain', display: 'block' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span style={{ fontSize }}>{CATEGORY_ICONS[cat]}</span>
      )}
    </div>
  )
}

function downloadReceipt(t, balance) {
  const lines = [
    '══════════════════════════════════════',
    '         FINORA PAYMENT RECEIPT',
    '══════════════════════════════════════',
    '',
    `  Ref No.       : ${generateTxnId(t.id)}`,
    `  Description   : ${t.name}`,
    `  Category      : ${t.cat}`,
    `  Transaction   : ${t.type === 'income' ? 'CREDIT' : 'DEBIT'}`,
    `  Date          : ${fmtDate(t.date)}`,
    `  Amount        : ${t.type === 'income' ? '+' : '-'}${fmt(t.amt)}`,
    `  Balance       : ${fmt(balance)}`,
    `  Status        : SUCCESS`,
    '',
    '══════════════════════════════════════',
    `  Generated     : ${new Date().toLocaleString('en-IN')}`,
    '  This is a system generated receipt.',
    '══════════════════════════════════════',
  ].join('\n')
  const blob = new Blob([lines], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Finora-${generateTxnId(t.id)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function TransactionDetailDrawer({ txn, balance, onClose, role, onEdit, onDelete }) {
  if (!txn) return null
  const isCredit = txn.type === 'income'
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        zIndex: 300, display: 'flex', justifyContent: 'flex-end',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg)', height: '100%',
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid var(--border2)',
        animation: 'slideIn 0.2s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Transaction details</div>
          <button onClick={onClose} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 8, width: 32, height: 32, fontSize: 16,
            color: 'var(--text2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{
          padding: '32px 24px',
          background: isCredit ? 'rgba(34,197,94,0.06)' : 'rgba(224,92,92,0.06)',
          borderBottom: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          {/* Big brand icon in drawer */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <BrandIcon name={txn.name} cat={txn.cat} size={56} radius={16} fontSize={26} isCredit={isCredit} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6, fontWeight: 500 }}>{txn.name}</div>
          <div style={{
            fontSize: 34, fontWeight: 800, letterSpacing: '-1px',
            color: isCredit ? 'var(--income)' : 'var(--expense)',
          }}>
            {isCredit ? '+' : '-'}{fmt(txn.amt)}
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 14px',
              borderRadius: 20, letterSpacing: '0.5px',
              background: 'rgba(34,197,94,0.15)', color: '#16a34a',
            }}>✓ SUCCESS</span>
          </div>
        </div>

        <div style={{ padding: '24px', flex: 1 }}>
          {[
            { label: 'Reference number', value: generateTxnId(txn.id), mono: true },
            { label: 'Transaction type', value: isCredit ? 'Credit (Money received)' : 'Debit (Money spent)' },
            { label: 'Category', value: txn.cat },
            { label: 'Date & time', value: fmtDate(txn.date) },
            { label: 'Balance after transaction', value: fmt(balance) },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '14px 0', borderBottom: '1px solid var(--border)', gap: 16,
            }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{row.label}</div>
              <div style={{
                fontSize: 13, color: 'var(--text)', fontWeight: 600,
                textAlign: 'right', fontFamily: row.mono ? 'monospace' : 'inherit',
                letterSpacing: row.mono ? '0.5px' : 'normal',
              }}>{row.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => downloadReceipt(txn, balance)} style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: 'var(--bg2)', border: '1px solid var(--border2)',
            fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            ⬇ Download receipt
          </button>
          {role === 'admin' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { onEdit(txn); onClose() }} style={{
                flex: 1, padding: '11px', borderRadius: 10,
                background: 'var(--bg2)', border: '1px solid var(--border2)',
                fontSize: 13, fontWeight: 600, color: '#3b7ef8', cursor: 'pointer',
              }}>✏️ Edit</button>
              <button onClick={() => { onDelete(txn.id); onClose() }} style={{
                flex: 1, padding: '11px', borderRadius: 10,
                background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.3)',
                fontSize: 13, fontWeight: 600, color: 'var(--expense)', cursor: 'pointer',
              }}>🗑 Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Transactions() {
  const { transactions, role, addTransaction, editTransaction, deleteTransaction, getCurrentBalance } = useApp()
  const isMobile = useIsMobile()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [groupBy, setGroupBy] = useState('month')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selected, setSelected] = useState(null)
  const [formError, setFormError] = useState('')

  const sortedAll = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  const balanceMap = {}
  let running = 0
  const chronological = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date))
  chronological.forEach(t => {
    running += t.type === 'income' ? t.amt : -t.amt
    balanceMap[t.id] = running
  })

  const currentBalance = balanceMap[sortedAll[0]?.id] || 0

  const availableBalance = modal === 'add'
    ? currentBalance
    : getCurrentBalance(transactions.filter(t => t.id !== modal?.id))

  const amtNum = parseFloat(form.amt) || 0
  const isOverBalance = form.type === 'expense' && amtNum > 0 && amtNum > availableBalance

  let txns = [...transactions]
  if (search) txns = txns.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.cat.toLowerCase().includes(search.toLowerCase()) ||
    generateTxnId(t.id).includes(search.toUpperCase())
  )
  if (filterType) txns = txns.filter(t => t.type === filterType)
  if (filterCat) txns = txns.filter(t => t.cat === filterCat)

  if (sortBy === 'date-desc') txns.sort((a, b) => new Date(b.date) - new Date(a.date))
  else if (sortBy === 'date-asc') txns.sort((a, b) => new Date(a.date) - new Date(b.date))
  else if (sortBy === 'amt-desc') txns.sort((a, b) => b.amt - a.amt)
  else txns.sort((a, b) => a.amt - b.amt)

  let grouped = { '': txns }
  if (groupBy === 'month') {
    grouped = {}
    txns.forEach(t => {
      const [y, m] = t.date.split('-')
      const key = new Date(y, m - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(t)
    })
  } else if (groupBy === 'category') {
    grouped = {}
    txns.forEach(t => {
      if (!grouped[t.cat]) grouped[t.cat] = []
      grouped[t.cat].push(t)
    })
  }

  function openAdd() { setForm(EMPTY_FORM); setFormError(''); setModal('add') }
  function openEdit(t) {
    setForm({ name: t.name, amt: String(t.amt), type: t.type, cat: t.cat, date: t.date })
    setFormError('')
    setModal(t)
  }
  function closeModal() { setModal(null); setFormError('') }

  function handleSave() {
    if (!form.name || !form.amt || !form.date) {
      setFormError('Please fill in all fields.')
      return
    }
    const payload = { ...form, amt: parseFloat(form.amt) }
    if (modal === 'add') {
      const ok = addTransaction(payload)
      if (ok) closeModal()
    } else {
      const ok = editTransaction({ ...modal, ...payload })
      if (ok) closeModal()
    }
  }

  const totalCredit = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0)
  const totalDebit = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0)

  const inputStyle = {
    background: 'var(--bg)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13,
    color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
  }

  const modalInputStyle = {
    width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '9px 12px', fontSize: 13,
    color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ padding: isMobile ? 12 : 24, paddingBottom: isMobile ? 80 : 24 }}>

      {/* Account summary bar */}
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '18px 24px', marginBottom: 16,
        display: 'flex', gap: 0, flexWrap: 'wrap',
      }}>
        {[
          { label: 'Current balance', value: fmt(currentBalance), color: currentBalance >= 0 ? 'var(--income)' : 'var(--expense)', big: true },
          { label: 'Total credited', value: fmt(totalCredit), color: 'var(--income)' },
          { label: 'Total debited', value: fmt(totalDebit), color: 'var(--expense)' },
          { label: 'Transactions shown', value: txns.length, color: 'var(--text)' },
        ].map((c, i) => (
          <div key={c.label} style={{
            flex: '1 1 140px', padding: '0 24px',
            borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text3)', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: c.big ? 22 : 17, fontWeight: 700, color: c.color, letterSpacing: '-0.3px' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>

        {/* Controls bar */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
          background: 'var(--bg2)',
        }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, category or reference..."
            style={{ ...inputStyle, flex: '1 1 200px', minWidth: 0 }}
          />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inputStyle}>
            <option value="">All transactions</option>
            <option value="income">Credits only</option>
            <option value="expense">Debits only</option>
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={inputStyle}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amt-desc">Highest amount</option>
            <option value="amt-asc">Lowest amount</option>
          </select>
          {!isMobile && (
            <select value={groupBy} onChange={e => setGroupBy(e.target.value)} style={inputStyle}>
              <option value="none">No grouping</option>
              <option value="month">Group by month</option>
              <option value="category">Group by category</option>
            </select>
          )}
          {role === 'admin' && (
            <button onClick={openAdd} style={{
              background: '#3b7ef8', border: 'none', borderRadius: 8,
              padding: '8px 18px', fontSize: 13, color: '#fff', fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>+ New</button>
          )}
        </div>

        {/* Empty state */}
        {txns.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>No transactions found</div>
            <div style={{ fontSize: 13 }}>Try changing your search or filter settings</div>
          </div>
        )}

        {/* Table */}
        {txns.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            {Object.entries(grouped).map(([group, rows]) => {
              const groupCredit = rows.filter(r => r.type === 'income').reduce((s, r) => s + r.amt, 0)
              const groupDebit = rows.filter(r => r.type === 'expense').reduce((s, r) => s + r.amt, 0)
              return (
                <div key={group}>
                  {group && (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 20px', background: 'var(--bg2)',
                      borderBottom: '1px solid var(--border)',
                      flexWrap: 'wrap', gap: 8,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.3px' }}>{group}</div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                        <span style={{ color: 'var(--income)' }}>↑ {fmt(groupCredit)}</span>
                        <span style={{ color: 'var(--expense)' }}>↓ {fmt(groupDebit)}</span>
                        <span style={{ color: 'var(--text3)' }}>{rows.length} transactions</span>
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : '2.5fr 1.8fr 1fr 1fr 1fr 100px',
                    gap: 0, padding: '10px 20px',
                    fontSize: 10, fontWeight: 700, color: 'var(--text3)',
                    letterSpacing: '0.8px', textTransform: 'uppercase',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div>Description</div>
                    {!isMobile && <div>Reference no.</div>}
                    {!isMobile && <div>Category</div>}
                    {!isMobile && <div>Date</div>}
                    <div style={{ textAlign: 'right' }}>Amount</div>
                    {!isMobile && <div style={{ textAlign: 'right' }}>Balance</div>}
                  </div>

                  {rows.map((t, i) => {
                    const isCredit = t.type === 'income'
                    const bal = balanceMap[t.id] || 0
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelected(t)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr 1fr' : '2.5fr 1.8fr 1fr 1fr 1fr 100px',
                          gap: 0, padding: isMobile ? '14px 16px' : '14px 20px',
                          borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                          cursor: 'pointer', transition: 'background 0.12s', alignItems: 'center',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                          {/* ── BRAND ICON ── */}
                          <BrandIcon
                            name={t.name}
                            cat={t.cat}
                            size={38}
                            radius={11}
                            fontSize={18}
                            isCredit={isCredit}
                          />

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: '1px 6px',
                                borderRadius: 10, letterSpacing: '0.3px',
                                background: isCredit ? 'rgba(34,197,94,0.15)' : 'rgba(224,92,92,0.12)',
                                color: isCredit ? 'var(--income)' : 'var(--expense)',
                              }}>{isCredit ? 'CREDIT' : 'DEBIT'}</span>
                              {isMobile && <span>{fmtDateShort(t.date)}</span>}
                            </div>
                          </div>
                        </div>

                        {!isMobile && (
                          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace', letterSpacing: '0.3px' }}>
                            {generateTxnId(t.id)}
                          </div>
                        )}
                        {!isMobile && <div style={{ fontSize: 12, color: 'var(--text2)' }}>{t.cat}</div>}
                        {!isMobile && <div style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmtDateShort(t.date)}</div>}

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isCredit ? 'var(--income)' : 'var(--expense)', whiteSpace: 'nowrap' }}>
                            {isCredit ? '+' : '-'}{fmt(t.amt)}
                          </div>
                          <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2, fontWeight: 600, letterSpacing: '0.3px' }}>✓ SUCCESS</div>
                        </div>

                        {!isMobile && (
                          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text2)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {fmt(bal)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Transaction detail drawer */}
      {selected && (
        <TransactionDetailDrawer
          txn={selected}
          balance={balanceMap[selected.id] || 0}
          onClose={() => setSelected(null)}
          role={role}
          onEdit={openEdit}
          onDelete={(id) => { deleteTransaction(id); setSelected(null) }}
        />
      )}

      {/* Add/Edit modal */}
      {modal !== null && (
        <div
          onClick={e => e.target === e.currentTarget && closeModal()}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}
        >
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 360 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
              {modal === 'add' ? '+ New Transaction' : '✏️ Edit Transaction'}
            </h3>

            <div style={{
              background: 'var(--bg2)', borderRadius: 8, padding: '10px 14px',
              marginBottom: 14, fontSize: 12, color: 'var(--text2)',
              border: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>💰 Available balance</span>
              <strong style={{ color: 'var(--income)', fontSize: 13 }}>{fmt(availableBalance)}</strong>
            </div>

            {isOverBalance && (
              <div style={{
                background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                fontSize: 12, color: 'var(--expense)', fontWeight: 500,
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}>
                <span>⚠️</span>
                <span>Amount exceeds your available balance of <strong>{fmt(availableBalance)}</strong>. You cannot save this transaction.</span>
              </div>
            )}

            {formError && (
              <div style={{
                background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                fontSize: 12, color: 'var(--expense)', fontWeight: 500,
              }}>
                ⚠️ {formError}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>Description</label>
              <input
                type="text" value={form.name} placeholder="e.g. Netflix"
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={modalInputStyle}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>Amount (₹)</label>
              <input
                type="number" value={form.amt} placeholder="0"
                onChange={e => { setForm(p => ({ ...p, amt: e.target.value })); setFormError('') }}
                style={{
                  ...modalInputStyle,
                  border: isOverBalance ? '1.5px solid var(--expense)' : '1px solid var(--border2)',
                }}
              />
              {form.type === 'expense' && amtNum > 0 && !isOverBalance && (
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
                  Remaining after this: <strong style={{ color: 'var(--income)' }}>{fmt(availableBalance - amtNum)}</strong>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ ...modalInputStyle, cursor: 'pointer' }}>
                <option value="expense">Expense (Debit)</option>
                <option value="income">Income (Credit)</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>Category</label>
              <select value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))}
                style={{ ...modalInputStyle, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={modalInputStyle} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={closeModal} style={{
                flex: 1, padding: 11, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg2)',
                color: 'var(--text2)', fontSize: 13, cursor: 'pointer', fontWeight: 500,
              }}>Cancel</button>
              <button
                onClick={handleSave}
                disabled={isOverBalance}
                style={{
                  flex: 1, padding: 11, borderRadius: 8, border: 'none',
                  background: isOverBalance ? '#9399ad' : '#3b7ef8',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: isOverBalance ? 'not-allowed' : 'pointer',
                  opacity: isOverBalance ? 0.7 : 1,
                  transition: 'all 0.15s',
                }}
              >{isOverBalance ? '🚫 Blocked' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}