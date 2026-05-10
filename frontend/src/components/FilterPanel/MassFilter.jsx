import { useFilters } from '../../hooks/useFilters'

// Discrete mass breakpoints on a log scale
const MASS_STEPS = [
  { value: undefined, label: 'Any' },
  { value: 1, label: '1 g' },
  { value: 10, label: '10 g' },
  { value: 100, label: '100 g' },
  { value: 1_000, label: '1 kg' },
  { value: 10_000, label: '10 kg' },
  { value: 100_000, label: '100 kg' },
  { value: 1_000_000, label: '1 t' },
  { value: 10_000_000, label: '10 t' },
]

function stepIndex(value) {
  if (value == null) return 0
  const i = MASS_STEPS.findIndex((s) => s.value === value)
  return i === -1 ? 0 : i
}

export function MassFilter() {
  const { filters, setFilter } = useFilters()

  const minIdx = stepIndex(filters.mass_min)
  const maxIdx = stepIndex(filters.mass_max)

  const handleMin = (e) => {
    const idx = Number(e.target.value)
    setFilter('mass_min', MASS_STEPS[idx].value)
  }

  const handleMax = (e) => {
    const idx = Number(e.target.value)
    setFilter('mass_max', MASS_STEPS[idx].value)
  }

  return (
    <div>
      <p className="filter-label">Mass</p>
      <div className="space-y-3 mt-2">
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Min</span>
            <span className="text-slate-300">{MASS_STEPS[minIdx].label}</span>
          </div>
          <input
            type="range"
            min={0}
            max={MASS_STEPS.length - 1}
            value={minIdx}
            onChange={handleMin}
          />
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Max</span>
            <span className="text-slate-300">{MASS_STEPS[maxIdx].label}</span>
          </div>
          <input
            type="range"
            min={0}
            max={MASS_STEPS.length - 1}
            value={maxIdx}
            onChange={handleMax}
          />
        </div>
      </div>
    </div>
  )
}
