import { useState } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../schema'
import {
  X, Hash, Save, Loader2, RotateCcw, Pencil,
  Wifi, Wind, Tv, BedDouble,
} from 'lucide-react'
import Button from './ui/Button'
import toast from 'react-hot-toast'

// ─── Override row ─────────────────────────────────────────────────────────────

function OverrideRow({ label, typeValue, isOverriding, onToggle, children }) {
  return (
    <div className={`rounded-xl border transition-colors ${isOverriding ? 'border-brand-gold/40 bg-brand-gold/5' : 'border-brand-border bg-brand-bg'}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-brand-text text-sm font-medium">{label}</p>
          {!isOverriding && (
            <span className="text-brand-muted text-xs bg-brand-card border border-brand-border px-2 py-0.5 rounded-full shrink-0">
              {typeValue}
            </span>
          )}
          {isOverriding && (
            <span className="text-brand-gold text-xs bg-brand-gold/10 border border-brand-gold/30 px-2 py-0.5 rounded-full font-medium shrink-0">
              overridden
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          title={isOverriding ? 'Reset to type default' : 'Override for this room'}
          className={`shrink-0 ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
            isOverriding
              ? 'border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10'
              : 'border-brand-border text-brand-muted hover:border-brand-gold hover:text-brand-gold'
          }`}
        >
          {isOverriding ? <><RotateCcw size={11} /> Reset</> : <><Pencil size={11} /> Override</>}
        </button>
      </div>
      {isOverriding && (
        <div className="px-4 pb-4 pt-1 border-t border-brand-gold/20">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Tag input (inline) ───────────────────────────────────────────────────────

function TagInput({ value = [], onChange, suggestions = [] }) {
  const [input, setInput] = useState('')
  function add(tag) {
    const t = tag.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setInput('')
  }
  return (
    <div className="space-y-2 mt-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-brand-gold text-xs">
              {t}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="hover:opacity-70"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="form-input flex-1 text-sm"
          placeholder="Type and press Enter…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(input) } }}
        />
        <button type="button" disabled={!input.trim()} onClick={() => add(input)}
          className="shrink-0 px-3 py-2 bg-brand-gold text-brand-bg rounded-lg text-xs font-medium hover:bg-brand-gold-light disabled:opacity-40 transition-colors">
          Add
        </button>
      </div>
      {suggestions.filter((s) => !value.includes(s)).length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {suggestions.filter((s) => !value.includes(s)).slice(0, 8).map((s) => (
            <button key={s} type="button" onClick={() => add(s)}
              className="px-2 py-0.5 rounded-full border border-brand-border text-brand-muted hover:border-brand-gold hover:text-brand-gold text-xs transition-colors">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Toggle (inline) ──────────────────────────────────────────────────────────

function SmallToggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between mt-2">
      <span className="text-brand-muted text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-gold' : 'bg-brand-border'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

const AMENITY_SUGGESTIONS = [
  'Air Conditioning', 'Free WiFi', 'Smart TV', 'Mini Bar', 'In-Room Safe',
  'Hair Dryer', 'Bathrobe & Slippers', 'Iron & Board', 'Coffee Maker',
  'Work Desk', 'Balcony', 'Private Pool', 'Jacuzzi', 'Rainfall Shower',
  'Blackout Curtains', 'Room Service', 'Daily Housekeeping',
]

// ─── Main Dialog ──────────────────────────────────────────────────────────────

/**
 * props:
 *   instance   { id, roomNumber, categoryId, hotelId, overrides: {} }
 *   category   { id, name, amenities, smokingAllowed, available, floor, notes }
 *   onClose    () => void
 */
export default function RoomInstanceDialog({ instance, category, onClose }) {
  const overrides = instance.overrides || {}

  // Track which fields are being overridden and their values
  const [amenitiesOn, setAmenitiesOn] = useState('amenities' in overrides)
  const [amenities, setAmenities] = useState(overrides.amenities ?? category.amenities ?? [])

  const [smokingOn, setSmokingOn] = useState('smokingAllowed' in overrides)
  const [smoking, setSmoking] = useState(overrides.smokingAllowed ?? category.smokingAllowed ?? false)

  const [availableOn, setAvailableOn] = useState('available' in overrides)
  const [available, setAvailable] = useState(overrides.available ?? category.available ?? true)

  const [floorOn, setFloorOn] = useState('floor' in overrides)
  const [floor, setFloor] = useState(overrides.floor ?? category.floor ?? '')

  const [notesOn, setNotesOn] = useState('notes' in overrides)
  const [notes, setNotes] = useState(overrides.notes ?? '')

  const [saving, setSaving] = useState(false)

  // Count active overrides
  const overrideCount = [amenitiesOn, smokingOn, availableOn, floorOn, notesOn].filter(Boolean).length

  async function handleSave() {
    setSaving(true)
    try {
      const newOverrides = {}
      if (amenitiesOn) newOverrides.amenities = amenities
      if (smokingOn) newOverrides.smokingAllowed = smoking
      if (availableOn) newOverrides.available = available
      if (floorOn) newOverrides.floor = floor
      if (notesOn) newOverrides.notes = notes

      await updateDoc(doc(db, COLLECTIONS.roomInstances, instance.id), {
        overrides: newOverrides,
      })
      toast.success(`Room ${instance.roomNumber} updated`)
      onClose()
    } catch (err) {
      toast.error('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function resetAll() {
    setAmenitiesOn(false); setAmenities(category.amenities ?? [])
    setSmokingOn(false); setSmoking(category.smokingAllowed ?? false)
    setAvailableOn(false); setAvailable(category.available ?? true)
    setFloorOn(false); setFloor(category.floor ?? '')
    setNotesOn(false); setNotes('')
  }

  return (
    <div className="dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog-box">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center shrink-0">
              <span className="font-mono text-brand-gold font-bold text-sm">{instance.roomNumber}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-brand-gold text-xl font-semibold leading-tight">
                  Room {instance.roomNumber}
                </h2>
                {overrideCount > 0 && (
                  <span className="text-xs bg-brand-gold/10 border border-brand-gold/30 text-brand-gold px-2 py-0.5 rounded-full font-medium">
                    {overrideCount} override{overrideCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-brand-muted text-xs flex items-center gap-1.5">
                <BedDouble size={11} />
                {category.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {overrideCount > 0 && (
              <button
                onClick={resetAll}
                className="text-brand-muted hover:text-brand-error text-xs flex items-center gap-1 transition-colors"
                title="Reset all overrides"
              >
                <RotateCcw size={12} /> Reset all
              </button>
            )}
            <button onClick={onClose} className="text-brand-muted hover:text-brand-text p-1.5 rounded-lg hover:bg-brand-card transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-brand-muted text-xs pb-1">
            Toggle <span className="text-brand-text font-medium">Override</span> on any field to customise it for this specific room. All other settings are inherited from the <span className="text-brand-text font-medium">{category.name}</span> type.
          </p>

          {/* Amenities */}
          <OverrideRow
            label="Amenities"
            typeValue={`${(category.amenities || []).length} amenities from type`}
            isOverriding={amenitiesOn}
            onToggle={() => {
              if (amenitiesOn) { setAmenitiesOn(false); setAmenities(category.amenities ?? []) }
              else { setAmenitiesOn(true); setAmenities([...(category.amenities ?? [])]) }
            }}
          >
            <TagInput
              value={amenities}
              onChange={setAmenities}
              suggestions={AMENITY_SUGGESTIONS}
            />
          </OverrideRow>

          {/* Smoking */}
          <OverrideRow
            label="Smoking Allowed"
            typeValue={category.smokingAllowed ? 'Yes (from type)' : 'No (from type)'}
            isOverriding={smokingOn}
            onToggle={() => {
              if (smokingOn) { setSmokingOn(false); setSmoking(category.smokingAllowed ?? false) }
              else { setSmokingOn(true) }
            }}
          >
            <SmallToggle checked={smoking} onChange={setSmoking} label={smoking ? 'Smoking allowed in this room' : 'Smoking not allowed in this room'} />
          </OverrideRow>

          {/* Availability */}
          <OverrideRow
            label="Availability"
            typeValue={category.available !== false ? 'Available (from type)' : 'Unavailable (from type)'}
            isOverriding={availableOn}
            onToggle={() => {
              if (availableOn) { setAvailableOn(false); setAvailable(category.available ?? true) }
              else { setAvailableOn(true) }
            }}
          >
            <SmallToggle checked={available} onChange={setAvailable} label={available ? 'This room is available for booking' : 'This room is not available'} />
          </OverrideRow>

          {/* Floor */}
          <OverrideRow
            label="Floor"
            typeValue={category.floor || 'Not set (from type)'}
            isOverriding={floorOn}
            onToggle={() => {
              if (floorOn) { setFloorOn(false); setFloor(category.floor ?? '') }
              else { setFloorOn(true) }
            }}
          >
            <input
              className="form-input mt-2 text-sm w-full"
              placeholder="e.g. 3rd floor, Ground floor"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </OverrideRow>

          {/* Notes */}
          <OverrideRow
            label="Room Notes"
            typeValue="No notes"
            isOverriding={notesOn}
            onToggle={() => { setNotesOn((v) => !v) }}
          >
            <textarea
              className="form-input mt-2 text-sm w-full resize-none"
              rows={3}
              placeholder="Internal notes for this specific room…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </OverrideRow>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border sticky bottom-0 bg-brand-surface">
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text text-sm transition-colors">
            Cancel
          </button>
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            <Save size={15} />
            Save Room
          </Button>
        </div>
      </div>
    </div>
  )
}
