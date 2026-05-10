import { useStore } from '../store'

export function useGlobe() {
  const selectedId = useStore((s) => s.selectedId)
  const setSelectedId = useStore((s) => s.setSelectedId)
  const isFilterPanelOpen = useStore((s) => s.isFilterPanelOpen)
  const toggleFilterPanel = useStore((s) => s.toggleFilterPanel)
  return { selectedId, setSelectedId, isFilterPanelOpen, toggleFilterPanel }
}
