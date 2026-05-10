import { useStats } from '../../hooks/useMeteorities'
import { useFilters } from '../../hooks/useFilters'
import { TimelineChart } from './TimelineChart'

export function Timeline() {
  const { data: stats, isLoading } = useStats()
  const { filters, setFilter } = useFilters()

  const hasYearFilter = filters.year_from != null || filters.year_to != null

  if (isLoading || !stats) return null

  return (
    <div className="h-full flex flex-col px-4 pt-2 pb-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
          Impacts by Century
        </span>
        {hasYearFilter && (
          <button
            onClick={() => {
              setFilter('year_from', undefined)
              setFilter('year_to', undefined)
            }}
            className="text-[10px] text-sky-400 hover:text-sky-300 transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <TimelineChart byCentury={stats.by_century} />
      </div>
    </div>
  )
}
