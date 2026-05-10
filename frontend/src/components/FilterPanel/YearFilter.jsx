import { useFilters } from '../../hooks/useFilters'

const MIN_YEAR = 860
const MAX_YEAR = 2013

export function YearFilter() {
  const { filters, setFilter } = useFilters()

  const from = filters.year_from ?? MIN_YEAR
  const to = filters.year_to ?? MAX_YEAR

  return (
    <div>
      <p className="filter-label">Year Range</p>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="number"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={from}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            setFilter('year_from', isNaN(v) ? undefined : v)
          }}
          className="
            w-full bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1
            text-xs text-slate-200 text-center outline-none
            focus:border-sky-500/50 transition-colors
          "
        />
        <span className="text-slate-600 text-xs flex-shrink-0">—</span>
        <input
          type="number"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={to}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            setFilter('year_to', isNaN(v) ? undefined : v)
          }}
          className="
            w-full bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1
            text-xs text-slate-200 text-center outline-none
            focus:border-sky-500/50 transition-colors
          "
        />
      </div>
    </div>
  )
}
