import { useQuery } from '@tanstack/react-query'
import { useStore } from '../store'
import { fetchMeteorities, fetchMeteoriteById, fetchStats } from '../services/api'

// fall is stored as string[] for multi-select but the backend only accepts one value.
// If exactly one type is selected, pass it; otherwise omit the filter.
function toApiFilters(filters) {
  const { fall, ...rest } = filters
  return fall?.length === 1 ? { ...rest, fall: fall[0] } : rest
}

export function useGlobeData() {
  const filters = useStore((s) => s.filters)

  return useQuery({
    queryKey: ['globe', filters],
    queryFn: async () => {
      const apiFilters = toApiFilters(filters)

      // First request determines total count
      const first = await fetchMeteorities({ ...apiFilters, page: 1, size: 500 })
      const total = Math.min(first.total || 0, 10000)
      const pageCount = Math.min(Math.ceil(total / 500), 20)

      // Fetch remaining pages in parallel
      const remaining =
        pageCount > 1
          ? await Promise.all(
              Array.from({ length: pageCount - 1 }, (_, i) =>
                fetchMeteorities({ ...apiFilters, page: i + 2, size: 500 }).catch(() => ({
                  items: [],
                }))
              )
            )
          : []

      return [first, ...remaining]
        .flatMap((r) => r.items || [])
        .filter((m) => m.lat != null && m.lon != null)
        .filter((m) => filters.fall.length === 0 || filters.fall.includes(m.fall))
        .slice(0, 10000)
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useMeteoriteDetail(id) {
  return useQuery({
    queryKey: ['meteorite', id],
    queryFn: () => fetchMeteoriteById(id),
    enabled: id != null,
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 30,
  })
}
