import { useEffect, useState } from 'react'

import api from '../services/api'

export default function ThreatIntelPage() {
  const [threats, setThreats] = useState([])

  useEffect(() => {
    api.get('/api/threats').then((res) => setThreats(res.data)).catch(() => {})
  }, [])

  return (
    <div className="glass rounded-xl p-4">
      <h2 className="font-cyber text-lg text-cyan">Threat Intelligence</h2>
      <div className="mt-3 space-y-3">
        {threats.map((item) => (
          <div key={item.domain} className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
            <p className="font-semibold">{item.domain}</p>
            <p className="text-sm text-slate-300">Threat level: <span className="text-alert">{item.threat_level}</span> | Scans: {item.scan_count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
