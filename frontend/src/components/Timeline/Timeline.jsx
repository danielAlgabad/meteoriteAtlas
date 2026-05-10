import { useStats } from '../../hooks/useMeteorities'
import { TimelineChart } from './TimelineChart'

export function Timeline() {
  const { data: stats, isLoading } = useStats()

  if (isLoading || !stats) return null

  return (
    <div className="h-full flex flex-col px-4 pt-2 pb-1">
      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
        Impacts by Century
      </span>
      <div className="flex-1 min-h-0">
        <TimelineChart byCentury={stats.by_century} />
      </div>
    </div>
  )
}
