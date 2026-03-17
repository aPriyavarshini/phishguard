import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiMoon, FiSun } from 'react-icons/fi'
import { supabase } from '../services/supabase'
import { useTheme } from '../context/ThemeContext'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (authError) return setError(authError.message)
    navigate('/app/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass grid w-full max-w-5xl grid-cols-1 items-center gap-6 rounded-3xl p-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="relative w-full rounded-2xl p-2 lg:p-4">
          <button
            onClick={toggleTheme}
            className="absolute right-4 top-4 rounded-full border border-cyan/30 bg-slate-900/60 p-2 text-cyan transition hover:border-cyan"
            title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
            type="button"
          >
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-cyan">
            <FiArrowLeft />
            Back to home
          </Link>
          <h1 className="mt-3 font-cyber text-2xl text-cyan">Create Account</h1>
          <p className="mt-2 text-sm text-slate-300">Build your threat monitoring workspace.</p>
          <input className="mt-4 w-full rounded bg-slate-900/70 p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="mt-3 w-full rounded bg-slate-900/70 p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="mt-3 w-full rounded bg-slate-900/70 p-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="mt-2 text-sm text-alert">{error}</p>}
          <button className="mt-4 w-full rounded bg-neon p-2 font-semibold text-slate-900">Create account</button>
          <p className="mt-3 text-sm text-slate-300">
            Already have an account? <Link to="/login" className="text-cyan">Login</Link>
          </p>
        </form>
        <div className="relative hidden overflow-hidden rounded-2xl border border-cyan/20 bg-slate-900/40 p-6 lg:block">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="relative space-y-4">
            <img src="/login-orbit.svg" alt="Threat orbit" className="mx-auto w-4/5" />
            <img src="/login-shield.svg" alt="Security shield" className="mx-auto w-3/4" />
            <div className="rounded-xl border border-cyan/30 bg-slate-900/60 p-4 text-sm">
              <p className="font-cyber text-cyan">Welcome to PhishGuard</p>
              <p className="mt-2 text-slate-300">
                Get protected in minutes with instant scanning and live alerting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
