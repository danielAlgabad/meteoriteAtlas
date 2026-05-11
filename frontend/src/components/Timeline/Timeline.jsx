import { useStats } from '../../hooks/useMeteorities'
import { useT } from '../../hooks/useLanguage'
import { TimelineChart } from './TimelineChart'

export function Timeline() {
  const { data: stats, isLoading } = useStats()
  const t = useT()

  if (isLoading || !stats) return null

  return (
    <div className="h-full flex flex-col px-4 pt-2 pb-1">
      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
        {t('timeline.title')}
      </span>
      <div className="flex-1 min-h-0">
        <TimelineChart byCentury={stats.by_century} />
      </div>
    </div>
  )
}
