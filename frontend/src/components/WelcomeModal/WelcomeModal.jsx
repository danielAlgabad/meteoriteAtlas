import { useState, useEffect } from 'react'

const STORAGE_KEY = 'meteorite_atlas_welcomed'

export function WelcomeModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        data-testid="modal-backdrop"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md w-full mx-4 p-7 bg-slate-900/95 border border-slate-700/40 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-7 bg-sky-400 rounded-full flex-shrink-0" />
          <h1 className="text-lg font-bold tracking-[0.15em] text-slate-100 uppercase">
            Meteorite Atlas
          </h1>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          Explore over <span className="text-sky-400 font-medium">45,000 meteorite impacts</span> recorded
          worldwide, visualized on an interactive 3D globe powered by NASA open data.
        </p>

        {/* How to use */}
        <ul className="space-y-2.5 mb-6">
          {[
            'Rotate and zoom the globe to navigate impact sites',
            'Click any point to see name, mass, year, class and coordinates',
            'Use the Filters panel to narrow by fall type, mass, year or class',
            'The timeline at the bottom shows the distribution of impacts by century',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
              <span className="text-[13px] text-slate-400 leading-snug">{tip}</span>
            </li>
          ))}
        </ul>

        {/* Legend */}
        <div className="flex gap-4 mb-6 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" /> Fell (observed)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" /> Found
          </span>
        </div>

        <p className="text-[11px] text-slate-600 mb-5">
          Data: NASA Meteorite Landings dataset · 860 AD – 2013 · scientific catalogue only
        </p>

        <button
          onClick={dismiss}
          className="
            w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide
            bg-sky-500/20 border border-sky-500/40 text-sky-300
            hover:bg-sky-500/30 hover:border-sky-500/60 transition-all
          "
        >
          Start Exploring
        </button>
      </div>
    </div>
  )
}
