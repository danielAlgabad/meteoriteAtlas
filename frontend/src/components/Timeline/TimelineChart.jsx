import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useFilters } from '../../hooks/useFilters'
import { useT } from '../../hooks/useLanguage'

function CustomTooltip({ active, payload, t }) {
  if (!active || !payload?.length) return null
  const { n, count } = payload[0].payload
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{t('timeline.century', n)}</p>
      <p className="text-sky-400 font-medium">
        {t('timeline.meteorites', { count: count.toLocaleString() })}
      </p>
    </div>
  )
}

export function TimelineChart({ byCentury }) {
  const { setFilter } = useFilters()
  const t = useT()

  const data = Object.entries(byCentury)
    .map(([century, count]) => ({ century, count, n: parseInt(century) }))
    .sort((a, b) => a.n - b.n)

  const handleBarClick = (entry) => {
    if (!entry?.activePayload?.[0]) return
    const n = entry.activePayload[0].payload.n
    setFilter('year_from', (n - 1) * 100)
    setFilter('year_to', n * 100 - 1)
  }

  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        onClick={handleBarClick}
        style={{ cursor: 'pointer' }}
      >
        <XAxis
          dataKey="n"
          tick={{ fill: '#475569', fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide domain={[0, maxCount * 1.1]} />
        <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
        <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={28}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill="#38bdf8"
              fillOpacity={0.55 + (entry.count / maxCount) * 0.45}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
