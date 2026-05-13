import { useStore } from '../store'
import { en } from '../locales/en'
import { es } from '../locales/es'

const LOCALES = { en, es }

export function useT() {
  const language = useStore((s) => s.language)
  const locale = LOCALES[language] ?? en

  return (key, vars = {}) => {
    const val = locale[key] ?? en[key] ?? key
    if (typeof val === 'function') return val(vars)
    return val.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`))
  }
}
