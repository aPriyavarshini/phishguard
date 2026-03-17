import { useEffect, useState } from 'react'

import api from '../services/api'

export default function HistoryPage() {
  const [history, setHistory] = useState([])

  const load = async () => {
    const { data } = await api.get('/api/history')
    setHistory(data)
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  const exportHistory = async (format) => {
    const res = await api.post('/api/history/export', { format }, { responseType: 'blob' })
    const blobUrl = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `scan-history.${format}`
    a.click()
    URL.revokeObjectURL(blobUrl)
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-cyber text-lg text-cyan">Scan History</h2>
        <div className="space-x-2">
          <button onClick={() => exportHistory('csv')} className="rounded bg-cyan px-3 py-1 text-xs text-slate-900">Export CSV</button>
          <button onClick={() => exportHistory('pdf')} className="rounded bg-neon px-3 py-1 text-xs text-slate-900">Export PDF</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="p-2">URL</th>
              <th className="p-2">Prediction</th>
              <th className="p-2">Confidence</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-t border-slate-800/50">
                <td className="p-2">{item.url}</td>
                <td className={`p-2 ${item.prediction === 'Phishing' ? 'text-alert' : 'text-neon'}`}>{item.prediction}</td>
                <td className="p-2">{(item.confidence * 100).toFixed(2)}%</td>
                <td className="p-2">{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
