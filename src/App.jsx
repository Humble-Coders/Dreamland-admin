import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Hotels from './pages/Hotels'
import AddHotel from './pages/AddHotel'
import OpeningDate from './pages/OpeningDate'
import RoomCategories from './pages/RoomCategories'
import HotelDetail from './pages/HotelDetail'
import AppSettings from './pages/AppSettings'
import { useState, useCallback } from 'react'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const openSidebar = useCallback(() => setSidebarOpen(true), [])

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-brand-border bg-brand-surface shrink-0">
          <button
            onClick={openSidebar}
            className="text-brand-gold p-1.5 rounded-lg hover:bg-brand-card transition-colors"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="font-serif text-brand-gold font-semibold text-lg">Dreamland</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/hotels" replace />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/add-hotel" element={<AddHotel />} />
            <Route path="/opening-date" element={<OpeningDate />} />
            <Route path="/add-hotel/rooms/:hotelId" element={<RoomCategories />} />
            <Route path="/hotels/:hotelId" element={<HotelDetail />} />
            <Route path="/app-settings" element={<AppSettings />} />
            <Route path="*" element={<Navigate to="/hotels" replace />} />
          </Routes>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#163220',
            color: '#f0ead6',
            border: '1px solid #1e4a2a',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#c9a84c', secondary: '#163220' } },
          error: { iconTheme: { primary: '#e05555', secondary: '#163220' } },
        }}
      />
    </div>
  )
}
