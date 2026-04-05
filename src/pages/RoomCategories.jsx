import { useState, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  deleteDoc, doc, addDoc, collection, serverTimestamp, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../schema'
import useHotel from '../hooks/useHotel'
import useSubCollection from '../hooks/useSubCollection'
import {
  Plus, Trash2, Loader2, BedDouble, Users, IndianRupee,
  ArrowLeft, CheckCircle2, Circle, Pencil, Hash, X, ChevronDown, ChevronUp,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import RoomDialog from '../components/RoomDialog'
import RoomInstanceDialog from '../components/RoomInstanceDialog'
import toast from 'react-hot-toast'

const BED_LABELS = { single: 'Single', twin: 'Twin', double: 'Double', queen: 'Queen', king: 'King', bunk: 'Bunk' }

// ─── Inline "Add Room Numbers" panel ─────────────────────────────────────────

function AddRoomNumbersInline({ category, hotelId, existingNumbers, onDone }) {
  const [input, setInput] = useState('')
  const [pending, setPending] = useState([])
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  function parseAndAdd(val) {
    const trimmed = val.trim()
    if (!trimmed) return

    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
    if (rangeMatch) {
      const from = parseInt(rangeMatch[1], 10)
      const to = parseInt(rangeMatch[2], 10)
      if (from > to) { toast.error('Start must be ≤ end'); return }
      if (to - from > 99) { toast.error('Max 100 per range'); return }
      const nums = []
      for (let i = from; i <= to; i++) {
        const s = String(i)
        if (!existingNumbers.includes(s) && !pending.includes(s)) nums.push(s)
      }
      setPending((p) => [...p, ...nums])
    } else {
      const parts = trimmed.split(',').map((s) => s.trim()).filter(Boolean)
      const newNums = parts.filter((n) => n && !existingNumbers.includes(n) && !pending.includes(n))
      setPending((p) => [...p, ...newNums])
    }
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function handleSave() {
    if (!pending.length) return
    setSaving(true)
    try {
      const batch = writeBatch(db)
      for (const roomNumber of pending) {
        const ref = doc(collection(db, COLLECTIONS.roomInstances))
        batch.set(ref, {
          hotelId,
          categoryId: category.id,
          roomNumber,
          overrides: {},
          createdAt: serverTimestamp(),
        })
      }
      await batch.commit()
      toast.success(`${pending.length} room${pending.length > 1 ? 's' : ''} added`)
      onDone()
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3 p-3 bg-brand-bg border border-brand-gold/30 rounded-xl space-y-3">
      <p className="text-brand-muted text-xs">Enter single numbers, ranges (<code className="text-brand-gold">101-110</code>), or comma-separated.</p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          className="form-input flex-1 text-sm"
          placeholder="e.g. 101  or  101-110"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); parseAndAdd(input) } }}
          autoFocus
        />
        <button
          type="button"
          onClick={() => parseAndAdd(input)}
          disabled={!input.trim()}
          className="shrink-0 px-3 py-2 bg-brand-gold text-brand-bg rounded-lg text-xs font-medium hover:bg-brand-gold-light disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {pending.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pending.map((n) => (
            <span key={n} className="flex items-center gap-1 px-2 py-0.5 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-brand-gold text-xs font-medium">
              <Hash size={9} />
              {n}
              <button type="button" onClick={() => setPending((p) => p.filter((x) => x !== n))} className="hover:opacity-70">
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <button type="button" onClick={onDone} className="text-brand-muted text-xs hover:text-brand-text transition-colors">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !pending.length}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold text-brand-bg rounded-lg text-xs font-medium hover:bg-brand-gold-light disabled:opacity-40"
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : null}
          Save {pending.length > 0 ? `${pending.length} Room${pending.length > 1 ? 's' : ''}` : ''}
        </button>
      </div>
    </div>
  )
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({ room, instances, hotelId, onEdit, onDelete, deletingId }) {
  const [expanded, setExpanded] = useState(false)
  const [addingRooms, setAddingRooms] = useState(false)
  const [instanceDialog, setInstanceDialog] = useState(null) // { instance, category }
  const hasFull = room.bedType && room.amenities?.length > 0
  const existingNumbers = instances.map((i) => i.roomNumber)

  // Sort instances naturally (room 9 before room 10)
  const sortedInstances = [...instances].sort((a, b) =>
    a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
  )

  return (
    <>
      <div className="section-card flex flex-col gap-0 p-0 overflow-hidden">
        {/* Card header — click to edit the category type */}
        <div className="flex flex-col gap-3 p-4">
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
            <div className="flex items-center gap-1 shrink-0">
              {hasFull ? (
                <CheckCircle2 size={16} className="text-brand-success" />
              ) : (
                <Circle size={16} className="text-brand-border" />
              )}
              <button
                type="button"
                onClick={() => onEdit(room)}
                className="p-1.5 text-brand-muted hover:text-brand-gold rounded-lg hover:bg-brand-card transition-colors"
                title="Edit room type"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={(e) => onDelete(e, room)}
                disabled={deletingId === room.id}
                className="p-1.5 text-brand-muted hover:text-brand-error rounded-lg hover:bg-brand-card transition-colors disabled:opacity-40"
                title="Delete room type"
              >
                {deletingId === room.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            {room.bedType && <Badge label={BED_LABELS[room.bedType] || room.bedType} variant="default" />}
            {room.view && <Badge label={room.view} variant="draft" />}
            {room.amenities?.length > 0 && (
              <span className="text-brand-muted text-xs">{room.amenities.length} amenities</span>
            )}
          </div>
        </div>

        {/* Room instances section */}
        <div className="border-t border-brand-border bg-brand-bg/50">
          {/* Toggle row */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-brand-card transition-colors"
          >
            <div className="flex items-center gap-2">
              <Hash size={13} className="text-brand-muted" />
              <span className="text-brand-muted text-xs font-medium">
                {instances.length === 0
                  ? 'No rooms assigned'
                  : `${instances.length} room${instances.length > 1 ? 's' : ''}`}
              </span>
              {instances.length > 0 && (
                <span className="text-brand-muted text-xs">
                  {existingNumbers.slice(0, 3).join(', ')}{instances.length > 3 ? ` +${instances.length - 3} more` : ''}
                </span>
              )}
            </div>
            {expanded ? (
              <ChevronUp size={14} className="text-brand-muted" />
            ) : (
              <ChevronDown size={14} className="text-brand-muted" />
            )}
          </button>

          {/* Expanded panel */}
          {expanded && (
            <div className="px-4 pb-4 space-y-3">
              {/* Chips */}
              {sortedInstances.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sortedInstances.map((inst) => {
                    const hasOverrides = Object.keys(inst.overrides || {}).length > 0
                    return (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => setInstanceDialog({ instance: inst, category: room })}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${
                          hasOverrides
                            ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold hover:bg-brand-gold/20'
                            : 'bg-brand-card border-brand-border text-brand-muted hover:border-brand-gold hover:text-brand-gold'
                        }`}
                        title={hasOverrides ? 'Has custom overrides — click to edit' : 'Click to customise this room'}
                      >
                        <Hash size={9} />
                        {inst.roomNumber}
                        {hasOverrides && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold ml-0.5" />}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Add rooms inline form or button */}
              {addingRooms ? (
                <AddRoomNumbersInline
                  category={room}
                  hotelId={hotelId}
                  existingNumbers={existingNumbers}
                  onDone={() => setAddingRooms(false)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingRooms(true)}
                  className="flex items-center gap-1.5 text-brand-muted hover:text-brand-gold text-xs transition-colors py-1"
                >
                  <Plus size={12} />
                  Add room numbers
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instance edit dialog */}
      {instanceDialog && (
        <RoomInstanceDialog
          instance={instanceDialog.instance}
          category={instanceDialog.category}
          onClose={() => setInstanceDialog(null)}
        />
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RoomCategories() {
  const { hotelId } = useParams()
  const navigate = useNavigate()
  const { hotel, loading: hotelLoading } = useHotel(hotelId)
  const { docs: rooms, loading: roomsLoading } = useSubCollection(COLLECTIONS.rooms, hotelId)
  const { docs: allInstances, loading: instancesLoading } = useSubCollection(COLLECTIONS.roomInstances, hotelId)

  const [dialogRoom, setDialogRoom] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  // Group instances by categoryId
  const instancesByCategory = useMemo(() => {
    const map = {}
    for (const inst of allInstances) {
      if (!map[inst.categoryId]) map[inst.categoryId] = []
      map[inst.categoryId].push(inst)
    }
    return map
  }, [allInstances])

  const totalRoomInstances = allInstances.length

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
      {/* ── Left side nav ─────────────────────────────────────────── */}
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

        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <p className="text-brand-muted text-xs uppercase tracking-wider">Room Types</p>
            {loading ? (
              <Loader2 size={16} className="text-brand-gold animate-spin" />
            ) : (
              <p className="font-serif text-brand-gold text-3xl font-bold leading-none">{rooms.length}</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-brand-muted text-xs uppercase tracking-wider">Total Rooms</p>
            {instancesLoading ? (
              <Loader2 size={16} className="text-brand-gold animate-spin" />
            ) : (
              <p className="font-serif text-brand-gold text-3xl font-bold leading-none">{totalRoomInstances}</p>
            )}
          </div>

          <button
            onClick={() => setDialogRoom('new')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-brand-gold text-brand-bg text-sm font-medium hover:bg-brand-gold-light transition-colors"
          >
            <Plus size={14} /> Add Room Type
          </button>
        </div>

        {/* Quick jump */}
        {rooms.length > 0 && (
          <div className="px-3 space-y-1 mt-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setDialogRoom(room)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-brand-muted hover:text-brand-gold hover:bg-brand-card text-xs transition-colors text-left"
              >
                <BedDouble size={11} className="shrink-0" />
                <span className="truncate">{room.name}</span>
                {(instancesByCategory[room.id] || []).length > 0 && (
                  <span className="ml-auto text-brand-gold/60 text-xs shrink-0">
                    {(instancesByCategory[room.id] || []).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Mobile back */}
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
            <Plus size={15} /> Add Room Type
          </button>
        </div>

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
            {rooms.map((room) => (
              <CategoryCard
                key={room.id}
                room={room}
                instances={instancesByCategory[room.id] || []}
                hotelId={hotelId}
                onEdit={setDialogRoom}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}

            {/* Add new card */}
            <button
              type="button"
              onClick={() => setDialogRoom('new')}
              className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-brand-border hover:border-brand-gold text-brand-muted hover:text-brand-gold transition-all duration-150 min-h-[160px]"
            >
              <Plus size={22} />
              <span className="text-sm font-medium">Add Room Type</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Room Type Dialog ──────────────────────────────────────── */}
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
