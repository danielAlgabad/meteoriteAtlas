import { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { useT } from '../../hooks/useLanguage'

const STORAGE_KEY = 'meteorite_atlas_welcomed'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
]

export function WelcomeModal() {
  const [visible, setVisible] = useState(false)
  const language = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  const t = useT()

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

  const tips = [
    t('modal.tip1'),
    t('modal.tip2'),
    t('modal.tip3'),
    t('modal.tip4'),
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        data-testid="modal-backdrop"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md w-full mx-4 p-7 bg-slate-900/95 border border-slate-700/40 rounded-2xl shadow-2xl">
        {/* Header + language selector */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-sky-400 rounded-full flex-shrink-0" />
            <h1 className="text-lg font-bold tracking-[0.15em] text-slate-100 uppercase">
              {t('header.title')}
            </h1>
          </div>
          <div className="flex gap-1">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`
                  px-2 py-1 rounded text-[11px] font-bold tracking-wider transition-all
                  ${language === code
                    ? 'text-sky-300 bg-sky-500/15 border border-sky-500/40'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'}
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          {t('modal.description')}
        </p>

        <ul className="space-y-2.5 mb-6">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
              <span className="text-[13px] text-slate-400 leading-snug">{tip}</span>
            </li>
          ))}
        </ul>

        <div className="flex gap-4 mb-6 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
            {t('modal.legend.fell')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
            {t('modal.legend.found')}
          </span>
        </div>

        <p className="text-[11px] text-slate-600 mb-5">{t('modal.data_source')}</p>

        <button
          onClick={dismiss}
          className="
            w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide
            bg-sky-500/20 border border-sky-500/40 text-sky-300
            hover:bg-sky-500/30 hover:border-sky-500/60 transition-all
          "
        >
          {t('modal.start')}
        </button>
      </div>
    </div>
  )
}
