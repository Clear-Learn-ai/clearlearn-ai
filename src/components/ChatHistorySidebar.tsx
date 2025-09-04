'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  MessageSquare,
  // MoreHorizontal,
  Edit3,
  Trash2,
  Search,
  X,
  // Calendar,
  // Filter
} from 'lucide-react'

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

interface ChatHistorySidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentChatId: string | null
  onSelectChat: (_chatId: string) => void
  onNewChat: () => void
}

export function ChatHistorySidebar({
  isOpen,
  onToggle,
  currentChatId,
  onSelectChat,
  onNewChat
}: ChatHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Mock chat sessions - replace with actual data
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Fix a Sink Drainage',
      lastMessage: 'Steps to clear a P-trap clog',
      timestamp: new Date(Date.now() - 3600000),
      messageCount: 8
    },
    {
      id: '2',
      title: 'Install a New Toilet',
      lastMessage: 'Wax ring vs waxless seal?',
      timestamp: new Date(Date.now() - 7200000),
      messageCount: 12
    },
    {
      id: '3',
      title: 'PEX Manifold Best Practices',
      lastMessage: 'Expansion vs crimp fittings',
      timestamp: new Date(Date.now() - 86400000),
      messageCount: 5
    },
    {
      id: '4',
      title: 'Diagnose Water Heater Leaks',
      lastMessage: 'T&P valve or tank seam?',
      timestamp: new Date(Date.now() - 172800000),
      messageCount: 15
    }
  ])

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedSessions = {
    today: filteredSessions.filter(s => 
      new Date(s.timestamp).toDateString() === new Date().toDateString()
    ),
    yesterday: filteredSessions.filter(s => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return new Date(s.timestamp).toDateString() === yesterday.toDateString()
    }),
    thisWeek: filteredSessions.filter(s => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const sessionDate = new Date(s.timestamp)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return sessionDate > weekAgo && sessionDate < yesterday
    }),
    older: filteredSessions.filter(s => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(s.timestamp) <= weekAgo
    })
  }

  const handleRename = (id: string, newTitle: string) => {
    setChatSessions(sessions =>
      sessions.map(s => s.id === id ? { ...s, title: newTitle } : s)
    )
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    setChatSessions(sessions => sessions.filter(s => s.id !== id))
    setShowDeleteConfirm(null)
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const renderSessionGroup = (title: string, sessions: ChatSession[]) => {
    if (sessions.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              className={`
                group relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                ${currentChatId === session.id 
                  ? 'amethyst-gradient-light border-l-4' 
                  : 'hover:bg-gray-50 border-l-4 border-transparent'
                }
              `}
              style={currentChatId === session.id ? { borderLeftColor: '#1E0F2E' } : {}}
              onClick={() => onSelectChat(session.id)}
              whileHover={{ x: 4 }}
            >
              <MessageSquare className={`
                w-4 h-4 mr-3 flex-shrink-0
                ${currentChatId === session.id ? 'text-gray-700' : 'text-gray-400'}
              `} />
              
              <div className="flex-1 min-w-0">
                {editingId === session.id ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRename(session.id, editTitle)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleRename(session.id, editTitle)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="w-full bg-transparent border-none outline-none text-sm font-medium"
                    autoFocus
                  />
                ) : (
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {session.title}
                  </div>
                )}
                <div className="text-xs text-gray-500 truncate">
                  {session.lastMessage}
                </div>
                <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                  <span>{formatTimeAgo(session.timestamp)}</span>
                  <span>•</span>
                  <span>{session.messageCount} messages</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingId(session.id)
                    setEditTitle(session.title)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Rename"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(session.id)
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <motion.button
            onClick={onNewChat}
            className="w-full flex items-center justify-center px-4 py-3 text-white rounded-xl transition-all duration-300 shadow-lg amethyst-gradient hover:opacity-90"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </motion.button>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderSessionGroup('Today', groupedSessions.today)}
          {renderSessionGroup('Yesterday', groupedSessions.yesterday)}
          {renderSessionGroup('This Week', groupedSessions.thisWeek)}
          {renderSessionGroup('Older', groupedSessions.older)}

          {filteredSessions.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No conversations found</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-xl p-6 max-w-sm w-full"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Conversation</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this conversation? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}