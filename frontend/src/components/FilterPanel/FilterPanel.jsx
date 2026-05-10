import { useFilters } from '../../hooks/useFilters'
import { useStats } from '../../hooks/useMeteorities'
import { MassFilter } from './MassFilter'
import { YearFilter } from './YearFilter'

const FALL_TYPES = [
  { type: 'Fell',  activeClass: 'bg-orange-500/20 border-orange-500/50 text-orange-400' },
  { type: 'Found', activeClass: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' },
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
    filters.fall?.length === 1 ||
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

      {/* Fall type — multi-select toggle */}
      <div>
        <p className="filter-label">Fall Type</p>
        <div className="flex gap-1.5 mt-2">
          {FALL_TYPES.map(({ type, activeClass }) => {
            const current = filters.fall || []
            const active = current.includes(type)
            const isLast = active && current.length === 1
            return (
              <button
                key={type}
                disabled={isLast}
                onClick={() => {
                  const next = active
                    ? current.filter((v) => v !== type)
                    : [...current, type]
                  setFilter('fall', next)
                }}
                className={`
                  flex-1 py-1.5 rounded text-[11px] font-medium border transition-all
                  ${active
                    ? activeClass
                    : 'bg-slate-800/50 border-slate-700/30 text-slate-400 hover:border-slate-600'}
                  ${isLast ? 'cursor-not-allowed' : ''}
                `}
              >
                {type}
              </button>
            )
          })}
        </div>
      </div>

      {/* Mass filter */}
      <MassFilter />

      {/* Year filter */}
      <YearFilter />

      {/* Class dropdown */}
      <div>
        <p className="filter-label">Class</p>
        <select
          value={filters.meteorite_class ?? ''}
          onChange={(e) => setFilter('meteorite_class', e.target.value || undefined)}
          className="
            w-full mt-2 bg-slate-800/90 border border-slate-700/50 rounded px-2 py-1.5
            text-xs text-slate-200 outline-none
            focus:border-sky-500/50 transition-colors cursor-pointer
          "
        >
          <option value="">All classes</option>
          <optgroup label="Ordinary — H">
            {['H3', 'H4', 'H5', 'H6', 'H3-4', 'H4-5', 'H5-6', 'H3-6'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
          <optgroup label="Ordinary — L">
            {['L3', 'L4', 'L5', 'L6', 'L3-4', 'L4-5', 'L5-6', 'L3-6'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
          <optgroup label="Ordinary — LL">
            {['LL3', 'LL4', 'LL5', 'LL6', 'LL3-4', 'LL4-5', 'LL5-6', 'LL3-6'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
          <optgroup label="Carbonaceous">
            {['CI1', 'CM1', 'CM2', 'CM1/2', 'CO3', 'CV3', 'CK4', 'CK5', 'CR2', 'CH3'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
          <optgroup label="Iron">
            {['Iron, IAB-MG', 'Iron, IIIAB', 'Iron, IVA', 'Iron, IVB', 'Iron, IIAB', 'Iron, IIE'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
          <optgroup label="Achondrites">
            {['Eucrite', 'Howardite', 'Diogenite', 'Ureilite', 'Aubrite', 'Angrite', 'Acapulcoite', 'Lodranite'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
          <optgroup label="Stony-iron">
            {['Pallasite, PMG', 'Mesosiderite', 'Mesosiderite-A'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
          <optgroup label="Lunar">
            {['Lunar (anorth)', 'Lunar (bas/anor)', 'Lunar (basalt)', 'Lunar (gabbro)'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
          <optgroup label="Martian">
            {['Martian (nakhlite)', 'Martian (shergottite)', 'Martian (chassignite)', 'Martian (orthopyroxenite)'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
        </select>
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
