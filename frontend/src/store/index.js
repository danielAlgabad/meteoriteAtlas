import { create } from 'zustand'

const INITIAL_FILTERS = {
  mass_min: undefined,
  mass_max: undefined,
  year_from: undefined,
  year_to: undefined,
  fall: ['Fell', 'Found'],
  meteorite_class: undefined,
  page: 1,
  size: 500,
}

export const useStore = create((set) => ({
  filters: { ...INITIAL_FILTERS },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: 1 },
    })),
  resetFilters: () => set({ filters: { ...INITIAL_FILTERS } }),

  viewport: { lat: 0, lon: -90, radius: 76 },
  setViewport: (v) => set({ viewport: v }),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

  isFilterPanelOpen: true,
  toggleFilterPanel: () =>
    set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),

  language: localStorage.getItem('meteorite_atlas_lang') || 'en',
  setLanguage: (lang) => {
    localStorage.setItem('meteorite_atlas_lang', lang)
    set({ language: lang })
  },
}))
