import { useState } from 'react'
import { addDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../schema'
import useSubCollection from '../hooks/useSubCollection'
import { Plus, Trash2, Loader2, Camera } from 'lucide-react'
import Input from '../components/ui/Input'
import RefComboSelect from '../components/ui/RefComboSelect'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import toast from 'react-hot-toast'

const ATTRACTION_CATEGORY_SEEDS = ['religious', 'nature', 'shopping', 'food', 'heritage', 'adventure']
const CATEGORY_COLORS = {
  religious: 'gold', nature: 'complete', shopping: 'partial',
  food: 'gold', heritage: 'draft', adventure: 'inactive',
}
// form tracks categoryId (reference) + category (name, for display & storage)
const empty = () => ({ name: '', categoryId: '', category: '', description: '', pictureable: false, media: '' })

export default function Attractions({ hotelId, data, onChange }) {
  const { docs: firestoreAttractions, loading } = useSubCollection(COLLECTIONS.attractions, hotelId)
  const localAttractions = data?.draftAttractions || []

  const [form, setForm] = useState(empty())
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!form.name || !form.categoryId) { toast.error('Name and category are required'); return }
    setSaving(true)
    try {
      if (hotelId) {
        await addDoc(collection(db, COLLECTIONS.attractions), {
          hotelId,
          name: form.name,
          categoryId: form.categoryId,   // reference to attractionCategories
          category: form.category,        // denormalised name for display
          description: form.description,
          pictureable: form.pictureable,
          media: form.media || null,
          createdAt: serverTimestamp(),
        })
      } else {
        onChange({ draftAttractions: [...localAttractions, { ...form }] })
      }
      setForm(empty()); setShowForm(false)
      toast.success('Attraction added')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item, localIdx) {
    try {
      if (hotelId && item.id) {
        await deleteDoc(doc(db, COLLECTIONS.attractions, item.id))
      } else {
        onChange({ draftAttractions: localAttractions.filter((_, i) => i !== localIdx) })
      }
      toast.success('Removed')
    } catch (err) {
      toast.error('Delete failed: ' + err.message)
    }
  }

  const allAttractions = [
    ...firestoreAttractions,
    ...localAttractions.map((a, i) => ({ ...a, _local: true, _localIdx: i })),
  ]

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 size={24} className="text-brand-gold animate-spin" /></div>
      ) : allAttractions.length === 0 && !showForm ? (
        <p className="text-brand-muted text-sm text-center py-4 italic">No attractions added yet</p>
      ) : (
        <div className="space-y-2">
          {allAttractions.map((a, i) => (
            <div key={a.id || i} className="flex items-start justify-between gap-3 bg-brand-bg rounded-xl border border-brand-border px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-brand-text font-medium text-sm">{a.name}</span>
                  <Badge label={a.category} variant={CATEGORY_COLORS[a.category] || 'default'} />
                  {a.pictureable && <span className="flex items-center gap-1 text-brand-gold text-xs"><Camera size={11} /> Photo spot</span>}
                  {a._local && <span className="text-[10px] text-brand-muted">(pending)</span>}
                </div>
                {a.description && <p className="text-brand-muted text-xs mt-1 truncate">{a.description}</p>}
              </div>
              <button onClick={() => handleDelete(a, a._localIdx)} className="text-brand-muted hover:text-brand-error p-1 rounded shrink-0 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="bg-brand-bg rounded-xl border border-brand-gold/30 p-4 space-y-3">
          <p className="text-brand-gold text-sm font-medium">New Attraction</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" required placeholder="e.g. Taj Mahal" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <RefComboSelect
              label="Category"
              required
              placeholder="Select"
              collectionName={COLLECTIONS.attractionCategories}
              seedValues={ATTRACTION_CATEGORY_SEEDS}
              value={form.categoryId}
              onSelect={(id, name) => setForm((p) => ({ ...p, categoryId: id, category: name }))}
            />
          </div>
          <Input label="Description / Travel Info" placeholder="e.g. 15 mins by cab from hotel" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <Input label="Photo URL (optional)" placeholder="https://..." value={form.media} onChange={(e) => setForm((p) => ({ ...p, media: e.target.value }))} />
          <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-text">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${form.pictureable ? 'bg-brand-gold border-brand-gold' : 'border-brand-border'}`} onClick={() => setForm((p) => ({ ...p, pictureable: !p.pictureable }))}>
              {form.pictureable && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#0a1f13" strokeWidth="1.5" strokeLinecap="round" /></svg>}
            </div>
            Good photo spot
          </label>
          <div className="flex gap-2 pt-1">
            <Button variant="primary" size="sm" loading={saving} onClick={handleAdd}>Add Attraction</Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setForm(empty()) }}>Cancel</Button>
          </div>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-brand-border hover:border-brand-gold text-brand-muted hover:text-brand-gold text-sm transition-colors">
          <Plus size={16} /> Add Attraction
        </button>
      )}

      {!hotelId && localAttractions.length > 0 && (
        <p className="text-brand-muted text-xs italic text-center">Pending items will be saved to Firebase when you save the hotel</p>
      )}
    </div>
  )
}
