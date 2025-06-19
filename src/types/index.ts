// Core data types for calm-recall app

export interface Memory {
  id: string
  title: string
  content: string
  tags: string[]
  category: string
  archived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  description: string
  color: string
  createdAt: Date
}

export interface SearchFilters {
  query: string
  tags: string[]
  categories: string[]
  archived: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  defaultCategory: string
  autoSave: boolean
  searchHistory: string[]
  lastBackup?: Date
}

export interface CreateMemoryForm {
  title: string
  content: string
  tags: string[]
  category: string
}

export interface UpdateMemoryForm extends Partial<CreateMemoryForm> {
  archived?: boolean
} 