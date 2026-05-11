import { useStore } from '../store'
import { en } from '../locales/en'
import { es } from '../locales/es'

const LOCALES = { en, es }

export function useT() {
  const language = useStore((s) => s.language)
  const locale = LOCALES[language] ?? en

  return (key, vars = {}) => {
    const str = locale[key] ?? en[key] ?? key
    return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`))
  }
}
