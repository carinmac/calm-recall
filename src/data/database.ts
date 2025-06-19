import Dexie, { type EntityTable } from 'dexie'
import type { Memory, Tag, Category, AppSettings } from '../types'

// Define the database schema
export interface CalmRecallDB {
  memories: EntityTable<Memory, 'id'>
  tags: EntityTable<Tag, 'id'>
  categories: EntityTable<Category, 'id'>
  settings: EntityTable<AppSettings & { id: string }, 'id'>
}

// Create the database instance
export const db = new Dexie('CalmRecallDB') as Dexie & CalmRecallDB

// Define the schema
db.version(1).stores({
  memories: '++id, title, content, tags, createdAt, updatedAt, archived, category',
  tags: '++id, name, color, createdAt',
  categories: '++id, name, description, color, createdAt',
  settings: '++id'
})

// Database operations
export const dbOperations = {
  // Memory operations
  async createMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date()
    return db.memories.add({
      ...memory,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    })
  },

  async getMemories(filters?: { archived?: boolean; tags?: string[] }) {
    let query = db.memories.toCollection()
    
    if (filters?.archived !== undefined) {
      query = query.filter(memory => memory.archived === filters.archived)
    }
    
    if (filters?.tags?.length) {
      query = query.filter(memory => 
        filters.tags!.some(tag => memory.tags.includes(tag))
      )
    }
    
    return query.reverse().sortBy('updatedAt')
  },

  async updateMemory(id: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>) {
    return db.memories.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  },

  async deleteMemory(id: string) {
    return db.memories.delete(id)
  },

  // Tag operations
  async createTag(tag: Omit<Tag, 'id' | 'createdAt'>) {
    return db.tags.add({
      ...tag,
      id: crypto.randomUUID(),
      createdAt: new Date()
    })
  },

  async getTags() {
    return db.tags.orderBy('name').toArray()
  },

  // Category operations
  async createCategory(category: Omit<Category, 'id' | 'createdAt'>) {
    return db.categories.add({
      ...category,
      id: crypto.randomUUID(),
      createdAt: new Date()
    })
  },

  async getCategories() {
    return db.categories.orderBy('name').toArray()
  }
} 