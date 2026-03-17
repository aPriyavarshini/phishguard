import { FiBell, FiMail, FiShield, FiUser } from 'react-icons/fi'

import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h2 className="font-cyber text-lg text-cyan">Settings</h2>
        <p className="mt-2 text-sm text-slate-300">Manage your security profile and alerting preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan">
            <FiUser />
            <h3 className="font-cyber text-sm uppercase tracking-[0.2em]">Profile</h3>
          </div>
          <p className="mt-3 text-sm text-slate-300">Signed in as</p>
          <p className="text-base font-semibold text-slate-100">{user?.email || 'unknown'}</p>
          <p className="mt-2 text-xs text-slate-300">User ID</p>
          <p className="text-xs text-slate-100">{user?.id || 'local-dev-user'}</p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan">
            <FiBell />
            <h3 className="font-cyber text-sm uppercase tracking-[0.2em]">Alerts</h3>
          </div>
          <p className="mt-3 text-sm text-slate-300">Threat emails are delivered to</p>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-cyan/20 bg-slate-900/60 p-2 text-xs text-slate-100">
            <FiMail className="text-cyan" />
            {user?.email || 'unknown'}
          </div>
          <p className="mt-3 text-xs text-slate-300">
            Configure SMTP on the backend to enable outbound emails.
          </p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan">
            <FiShield />
            <h3 className="font-cyber text-sm uppercase tracking-[0.2em]">Security</h3>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            <li>Use strong passwords with a passphrase.</li>
            <li>Review scan history for anomalies weekly.</li>
            <li>Rotate credentials after phishing detections.</li>
          </ul>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="font-cyber text-sm uppercase tracking-[0.2em] text-cyan">Account Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded bg-alert px-4 py-2 text-sm font-semibold"
          >
            Logout
          </button>
          <button className="rounded border border-cyan/30 bg-slate-900/60 px-4 py-2 text-sm text-slate-100">
            Download Activity Report
          </button>
        </div>
      </div>
    </div>
  )
}
