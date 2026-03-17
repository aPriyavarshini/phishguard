import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import { FiAlertTriangle, FiRadio, FiShield, FiZap } from 'react-icons/fi'

import api from '../services/api'
import StatCard from '../components/StatCard'

const colors = ['#ff4d6d', '#1dff9e']
const emptyAnalytics = {
  total_scans: 0,
  threats_detected: 0,
  safe_urls: 0,
  average_scan_time_ms: 0,
  threat_trend: [],
  category_breakdown: [],
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(emptyAnalytics)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    const fetchAnalytics = () => {
      api
        .get('/api/analytics')
        .then((res) => {
          const payload = res?.data && typeof res.data === 'object' ? res.data : {}
          setAnalytics({
            ...emptyAnalytics,
            ...payload,
            threat_trend: Array.isArray(payload.threat_trend) ? payload.threat_trend : [],
            category_breakdown: Array.isArray(payload.category_breakdown) ? payload.category_breakdown : [],
          })
        })
        .catch(() => setAnalytics(emptyAnalytics))
    }
    const fetchAlerts = () => {
      api
        .get('/api/alerts')
        .then((res) => setAlerts(Array.isArray(res.data) ? res.data : []))
        .catch(() => setAlerts([]))
    }
    fetchAnalytics()
    fetchAlerts()
    const timer = setInterval(fetchAnalytics, 10000)
    const alertTimer = setInterval(fetchAlerts, 15000)
    return () => {
      clearInterval(timer)
      clearInterval(alertTimer)
    }
  }, [])

  const protectionScore = useMemo(() => {
    if (!analytics.total_scans) return 0
    return Math.round((analytics.safe_urls / analytics.total_scans) * 100)
  }, [analytics.safe_urls, analytics.total_scans])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard title="Total Scans Today" value={analytics.total_scans} />
        <StatCard title="Threats Detected" value={analytics.threats_detected} accent="text-alert" />
        <StatCard title="Safe URLs" value={analytics.safe_urls} accent="text-neon" />
        <StatCard title="Average Scan Time" value={`${analytics.average_scan_time_ms} ms`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan">
            <FiRadio />
            <h3 className="font-cyber text-sm uppercase tracking-[0.2em]">Protection Score</h3>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-4xl font-semibold text-neon">{protectionScore}%</p>
              <p className="mt-1 text-xs text-slate-300">Based on safe URL ratio</p>
            </div>
            <div className="rounded-full border border-cyan/30 px-3 py-2 text-xs text-cyan">Stable</div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan">
            <FiZap />
            <h3 className="font-cyber text-sm uppercase tracking-[0.2em]">Action Center</h3>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <button className="rounded-lg border border-cyan/30 bg-slate-900/60 px-3 py-2 text-slate-100 transition hover:border-cyan">
              Run Deep Scan
            </button>
            <button className="rounded-lg border border-cyan/30 bg-slate-900/60 px-3 py-2 text-slate-100 transition hover:border-cyan">
              View Intel
            </button>
            <button className="rounded-lg border border-cyan/30 bg-slate-900/60 px-3 py-2 text-slate-100 transition hover:border-cyan">
              Export Report
            </button>
            <button className="rounded-lg border border-cyan/30 bg-slate-900/60 px-3 py-2 text-slate-100 transition hover:border-cyan">
              Tuning Tips
            </button>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan">
            <FiShield />
            <h3 className="font-cyber text-sm uppercase tracking-[0.2em]">Threat Radar</h3>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            {(alerts || []).slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 rounded-lg bg-slate-900/60 p-3">
                <FiAlertTriangle className="mt-1 text-alert" />
                <div>
                  <p className="text-sm text-slate-100">{alert.title}</p>
                  <p className="text-[11px] text-slate-300">{alert.message}</p>
                </div>
              </div>
            ))}
            {!alerts?.length && <p className="text-xs text-slate-300">No active alerts in the last 24 hours.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-4">
          <h3 className="mb-3 font-cyber text-cyan">Threat Detection Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.threat_trend}>
              <defs>
                <linearGradient id="threat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2C46" />
              <XAxis dataKey="date" stroke="#93A4BD" />
              <YAxis stroke="#93A4BD" />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#ff4d6d" fillOpacity={1} fill="url(#threat)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-4">
          <h3 className="mb-3 font-cyber text-cyan">URL Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={analytics.category_breakdown} dataKey="value" nameKey="name" outerRadius={90}>
                {(analytics.category_breakdown || []).map((_, idx) => (
                  <Cell key={idx} fill={colors[idx % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
