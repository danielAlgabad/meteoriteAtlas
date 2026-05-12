import { useState, useEffect } from 'react'
import { useT } from '../../hooks/useLanguage'

const CONSENT_KEY = 'meteorite_atlas_cookie_consent'

const SECTIONS = [
  's1', 's2', 's3', 's4', 's5',
]

function PrivacyPolicyModal({ onClose }) {
  const t = useT()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-lg w-full mx-4 bg-slate-900/95 border border-slate-700/40 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800/60 flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-widest">
            {t('privacy.title')}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('privacy.close')}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-all text-base"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {SECTIONS.map((s) => (
            <div key={s}>
              <h3 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1.5">
                {t(`privacy.${s}.title`)}
              </h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                {t(`privacy.${s}.body`)}
              </p>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-slate-800/60 flex-shrink-0">
          <p className="text-[11px] text-slate-600">{t('privacy.updated')}</p>
        </div>
      </div>
    </div>
  )
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPolicy, setShowPolicy] = useState(false)
  const t = useT()

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setShowBanner(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setShowBanner(false)
  }

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setShowBanner(false)
  }

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-36 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
          <div className="
            pointer-events-auto
            w-full max-w-2xl
            flex flex-col sm:flex-row items-start sm:items-center gap-3
            bg-slate-900/95 backdrop-blur-md
            border border-slate-700/40 rounded-xl
            px-4 py-3 shadow-2xl
          ">
            <p className="flex-1 text-[12px] text-slate-400 leading-snug">
              {t('cookie.text')}{' '}
              <button
                onClick={() => setShowPolicy(true)}
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
              >
                {t('cookie.privacy_link')}
              </button>
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={decline}
                className="px-3 py-1.5 rounded text-[11px] font-medium border border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-all"
              >
                {t('cookie.decline')}
              </button>
              <button
                onClick={accept}
                className="px-3 py-1.5 rounded text-[11px] font-medium bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 transition-all"
              >
                {t('cookie.accept')}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showBanner && (
        <button
          onClick={() => setShowPolicy(true)}
          className="fixed bottom-2 right-3 z-20 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
        >
          {t('cookie.privacy_link')}
        </button>
      )}

      {showPolicy && <PrivacyPolicyModal onClose={() => setShowPolicy(false)} />}
    </>
  )
}
