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

function centuryToYearRange(label) {
  const n = parseInt(label)
  return [(n - 1) * 100, n * 100 - 1]
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label} century</p>
      <p className="text-sky-400 font-medium">
        {payload[0].value.toLocaleString()} meteorites
      </p>
    </div>
  )
}

export function TimelineChart({ byCentury }) {
  const { setFilter } = useFilters()

  const data = Object.entries(byCentury)
    .map(([century, count]) => ({ century, count, n: parseInt(century) }))
    .sort((a, b) => a.n - b.n)

  const handleBarClick = (entry) => {
    if (!entry?.activePayload?.[0]) return
    const label = entry.activePayload[0].payload.century
    const [from, to] = centuryToYearRange(label)
    setFilter('year_from', from)
    setFilter('year_to', to)
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
          dataKey="century"
          tick={{ fill: '#475569', fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide domain={[0, maxCount * 1.1]} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
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
