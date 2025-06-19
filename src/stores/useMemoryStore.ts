import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Memory, SearchFilters } from '../types'
import { dbOperations } from '../data/database'

interface MemoryState {
  // State
  memories: Memory[]
  loading: boolean
  error: string | null
  searchFilters: SearchFilters
  selectedMemory: Memory | null

  // Actions
  loadMemories: (filters?: { archived?: boolean; tags?: string[] }) => Promise<void>
  createMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateMemory: (id: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>) => Promise<void>
  deleteMemory: (id: string) => Promise<void>
  setSelectedMemory: (memory: Memory | null) => void
  setSearchFilters: (filters: SearchFilters) => void
  clearError: () => void
}

export const useMemoryStore = create<MemoryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      memories: [],
      loading: false,
      error: null,
      searchFilters: {},
      selectedMemory: null,

      // Actions
      loadMemories: async (filters) => {
        set({ loading: true, error: null })
        try {
          const memories = await dbOperations.getMemories(filters)
          set({ memories, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load memories',
            loading: false 
          })
        }
      },

      createMemory: async (memoryData) => {
        set({ loading: true, error: null })
        try {
          await dbOperations.createMemory(memoryData)
          // Reload memories to get the updated list
          await get().loadMemories()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create memory',
            loading: false 
          })
        }
      },

      updateMemory: async (id, updates) => {
        set({ loading: true, error: null })
        try {
          await dbOperations.updateMemory(id, updates)
          // Reload memories to get the updated list
          await get().loadMemories()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update memory',
            loading: false 
          })
        }
      },

      deleteMemory: async (id) => {
        set({ loading: true, error: null })
        try {
          await dbOperations.deleteMemory(id)
          // Reload memories to get the updated list
          await get().loadMemories()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete memory',
            loading: false 
          })
        }
      },

      setSelectedMemory: (memory) => set({ selectedMemory: memory }),

      setSearchFilters: (filters) => set({ searchFilters: filters }),

      clearError: () => set({ error: null })
    }),
    {
      name: 'memory-store'
    }
  )
) 