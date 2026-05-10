import { useGlobeData } from './hooks/useMeteorities'
import { useGlobe } from './hooks/useGlobe'
import { Globe } from './components/Globe/Globe'
import { FilterPanel } from './components/FilterPanel/FilterPanel'
import { MeteoriteDetail } from './components/MeteoriteDetail/MeteoriteDetail'
import { Timeline } from './components/Timeline/Timeline'

function Header({ pointCount, isLoading }) {
  const { isFilterPanelOpen, toggleFilterPanel } = useGlobe()

  return (
    <header className="
      absolute top-0 left-0 right-0 z-10
      flex items-center justify-between
      px-5 py-3
      bg-gradient-to-b from-slate-950/80 to-transparent
    ">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-sky-400 rounded-full" />
        <h1 className="text-base font-bold tracking-[0.15em] text-slate-100 uppercase">
          Meteorite Atlas
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {!isLoading && pointCount > 0 && (
          <span className="text-xs text-slate-500 tabular-nums">
            {pointCount.toLocaleString()} points
          </span>
        )}
        {isLoading && (
          <span className="text-xs text-slate-600 animate-pulse">Loading…</span>
        )}
        <button
          onClick={toggleFilterPanel}
          className={`
            px-3 py-1 rounded border text-xs font-medium transition-all
            ${isFilterPanelOpen
              ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
              : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:border-slate-600'}
          `}
        >
          {isFilterPanelOpen ? 'Hide Filters' : 'Filters'}
        </button>
      </div>
    </header>
  )
}

export default function App() {
  const { data: globeData, isLoading } = useGlobeData()
  const { selectedId, isFilterPanelOpen } = useGlobe()

  const meteorites = globeData || []

  return (
    <div className="relative w-full h-full bg-space-900">
      {/* Full-screen globe */}
      <Globe meteorites={meteorites} isLoading={isLoading} />

      {/* Header */}
      <Header pointCount={meteorites.length} isLoading={isLoading} />

      {/* Right panel — detail or filters */}
      <div className="absolute right-4 top-14 bottom-36 z-10 w-72 flex flex-col gap-3 pointer-events-none">
        {selectedId && (
          <div className="pointer-events-auto">
            <MeteoriteDetail />
          </div>
        )}
        {isFilterPanelOpen && !selectedId && (
          <div className="pointer-events-auto flex-1 min-h-0">
            <FilterPanel />
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-slate-950/90 to-transparent">
        <Timeline />
      </div>
    </div>
  )
}
