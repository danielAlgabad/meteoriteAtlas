import { useGlobe } from '../../hooks/useGlobe'
import { useMeteoriteDetail } from '../../hooks/useMeteorities'

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
          {isLoading ? 'Loading…' : (meteorite?.name ?? 'Unknown')}
        </h2>
        <button
          onClick={() => setSelectedId(null)}
          className="
            flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
            text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-all text-sm
          "
          aria-label="Close"
        >
          ×
        </button>
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
              {meteorite.fall}
            </span>
          )}

          <div className="space-y-0">
            <Row label="ID" value={`#${meteorite.id}`} />
            <Row label="Class" value={meteorite.meteorite_class} />
            <Row label="Group" value={meteorite.classification_group} />
            <Row label="Mass" value={formatMass(meteorite.mass)} />
            <Row label="Year" value={meteorite.year} />
            <div className="flex justify-between gap-3 py-1.5 border-b border-slate-800/60">
              <span className="text-[11px] text-slate-500 flex-shrink-0">Coordinates</span>
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
