import { useFilters } from '../../hooks/useFilters'
import { useT } from '../../hooks/useLanguage'

const MIN_MASS = 0
const MAX_MASS = 60_000_000

export function MassFilter() {
  const { filters, setFilter } = useFilters()
  const t = useT()

  const handleMin = (e) => {
    const v = e.target.value === '' ? undefined : parseFloat(e.target.value)
    setFilter('mass_min', v)
  }

  const handleMax = (e) => {
    const v = e.target.value === '' ? undefined : parseFloat(e.target.value)
    setFilter('mass_max', v)
  }

  return (
    <div>
      <p className="filter-label">{t('filter.mass')}</p>
      <p className="text-[9px] text-slate-600 mt-0.5">
        {t('filter.mass.range', { min: MIN_MASS.toLocaleString(), max: MAX_MASS.toLocaleString() })}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1">
          <p className="text-[9px] text-slate-500 mb-1">{t('filter.mass.min')}</p>
          <input
            type="number"
            min={MIN_MASS}
            max={MAX_MASS}
            step={1}
            placeholder="0"
            value={filters.mass_min ?? ''}
            onChange={handleMin}
            className="
              w-full bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1
              text-xs text-slate-200 placeholder-slate-600 outline-none
              focus:border-sky-500/50 transition-colors
            "
          />
        </div>
        <span className="text-slate-600 text-xs mt-4 flex-shrink-0">—</span>
        <div className="flex-1">
          <p className="text-[9px] text-slate-500 mb-1">{t('filter.mass.max')}</p>
          <input
            type="number"
            min={MIN_MASS}
            max={MAX_MASS}
            step={1}
            placeholder="60,000,000"
            value={filters.mass_max ?? ''}
            onChange={handleMax}
            className="
              w-full bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1
              text-xs text-slate-200 placeholder-slate-600 outline-none
              focus:border-sky-500/50 transition-colors
            "
          />
        </div>
      </div>
    </div>
  )
}
