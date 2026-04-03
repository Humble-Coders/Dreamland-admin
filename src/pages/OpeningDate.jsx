import { useState } from 'react'
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { CalendarDays, Loader2, AlertCircle, Check } from 'lucide-react'
import { db } from '../firebase'
import { COLLECTIONS } from '../schema'
import useHotels from '../hooks/useHotels'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

function tsToInput(ts) {
  if (!ts) return ''
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

function inputToTs(val) {
  if (!val) return null
  return Timestamp.fromDate(new Date(val))
}

function HotelDateRow({ hotel }) {
  const [opening, setOpening] = useState(tsToInput(hotel.openingDate))
  const [closing, setClosing] = useState(tsToInput(hotel.closingDate))
  const [active, setActive] = useState(hotel.status === 'active')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await updateDoc(doc(db, COLLECTIONS.hotels, hotel.id), {
        openingDate: inputToTs(opening),
        closingDate: inputToTs(closing),
        status: active ? 'active' : 'inactive',
        updatedAt: serverTimestamp(),
      })
      toast.success(`${hotel.name} updated`)
    } catch (err) {
      toast.error('Update failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-5 space-y-4">
      {/* Hotel header */}
      <div className="flex items-center gap-3 flex-wrap">
        {hotel.photos?.[0] ? (
          <img
            src={hotel.photos[0]}
            alt={hotel.name}
            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-brand-border"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
            <CalendarDays size={20} className="text-brand-muted" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-serif text-brand-gold font-semibold truncate">{hotel.name}</p>
          <p className="text-brand-muted text-xs">
            {[hotel.city, hotel.country].filter(Boolean).join(', ')}
          </p>
        </div>
        <Badge
          label={active ? 'Active' : 'Inactive'}
          variant={active ? 'active' : 'inactive'}
        />
      </div>

      {/* Date fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="form-label">Opening Date</label>
          <input
            type="date"
            className="form-input"
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Closing Date</label>
          <input
            type="date"
            className="form-input"
            value={closing}
            min={opening || undefined}
            onChange={(e) => setClosing(e.target.value)}
          />
        </div>
      </div>

      {/* Active toggle + Save */}
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            onClick={() => setActive((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              active ? 'bg-brand-gold' : 'bg-brand-border'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm text-brand-text">Hotel Active</span>
        </label>

        <Button variant="primary" size="sm" loading={saving} onClick={save}>
          <Check size={14} />
          Save
        </Button>
      </div>
    </div>
  )
}

export default function OpeningDate() {
  const { hotels, loading, error } = useHotels()

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <div className="mb-7">
        <h1 className="font-serif text-4xl font-bold text-brand-text">Opening Date Settings</h1>
        <p className="text-brand-muted mt-1">
          Set opening and closing dates for each property
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={36} className="text-brand-gold animate-spin" />
          <p className="text-brand-muted">Loading hotels…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-brand-error/10 border border-brand-error/30 rounded-xl px-5 py-4">
          <AlertCircle size={20} className="text-brand-error shrink-0" />
          <div>
            <p className="text-brand-text font-medium text-sm">Failed to load hotels</p>
            <p className="text-brand-muted text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && hotels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <CalendarDays size={40} className="text-brand-muted" />
          <p className="text-brand-text font-medium">No hotels yet</p>
          <p className="text-brand-muted text-sm">Add hotels first to manage their dates</p>
        </div>
      )}

      {!loading && !error && hotels.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {hotels.map((hotel) => (
            <HotelDateRow key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  )
}
