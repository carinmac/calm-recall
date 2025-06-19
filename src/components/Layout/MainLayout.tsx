import React from 'react'
import { Header } from './Header'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  showSearch?: boolean
  onSearchChange?: (query: string) => void
}

export function MainLayout({ 
  children, 
  title, 
  showSearch, 
  onSearchChange 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={title}
        showSearch={showSearch}
        onSearchChange={onSearchChange}
      />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
} 