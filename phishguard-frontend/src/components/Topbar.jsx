import { useEffect, useMemo, useState } from 'react'
import { FiMail, FiMoon, FiSearch, FiSun, FiUser } from 'react-icons/fi'

import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'
import { supabase } from '../services/supabase'

export default function Topbar({ onQuickScan }) {
  const [url, setUrl] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [scanTotal, setScanTotal] = useState(null)
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const displayName = useMemo(() => {
    if (!user) return 'Analyst'
    return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Analyst'
  }, [user])

  useEffect(() => {
    if (!profileOpen) return
    let active = true
    api
      .get('/api/analytics')
      .then((res) => {
        if (!active) return
        setScanTotal(res.data?.total_scans ?? 0)
      })
      .catch(() => {
        if (!active) return
        setScanTotal(0)
      })
    return () => {
      active = false
    }
  }, [profileOpen])

  const submit = (e) => {
    e.preventDefault()
    if (!url.trim()) return
    onQuickScan?.(url)
  }

  return (
    <header className="glass relative z-40 mb-4 flex items-center justify-between rounded-xl p-3">
      <form onSubmit={submit} className="flex w-[70%] items-center gap-2 rounded-lg bg-slate-900/60 p-2">
        <FiSearch className="text-cyan" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          placeholder="Search or scan URL..."
        />
        <button className="rounded bg-neon px-3 py-1 text-xs font-semibold text-slate-900">Scan</button>
      </form>
      <div className="flex items-center gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="pulse-dot h-2 w-2 rounded-full bg-neon" />
          System Protected
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-full border border-cyan/30 bg-slate-900/60 p-2 text-cyan transition hover:border-cyan hover:text-white"
          title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
          type="button"
        >
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
        <div className="relative">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-cyan/30 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 transition hover:border-cyan"
            type="button"
          >
            <FiUser className="text-cyan" />
            {displayName}
          </button>
          {profileOpen && (
            <div className="absolute right-0 z-50 mt-3 w-64 rounded-xl border border-cyan/30 bg-slate-900/95 p-4 text-left shadow-glow">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan/80">Profile</p>
              <h4 className="mt-2 text-base font-semibold text-slate-100">{displayName}</h4>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                <FiMail className="text-cyan" />
                {user?.email || 'unknown'}
              </p>
              <div className="mt-3 rounded-lg bg-slate-800/50 p-3">
                <p className="text-[11px] uppercase text-slate-300">Total Scans</p>
                <p className="mt-1 text-lg font-semibold text-neon">{scanTotal ?? '...'}</p>
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="mt-3 w-full rounded-lg border border-alert/40 bg-slate-900/60 py-2 text-xs font-semibold text-alert transition hover:border-alert"
                type="button"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
