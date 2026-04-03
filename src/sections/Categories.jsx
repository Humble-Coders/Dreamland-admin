import { useState } from 'react'
import { addDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../schema'
import useSubCollection from '../hooks/useSubCollection'
import { Plus, Loader2 } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const PRESETS = [
  { name: 'Family-Friendly', icon: '👨‍👩‍👧' },
  { name: 'Romantic', icon: '💑' },
  { name: 'Business', icon: '💼' },
  { name: 'Eco-Friendly', icon: '🌿' },
  { name: 'Luxury', icon: '✨' },
  { name: 'Budget', icon: '💰' },
  { name: 'Adventure', icon: '🏔️' },
  { name: 'Wellness & Spa', icon: '🧘' },
  { name: 'Pet-Friendly', icon: '🐾' },
  { name: 'Beach Resort', icon: '🏖️' },
]

export default function Categories({ hotelId, data, onChange }) {
  // When hotelId exists — fetch from Firestore and write directly
  const { docs: firestoreCats, loading } = useSubCollection(COLLECTIONS.categories, hotelId)

  // When no hotelId — manage local draft array
  const localCats = data?.draftCategories || []

  const [customName, setCustomName] = useState('')
  const [saving, setSaving] = useState(null)

  // All active names (for dedup)
  const existingNames = new Set([
    ...firestoreCats.map((c) => c.name),
    ...localCats.map((c) => c.name),
  ])

  async function addCategory(name, icon = '') {
    if (existingNames.has(name)) { toast.error(`"${name}" already added`); return }
    setSaving(name)
    try {
      if (hotelId) {
        await addDoc(collection(db, COLLECTIONS.categories), {
          hotelId, name, icon, description: '', createdAt: serverTimestamp(),
        })
      } else {
        onChange({ draftCategories: [...localCats, { name, icon }] })
      }
      toast.success(`"${name}" added`)
      setCustomName('')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setSaving(null)
    }
  }

  async function removeCategory(item) {
    try {
      if (hotelId && item.id) {
        await deleteDoc(doc(db, COLLECTIONS.categories, item.id))
      } else {
        onChange({ draftCategories: localCats.filter((c) => c.name !== item.name) })
      }
      toast.success(`"${item.name}" removed`)
    } catch (err) {
      toast.error('Delete failed: ' + err.message)
    }
  }

  // Merged display list
  const allCats = [
    ...firestoreCats,
    ...localCats.map((c) => ({ ...c, _local: true })),
  ]

  return (
    <div className="space-y-5">
      {/* Active categories */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={22} className="text-brand-gold animate-spin" />
        </div>
      ) : allCats.length > 0 ? (
        <div>
          <p className="form-label mb-2">Active Categories</p>
          <div className="flex flex-wrap gap-2">
            {allCats.map((c, i) => (
              <div
                key={c.id || i}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold/10 border border-brand-gold/40 rounded-full text-sm text-brand-gold"
              >
                {c.icon && <span>{c.icon}</span>}
                <span>{c.name}</span>
                {c._local && <span className="text-[10px] text-brand-gold/50 ml-0.5">(pending)</span>}
                <button onClick={() => removeCategory(c)} className="ml-1 text-brand-gold/60 hover:text-brand-error transition-colors">×</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-brand-muted text-sm italic text-center py-2">No categories added yet</p>
      )}

      {/* Preset suggestions */}
      <div>
        <p className="form-label mb-2">Suggestions</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ name, icon }) => {
            const isAdded = existingNames.has(name)
            return (
              <button
                key={name}
                disabled={isAdded || saving === name}
                onClick={() => addCategory(name, icon)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                  isAdded
                    ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold cursor-default'
                    : 'border-brand-border text-brand-muted hover:border-brand-gold hover:text-brand-gold cursor-pointer'
                }`}
              >
                <span>{icon}</span>
                <span>{name}</span>
                {isAdded && <span className="text-xs opacity-60">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom */}
      <div>
        <p className="form-label mb-2">Add Custom Category</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Honeymoon Special"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && customName.trim() && addCategory(customName.trim())}
            wrapperClass="flex-1"
          />
          <Button variant="outline" size="md" disabled={!customName.trim()} loading={saving === customName} onClick={() => addCategory(customName.trim())}>
            <Plus size={15} /> Add
          </Button>
        </div>
      </div>

      {!hotelId && localCats.length > 0 && (
        <p className="text-brand-muted text-xs italic text-center">
          Pending items will be saved to Firebase when you save the hotel
        </p>
      )}
    </div>
  )
}
