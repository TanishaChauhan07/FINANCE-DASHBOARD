import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react'
import { INITIAL_TRANSACTIONS } from '../data/transactions'

const AppContext = createContext(null)

function txnReducer(state, action) {
  switch (action.type) {
    case 'ADD':
    case 'EDIT':
      return state.map(t => t.id === action.payload.id ? action.payload : t)
    case 'DELETE':
      return state.filter(t => t.id !== action.payload)
    default:
      return state
  }
}

function fmt(n) { return '₹' + Math.abs(n).toLocaleString('en-IN') }

export function AppProvider({ children }) {

  // 🔥 FIX: always load fresh data from transactions.js
  const [transactions, dispatch] = useReducer(
    txnReducer,
    INITIAL_TRANSACTIONS
  )

  const [role, setRole]   = useState(() => localStorage.getItem('fin_role')  || 'viewer')
  const [theme, setTheme] = useState(() => localStorage.getItem('fin_theme') || 'light')
  const [page, setPage]   = useState('overview')
  const [toast, setToast] = useState(null)
  const [toastLeaving, setToastLeaving] = useState(false)
  const toastTimer = useRef(null)

  const [nextId, setNextId] = useState(26)

  useEffect(() => {
    localStorage.setItem('fin_transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('fin_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('fin_role', role)
  }, [role])

  function showToast(msg, type = 'error') {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastLeaving(false)
    setToast({ msg, type })

    toastTimer.current = setTimeout(() => {
      setToastLeaving(true)
      setTimeout(() => {
        setToast(null)
        setToastLeaving(false)
      }, 200)
    }, 2800)
  }

  function getCurrentBalance(txnList) {
    return txnList.reduce((bal, t) => {
      return t.type === 'income' ? bal + t.amt : bal - t.amt
    }, 0)
  }

  function addTransaction(txn) {
    if (txn.type === 'expense') {
      const currentBalance = getCurrentBalance(transactions)
      if (txn.amt > currentBalance) {
        showToast(`Insufficient balance! Available: ${fmt(currentBalance)}`)
        return false
      }
    }
    dispatch({ type: 'ADD', payload: { ...txn, id: nextId } })
    setNextId(n => n + 1)
    showToast('Transaction added successfully!', 'success')
    return true
  }

  function editTransaction(txn) {
    if (txn.type === 'expense') {
      const otherTxns = transactions.filter(t => t.id !== txn.id)
      const balanceWithoutThis = getCurrentBalance(otherTxns)
      if (txn.amt > balanceWithoutThis) {
        showToast(`Insufficient balance! Available: ${fmt(balanceWithoutThis)}`)
        return false
      }
    }
    dispatch({ type: 'EDIT', payload: txn })
    showToast('Transaction updated!', 'success')
    return true
  }

  function deleteTransaction(id) {
    dispatch({ type: 'DELETE', payload: id })
    showToast('Transaction deleted!', 'success')
  }

  function exportData(format) {
    if (format === 'csv') {
      const headers = 'id,name,amount,type,category,date'
      const rows = transactions.map(t =>
        `${t.id},"${t.name}",${t.amt},${t.type},${t.cat},${t.date}`
      )
      const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'transactions.csv'; a.click()
    } else {
      const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'transactions.json'; a.click()
    }
  }

  const stats = {
    income:  transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0),
    expense: transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0),
    get balance()     { return this.income - this.expense },
    get savingsRate() { return this.income > 0 ? Math.round((this.balance / this.income) * 100) : 0 },
  }

  return (
    <AppContext.Provider value={{
      transactions, role, setRole, theme, setTheme,
      page, setPage, stats, toast,
      addTransaction, editTransaction, deleteTransaction, exportData,
      getCurrentBalance,
    }}>

      {toast && (
        <div
          className={toastLeaving ? 'toast-out' : 'toast-in'}
          style={{
            position: 'fixed', top: 24, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: toast.type === 'error' ? '#e05c5c' : '#22c55e',
            color: '#fff', padding: '12px 24px', borderRadius: 12,
            fontSize: 13, fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ fontSize: 15 }}>
            {toast.type === 'error' ? '⚠️' : '✅'}
          </span>
          {toast.msg}
        </div>
      )}

      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)