export default function StatCard({ title, value, accent = 'text-cyan' }) {
  return (
    <div className="glass rounded-xl p-4 shadow-glow">
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <h3 className={`mt-2 text-2xl font-bold ${accent}`}>{value}</h3>
    </div>
  )
}
