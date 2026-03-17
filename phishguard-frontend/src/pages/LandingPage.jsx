import { Link } from 'react-router-dom'
import { FiShield, FiZap, FiTarget, FiArrowRight } from 'react-icons/fi'

import { useTheme } from '../context/ThemeContext'

const features = [
  {
    title: 'Real-time scanning',
    description: 'Instantly score suspicious URLs and get a clear risk signal.',
    icon: FiZap,
  },
  {
    title: 'Threat intelligence',
    description: 'Track attack patterns and see what is targeting your users.',
    icon: FiTarget,
  },
  {
    title: 'Actionable alerts',
    description: 'Email notifications for phishing detections, ready for response.',
    icon: FiShield,
  },
]

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-70" />
      <div className="absolute -left-40 top-24 h-72 w-72 rounded-full bg-cyan/20 blur-3xl" />
      <div className="absolute -right-40 bottom-20 h-72 w-72 rounded-full bg-neon/20 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <FiShield className="text-2xl text-neon" />
          <span className="font-cyber text-xl">PhishGuard</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={toggleTheme}
            className="rounded-full border border-cyan/30 bg-slate-900/60 px-4 py-2 text-cyan transition hover:border-cyan"
            type="button"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <Link to="/login" className="rounded-full border border-cyan/30 px-4 py-2 text-slate-100 transition hover:border-cyan">
            Login
          </Link>
          <Link to="/signup" className="rounded-full bg-neon px-4 py-2 font-semibold text-slate-900">
            Sign up
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-6 pb-8 pt-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan/80">Protect every click</p>
          <h1 className="font-cyber text-2xl text-slate-100 lg:text-3xl">
            Threat intelligence that feels fast, focused, and human.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            PhishGuard helps you scan URLs, detect phishing risk, and notify your team instantly. Stay on top of
            evolving campaigns with an interface that is built for speed.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className="flex items-center gap-2 rounded-full bg-neon px-5 py-2.5 text-sm font-semibold text-slate-900">
              Get started
              <FiArrowRight />
            </Link>
            <Link to="/login" className="rounded-full border border-cyan/30 px-5 py-2.5 text-sm text-slate-100 transition hover:border-cyan">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="glass relative overflow-hidden rounded-3xl p-4">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="relative space-y-3">
            <img src="/login-shield.svg" alt="Security shield" className="mx-auto w-3/5" />
            <img src="/login-orbit.svg" alt="Threat orbit" className="mx-auto w-2/3" />
            <div className="grid grid-cols-1 gap-2">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="flex items-start gap-3 rounded-xl border border-cyan/20 bg-slate-900/60 p-2">
                    <Icon className="mt-1 text-cyan" />
                    <div>
                      <p className="text-xs font-semibold text-slate-100">{feature.title}</p>
                      <p className="text-xs text-slate-300">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
