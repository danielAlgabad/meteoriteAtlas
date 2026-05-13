import { useGlobe } from '../../hooks/useGlobe'
import { useMeteoriteDetail } from '../../hooks/useMeteorities'
import { useT } from '../../hooks/useLanguage'

function formatMass(grams) {
  if (grams == null) return '—'
  if (grams >= 1_000_000) return `${(grams / 1_000_000).toFixed(2)} t`
  if (grams >= 1_000) return `${(grams / 1_000).toFixed(2)} kg`
  if (grams >= 1) return `${grams.toFixed(2)} g`
  return `${(grams * 1000).toFixed(2)} mg`
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-slate-800/60">
      <span className="text-[11px] text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-[11px] text-slate-200 text-right font-medium">
        {value ?? '—'}
      </span>
    </div>
  )
}

export function MeteoriteDetail() {
  const { selectedId, setSelectedId } = useGlobe()
  const { data: meteorite, isLoading } = useMeteoriteDetail(selectedId)
  const t = useT()

  if (!selectedId) return null

  return (
    <div className="
      flex flex-col gap-3 p-4
      bg-slate-900/90 backdrop-blur-md
      border border-slate-700/30 rounded-xl
      max-h-full overflow-y-auto
    ">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100 leading-tight break-words">
          {isLoading ? t('detail.loading') : (meteorite?.name ?? t('detail.unknown'))}
        </h2>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isLoading && meteorite && (
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(meteorite.name + ' meteorite')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-sky-300 hover:border-sky-500/40 transition-all"
            >
              {t('detail.more_info')}
            </a>
          )}
          <button
            onClick={() => setSelectedId(null)}
            className="
              w-6 h-6 rounded-full flex items-center justify-center
              text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-all text-sm
            "
            aria-label={t('detail.close')}
          >
            ×
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && meteorite && (
        <>
          {/* Fall badge */}
          {meteorite.fall && (
            <span
              className={`
                self-start px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider
                ${meteorite.fall === 'Fell'
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'}
              `}
            >
              {t(`fall.${meteorite.fall}`)}
            </span>
          )}

          <div className="space-y-0">
            <Row label={t('detail.id')} value={`#${meteorite.id}`} />
            <Row label={t('detail.class')} value={meteorite.meteorite_class} />
            <Row label={t('detail.group')} value={meteorite.classification_group} />
            <Row label={t('detail.mass')} value={formatMass(meteorite.mass)} />
            <Row label={t('detail.year')} value={meteorite.year} />
            <div className="flex justify-between gap-3 py-1.5 border-b border-slate-800/60">
              <span className="text-[11px] text-slate-500 flex-shrink-0">{t('detail.coordinates')}</span>
              {meteorite.lat != null ? (
                <a
                  href={`https://www.google.com/maps?q=${meteorite.lat},${meteorite.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-400 hover:text-sky-300 text-right font-medium transition-colors"
                >
                  {meteorite.lat.toFixed(4)}°, {meteorite.lon.toFixed(4)}°
                </a>
              ) : (
                <span className="text-[11px] text-slate-200 text-right font-medium">—</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
