import { useFilters } from '../../hooks/useFilters'
import { useStats } from '../../hooks/useMeteorities'
import { MassFilter } from './MassFilter'
import { YearFilter } from './YearFilter'

const FALL_OPTIONS = [
  { value: undefined, label: 'All' },
  { value: 'Fell', label: 'Fell' },
  { value: 'Found', label: 'Found' },
]

const LEGEND = [
  { color: '#f97316', label: 'Fell' },
  { color: '#22d3ee', label: 'Found' },
  { color: '#a78bfa', label: 'Unknown' },
]

export function FilterPanel() {
  const { filters, setFilter, resetFilters } = useFilters()
  const { data: stats } = useStats()

  const hasActiveFilters =
    filters.mass_min != null ||
    filters.mass_max != null ||
    filters.year_from != null ||
    filters.year_to != null ||
    filters.fall != null ||
    filters.meteorite_class != null

  return (
    <div className="
      h-full flex flex-col gap-4 p-4
      bg-slate-900/85 backdrop-blur-md
      border border-slate-700/30 rounded-xl
      overflow-y-auto
    ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[10px] text-sky-400 hover:text-sky-300 transition-colors"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-lg font-bold text-sky-400">
              {stats.total.toLocaleString()}
            </p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Total</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-lg font-bold text-orange-400">
              {stats.observed_falling.toLocaleString()}
            </p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Observed</p>
          </div>
        </div>
      )}

      <hr className="border-slate-700/40" />

      {/* Fall type */}
      <div>
        <p className="filter-label">Fall Type</p>
        <div className="flex gap-1.5 mt-2">
          {FALL_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setFilter('fall', opt.value)}
              className={`
                flex-1 py-1.5 rounded text-[11px] font-medium border transition-all
                ${
                  filters.fall === opt.value
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                    : 'bg-slate-800/50 border-slate-700/30 text-slate-400 hover:border-slate-600'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mass filter */}
      <MassFilter />

      {/* Year filter */}
      <YearFilter />

      {/* Class search */}
      <div>
        <p className="filter-label">Class</p>
        <input
          type="text"
          placeholder="e.g. L5, H4, Iron…"
          value={filters.meteorite_class ?? ''}
          onChange={(e) =>
            setFilter('meteorite_class', e.target.value || undefined)
          }
          className="
            w-full mt-2 bg-slate-800/60 border border-slate-700/50 rounded px-3 py-1.5
            text-xs text-slate-200 placeholder-slate-600 outline-none
            focus:border-sky-500/50 transition-colors
          "
        />
      </div>

      <hr className="border-slate-700/40" />

      {/* Legend */}
      <div>
        <p className="filter-label mb-2">Legend</p>
        <div className="space-y-1.5">
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-[11px] text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
