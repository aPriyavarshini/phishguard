import { NavLink } from 'react-router-dom'
import { FiActivity, FiAlertTriangle, FiClock, FiHome, FiSearch, FiSettings, FiShield } from 'react-icons/fi'

const nav = [
  { to: '/app/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/app/scanner', label: 'URL Scanner', icon: FiSearch },
  { to: '/app/history', label: 'Scan History', icon: FiClock },
  { to: '/app/threat-intel', label: 'Threat Intel', icon: FiShield },
  { to: '/app/alerts', label: 'Alerts', icon: FiAlertTriangle },
  { to: '/app/settings', label: 'Settings', icon: FiSettings },
]

export default function Sidebar() {
  return (
    <aside className="glass h-screen w-64 border-r border-cyan/20 p-4">
      <div className="mb-8 flex items-center gap-3">
        <FiActivity className="text-2xl text-neon" />
        <h1 className="font-cyber text-xl">PhishGuard</h1>
      </div>
      <nav className="space-y-2">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive ? 'bg-cyan/20 text-cyan' : 'text-slate-300 hover:bg-slate-800/40'
                }`
              }
            >
              <Icon />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
