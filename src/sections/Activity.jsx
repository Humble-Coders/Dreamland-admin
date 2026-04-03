import { useState } from 'react'
import { addDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../schema'
import useSubCollection from '../hooks/useSubCollection'
import { Plus, Trash2, Loader2, Clock, IndianRupee } from 'lucide-react'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import toast from 'react-hot-toast'

const CATEGORIES = ['adventure', 'leisure', 'cultural', 'wellness', 'water sports', 'trekking', 'sightseeing', 'food tour']
const empty = () => ({ title: '', category: '', description: '', duration: '', price: '', included: false, media: '' })

export default function Activity({ hotelId, data, onChange }) {
  const { docs: firestoreActivities, loading } = useSubCollection(COLLECTIONS.travelList, hotelId)
  const localActivities = data?.draftActivities || []

  const [form, setForm] = useState(empty())
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!form.title) { toast.error('Activity title is required'); return }
    setSaving(true)
    try {
      if (hotelId) {
        await addDoc(collection(db, COLLECTIONS.travelList), {
          hotelId, title: form.title, category: form.category || null,
          description: form.description || null, duration: form.duration || null,
          price: form.price ? Number(form.price) : null, included: form.included,
          media: form.media || null, createdAt: serverTimestamp(),
        })
      } else {
        onChange({ draftActivities: [...localActivities, {
          title: form.title, category: form.category || null,
          description: form.description || null, duration: form.duration || null,
          price: form.price ? Number(form.price) : null, included: form.included,
        }] })
      }
      setForm(empty()); setShowForm(false)
      toast.success('Activity added')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item, localIdx) {
    try {
      if (hotelId && item.id) {
        await deleteDoc(doc(db, COLLECTIONS.travelList, item.id))
      } else {
        onChange({ draftActivities: localActivities.filter((_, i) => i !== localIdx) })
      }
      toast.success('Removed')
    } catch (err) {
      toast.error('Delete failed: ' + err.message)
    }
  }

  const allActivities = [
    ...firestoreActivities,
    ...localActivities.map((a, i) => ({ ...a, _local: true, _localIdx: i })),
  ]

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 size={24} className="text-brand-gold animate-spin" /></div>
      ) : allActivities.length === 0 && !showForm ? (
        <p className="text-brand-muted text-sm text-center py-4 italic">No activities added yet</p>
      ) : (
        <div className="space-y-2">
          {allActivities.map((a, i) => (
            <div key={a.id || i} className="flex items-start justify-between gap-3 bg-brand-bg rounded-xl border border-brand-border px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-brand-text font-medium text-sm">{a.title}</span>
                  {a.category && <Badge label={a.category} variant="default" />}
                  {a.included && <Badge label="Included" variant="complete" />}
                  {a._local && <span className="text-[10px] text-brand-muted">(pending)</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {a.duration && <span className="flex items-center gap-1 text-brand-muted text-xs"><Clock size={11} /> {a.duration}</span>}
                  {a.price > 0 && <span className="flex items-center gap-1 text-brand-muted text-xs"><IndianRupee size={11} /> {a.price}</span>}
                  {a.description && <span className="text-brand-muted text-xs truncate max-w-[200px]">{a.description}</span>}
                </div>
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
          <p className="text-brand-gold text-sm font-medium">New Activity</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Title" required placeholder="e.g. Snorkeling Trip" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <Select label="Category" placeholder="Select" options={CATEGORIES} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
          </div>
          <Input label="Description" placeholder="Brief description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Duration" placeholder="e.g. 2 hours" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
            <Input label="Price (₹)" type="number" placeholder="0 if free" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-text">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${form.included ? 'bg-brand-gold border-brand-gold' : 'border-brand-border'}`} onClick={() => setForm((p) => ({ ...p, included: !p.included }))}>
              {form.included && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#0a1f13" strokeWidth="1.5" strokeLinecap="round" /></svg>}
            </div>
            Included in hotel package
          </label>
          <div className="flex gap-2 pt-1">
            <Button variant="primary" size="sm" loading={saving} onClick={handleAdd}>Add Activity</Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setForm(empty()) }}>Cancel</Button>
          </div>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-brand-border hover:border-brand-gold text-brand-muted hover:text-brand-gold text-sm transition-colors">
          <Plus size={16} /> Add Activity
        </button>
      )}

      {!hotelId && localActivities.length > 0 && (
        <p className="text-brand-muted text-xs italic text-center">Pending items will be saved to Firebase when you save the hotel</p>
      )}
    </div>
  )
}
