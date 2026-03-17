import { useEffect, useState } from 'react'

import api from '../services/api'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    api.get('/api/alerts').then((res) => setAlerts(res.data)).catch(() => {})
  }, [])

  return (
    <div className="glass rounded-xl p-4">
      <h2 className="font-cyber text-lg text-cyan">Threat Alerts</h2>
      <div className="mt-3 space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-lg border border-alert/40 bg-alert/10 p-3">
            <p className="font-semibold text-alert">{alert.title}</p>
            <p className="text-sm">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
