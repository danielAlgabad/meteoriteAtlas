import { useQuery } from '@tanstack/react-query'
import { useStore } from '../store'
import { fetchMeteorities, fetchMeteoriteById, fetchStats } from '../services/api'

export function useGlobeData() {
  const filters = useStore((s) => s.filters)

  return useQuery({
    queryKey: ['globe', filters],
    queryFn: async () => {
      // First request determines total count
      const first = await fetchMeteorities({ ...filters, page: 1, size: 500 })
      const total = Math.min(first.total || 0, 10000)
      const pageCount = Math.min(Math.ceil(total / 500), 20)

      // Fetch remaining pages in parallel
      const remaining =
        pageCount > 1
          ? await Promise.all(
              Array.from({ length: pageCount - 1 }, (_, i) =>
                fetchMeteorities({ ...filters, page: i + 2, size: 500 }).catch(() => ({
                  items: [],
                }))
              )
            )
          : []

      return [first, ...remaining]
        .flatMap((r) => r.items || [])
        .filter((m) => m.lat != null && m.lon != null)
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
