import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../schema'
import useHotel from '../hooks/useHotel'
import useSubCollection from '../hooks/useSubCollection'
import {
  Plus, Trash2, Loader2, BedDouble, Users, IndianRupee,
  ArrowLeft, CheckCircle2, Circle, Pencil,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import RoomDialog from '../components/RoomDialog'
import toast from 'react-hot-toast'

const BED_LABELS = { single: 'Single', twin: 'Twin', double: 'Double', queen: 'Queen', king: 'King', bunk: 'Bunk' }

export default function RoomCategories() {
  const { hotelId } = useParams()
  const navigate = useNavigate()
  const { hotel, loading: hotelLoading } = useHotel(hotelId)
  const { docs: rooms, loading: roomsLoading } = useSubCollection(COLLECTIONS.rooms, hotelId)

  // dialog state: null = closed, 'new' = adding, room object = editing
  const [dialogRoom, setDialogRoom] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function handleDelete(e, room) {
    e.stopPropagation()
    if (!window.confirm(`Delete "${room.name}"? This cannot be undone.`)) return
    setDeletingId(room.id)
    try {
      await deleteDoc(doc(db, COLLECTIONS.rooms, room.id))
      toast.success('Room category deleted')
    } catch (err) {
      toast.error('Delete failed: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const loading = hotelLoading || roomsLoading

  return (
    <div className="flex h-full min-h-screen">
      {/* ── Left side nav — sits right alongside the main sidebar ── */}
      <aside className="hidden lg:flex w-52 shrink-0 flex-col border-r border-brand-border bg-brand-surface">
        <div className="p-4 border-b border-brand-border">
          <button
            onClick={() => navigate(`/add-hotel?id=${hotelId}`)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-brand-muted hover:text-brand-gold hover:bg-brand-card border border-transparent hover:border-brand-border text-sm font-medium transition-all text-left"
          >
            <ArrowLeft size={14} className="shrink-0" />
            <span className="truncate">{hotel?.name || 'Back to Hotel'}</span>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <p className="text-brand-muted text-xs uppercase tracking-wider mb-1">Total Rooms</p>
            {loading ? (
              <Loader2 size={16} className="text-brand-gold animate-spin" />
            ) : (
              <p className="font-serif text-brand-gold text-3xl font-bold leading-none">{rooms.length}</p>
            )}
          </div>

          <button
            onClick={() => setDialogRoom('new')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-brand-gold text-brand-bg text-sm font-medium hover:bg-brand-gold-light transition-colors"
          >
            <Plus size={14} /> Add Room
          </button>
        </div>

      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Mobile back button */}
        <button
          onClick={() => navigate(`/add-hotel?id=${hotelId}`)}
          className="lg:hidden text-brand-muted hover:text-brand-gold text-sm font-medium flex items-center gap-1.5 mb-4 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-card border border-transparent hover:border-brand-border"
        >
          <ArrowLeft size={14} /> Back to hotel
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-brand-text">Room Categories</h1>
            {hotel && <p className="text-brand-muted mt-1 text-sm">{hotel.name}</p>}
          </div>
          <button
            onClick={() => setDialogRoom('new')}
            className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-brand-bg rounded-xl text-sm font-medium hover:bg-brand-gold-light transition-colors"
          >
            <Plus size={15} /> Add Room Category
          </button>
        </div>

        {rooms.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setDialogRoom(room)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-border bg-brand-card text-brand-muted hover:border-brand-gold hover:text-brand-gold text-xs transition-colors"
              >
                <BedDouble size={11} />
                {room.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={30} className="text-brand-gold animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-4">
              <BedDouble size={28} className="text-brand-gold" />
            </div>
            <h2 className="font-serif text-brand-text text-xl font-semibold mb-2">No room categories yet</h2>
            <p className="text-brand-muted text-sm mb-6 max-w-xs">
              Add room types like Deluxe, Suite, or Standard to define what guests can book.
            </p>
            <button
              onClick={() => setDialogRoom('new')}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-brand-bg rounded-xl text-sm font-medium hover:bg-brand-gold-light transition-colors"
            >
              <Plus size={15} /> Add First Room Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const hasFull = room.bedType && room.amenities?.length > 0
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setDialogRoom(room)}
                  className="section-card text-left flex flex-col gap-3"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center shrink-0">
                        <BedDouble size={17} className="text-brand-gold" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-brand-text font-medium text-sm truncate">{room.name}</p>
                        <p className="text-brand-muted text-xs mt-0.5 flex items-center gap-2 flex-wrap">
                          {room.capacity > 0 && (
                            <span className="flex items-center gap-1"><Users size={10} /> {room.capacity} guests</span>
                          )}
                          {room.price > 0 && (
                            <span className="flex items-center gap-1"><IndianRupee size={10} /> {room.price.toLocaleString('en-IN')}/night</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {hasFull ? (
                      <CheckCircle2 size={18} className="text-brand-success shrink-0" />
                    ) : (
                      <Circle size={18} className="text-brand-border shrink-0" />
                    )}
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {room.bedType && <Badge label={BED_LABELS[room.bedType] || room.bedType} variant="default" />}
                      {room.view && <Badge label={room.view} variant="draft" />}
                    </div>
                    <div className="flex items-center gap-1">
                      {room.amenities?.length > 0 && (
                        <span className="text-brand-muted text-xs">{room.amenities.length} amenities</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, room)}
                        disabled={deletingId === room.id}
                        className="ml-1 p-1 text-brand-muted hover:text-brand-error rounded transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deletingId === room.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                </button>
              )
            })}

            {/* Add new card */}
            <button
              type="button"
              onClick={() => setDialogRoom('new')}
              className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-brand-border hover:border-brand-gold text-brand-muted hover:text-brand-gold transition-all duration-150"
            >
              <Plus size={22} />
              <span className="text-sm font-medium">Add Room Category</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Dialog ───────────────────────────────────────────────── */}
      {dialogRoom !== null && (
        <RoomDialog
          hotelId={hotelId}
          room={dialogRoom === 'new' ? null : dialogRoom}
          onClose={() => setDialogRoom(null)}
        />
      )}
    </div>
  )
}
