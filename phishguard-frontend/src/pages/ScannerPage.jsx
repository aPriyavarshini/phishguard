import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import api from '../services/api'

export default function ScannerPage() {
  const [params] = useSearchParams()
  const [url, setUrl] = useState(params.get('url') || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const scan = async (e) => {
    e?.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/api/scan', { url })
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.get('url')) scan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <form onSubmit={scan} className="glass rounded-xl p-4">
        <h2 className="font-cyber text-lg text-cyan">URL Scanner</h2>
        <div className="mt-3 flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded bg-slate-900/70 p-2" placeholder="https://secure-login-paypal.com" />
          <button disabled={loading} className="rounded bg-neon px-4 font-semibold text-slate-900">{loading ? 'Scanning' : 'Scan'}</button>
        </div>
      </form>

      {result && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-cyber text-cyan">Scan Result</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <p>Prediction: <span className={result.prediction === 'Phishing' ? 'text-alert' : 'text-neon'}>{result.prediction}</span></p>
            <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
            <p>Risk Level: {result.risk_score}</p>
            <p>Safety Score: {result.safety_score}/100</p>
          </div>
          <h4 className="mt-4 text-sm text-slate-300">AI Explanation</h4>
          <ul className="mt-2 list-disc pl-6 text-sm">
            {result.explanation.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
