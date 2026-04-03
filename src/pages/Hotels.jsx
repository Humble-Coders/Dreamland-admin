import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, SlidersHorizontal, AlertCircle, Loader2 } from 'lucide-react'
import useHotels from '../hooks/useHotels'
import HotelCard from '../components/HotelCard'

const TYPE_OPTIONS = ['All Types', 'resort', 'boutique', 'hostel', 'villa', 'homestay']
const RATING_OPTIONS = [
  { label: 'All Ratings', value: '' },
  { label: '5 Stars', value: '5' },
  { label: '4+ Stars', value: '4' },
  { label: '3+ Stars', value: '3' },
]

export default function Hotels() {
  const navigate = useNavigate()
  const { hotels, loading, error } = useHotels()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [ratingFilter, setRatingFilter] = useState('')

  const filtered = hotels.filter((h) => {
    if (h.status === 'draft') return false  // drafts live on Add Hotel page only

    const matchSearch =
      !search ||
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase()) ||
      h.country?.toLowerCase().includes(search.toLowerCase())

    const matchType = typeFilter === 'All Types' || h.hotelType === typeFilter
    const matchRating = !ratingFilter || (h.starRating ?? 0) >= Number(ratingFilter)

    return matchSearch && matchType && matchRating
  })

  return (
    <div className="p-6 lg:p-8 min-h-full">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-serif text-4xl font-bold text-brand-text">All Hotels</h1>
        <p className="text-brand-muted mt-1">Manage your luxury properties</p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
          />
          <input
            className="form-input pl-9 w-full"
            placeholder="Search hotels by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <SlidersHorizontal
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
          />
          <select
            className="form-input pl-9 pr-8 appearance-none cursor-pointer min-w-[140px]"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t} className="bg-brand-surface">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Rating filter */}
        <div className="relative">
          <select
            className="form-input pr-8 appearance-none cursor-pointer min-w-[140px]"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            {RATING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-brand-surface">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={36} className="text-brand-gold animate-spin" />
          <p className="text-brand-muted">Loading hotels…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-brand-error/10 border border-brand-error/30 rounded-xl px-5 py-4 mb-6">
          <AlertCircle size={20} className="text-brand-error shrink-0" />
          <div>
            <p className="text-brand-text font-medium text-sm">Failed to load hotels</p>
            <p className="text-brand-muted text-xs mt-0.5">{error}</p>
            <p className="text-brand-muted text-xs mt-1">
              Make sure you have added your Firebase credentials to <code className="text-brand-gold">src/firebase.js</code>
            </p>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-card border border-brand-border flex items-center justify-center">
            <Search size={28} className="text-brand-muted" />
          </div>
          <div>
            <p className="text-brand-text font-medium">No hotels found</p>
            <p className="text-brand-muted text-sm mt-1">
              {hotels.length === 0
                ? 'Add your first hotel to get started'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
          {hotels.length === 0 && (
            <button
              onClick={() => navigate('/add-hotel')}
              className="mt-2 px-5 py-2.5 bg-brand-gold text-brand-bg rounded-lg text-sm font-medium hover:bg-brand-gold-light transition-colors"
            >
              + Add First Hotel
            </button>
          )}
        </div>
      )}

      {/* Hotel grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onEdit={() => navigate(`/add-hotel?id=${hotel.id}`)}
              onView={() => navigate(`/hotels/${hotel.id}`)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/add-hotel')}
        title="Add Hotel"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-brand-gold text-brand-bg
                   shadow-gold hover:bg-brand-gold-light hover:scale-105
                   transition-all duration-200 flex items-center justify-center z-20"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
