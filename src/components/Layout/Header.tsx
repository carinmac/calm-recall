import { motion } from 'framer-motion'

interface HeaderProps {
  title?: string
  showSearch?: boolean
  onSearchChange?: (query: string) => void
}

export function Header({ 
  title = "Calm Recall", 
  showSearch = false, 
  onSearchChange 
}: HeaderProps) {
  return (
    <motion.header 
      className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-4 sticky top-0 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
            🧠
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </motion.div>
        
        {showSearch && (
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search your memories..."
                className="w-80 px-5 py-3 pl-12 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all duration-300 placeholder:text-gray-400"
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                🔍
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
} 