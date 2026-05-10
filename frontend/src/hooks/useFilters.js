import { useStore } from '../store'

export function useFilters() {
  const filters = useStore((s) => s.filters)
  const setFilter = useStore((s) => s.setFilter)
  const resetFilters = useStore((s) => s.resetFilters)
  return { filters, setFilter, resetFilters }
}
