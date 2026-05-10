import { useFilters } from '../../hooks/useFilters'

const MIN_YEAR = 860
const MAX_YEAR = 2013

// Pad year to 4 digits for the ISO date value attribute
const toDateValue = (year) => `${String(year).padStart(4, '0')}-01-01`

const extractYear = (isoDateStr) => {
  if (!isoDateStr) return undefined
  const year = parseInt(isoDateStr.split('-')[0], 10)
  return isNaN(year) ? undefined : year
}

export function YearFilter() {
  const { filters, setFilter } = useFilters()

  const fromYear = filters.year_from ?? MIN_YEAR
  const toYear = filters.year_to ?? MAX_YEAR

  return (
    <div>
      <p className="filter-label">Year Range</p>
      <div className="space-y-2 mt-2">
        <div>
          <p className="text-[9px] text-slate-500 mb-1">From</p>
          <input
            type="date"
            value={toDateValue(fromYear)}
            min={toDateValue(MIN_YEAR)}
            max={toDateValue(MAX_YEAR)}
            onChange={(e) => setFilter('year_from', extractYear(e.target.value))}
            className="
              w-full bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1
              text-xs text-slate-200 outline-none
              focus:border-sky-500/50 transition-colors
              [color-scheme:dark]
            "
          />
        </div>
        <div>
          <p className="text-[9px] text-slate-500 mb-1">To</p>
          <input
            type="date"
            value={toDateValue(toYear)}
            min={toDateValue(MIN_YEAR)}
            max={toDateValue(MAX_YEAR)}
            onChange={(e) => setFilter('year_to', extractYear(e.target.value))}
            className="
              w-full bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1
              text-xs text-slate-200 outline-none
              focus:border-sky-500/50 transition-colors
              [color-scheme:dark]
            "
          />
        </div>
      </div>
    </div>
  )
}
