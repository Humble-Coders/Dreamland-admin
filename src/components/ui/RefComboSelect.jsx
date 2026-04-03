import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../../firebase'
import useLookupCollection from '../../hooks/useLookupCollection'

/**
 * A dropdown backed by a Firestore lookup collection.
 *
 * - Fetches all docs from `collectionName` (each doc: { id, name }).
 * - If collection is empty, auto-seeds from `seedValues`.
 * - Selecting an option calls onSelect(docId, docName).
 * - Choosing "+ Add custom…" creates a new doc and calls onSelect with the new ID.
 * - The hotel/attraction stores the doc ID as a reference.
 * - The doc name is stored alongside (denormalised) so display needs no extra query.
 */
export default function RefComboSelect({
  collectionName,
  seedValues = [],
  value,       // current doc ID
  onSelect,    // (id: string, name: string) => void
  label,
  placeholder,
  required,
  error,
}) {
  const { docs, loading } = useLookupCollection(collectionName, seedValues)
  const [customMode, setCustomMode] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [creating, setCreating] = useState(false)

  const currentDoc = docs.find((d) => d.id === value)
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

  async function handleAddCustom() {
    const name = customInput.trim()
    if (!name) return

    // Re-use existing doc if the name already exists (case-insensitive)
    const existing = docs.find((d) => d.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      onSelect(existing.id, existing.name)
      setCustomMode(false)
      setCustomInput('')
      return
    }

    setCreating(true)
    try {
      const ref = await addDoc(collection(db, collectionName), {
        name,
        createdAt: serverTimestamp(),
      })
      onSelect(ref.id, name)
      setCustomMode(false)
      setCustomInput('')
      toast.success(`"${name}" added`)
    } catch (err) {
      toast.error('Failed to add: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-brand-error ml-0.5">*</span>}
        </label>
      )}

      {!customMode ? (
        <select
          className={`form-input ${error ? 'form-input-error' : ''}`}
          value={value || ''}
          disabled={loading}
          onChange={(e) => {
            const val = e.target.value
            if (val === '__custom__') {
              setCustomMode(true)
            } else if (val) {
              const d = docs.find((d) => d.id === val)
              if (d) onSelect(d.id, d.name)
            } else {
              onSelect('', '')
            }
          }}
        >
          <option value="" disabled className="bg-brand-surface text-brand-muted">
            {loading ? 'Loading…' : (placeholder || 'Select…')}
          </option>
          {docs.map((d) => (
            <option key={d.id} value={d.id} className="bg-brand-surface text-brand-text">
              {capitalize(d.name)}
            </option>
          ))}
          {!loading && (
            <option value="__custom__" className="bg-brand-surface text-brand-muted">
              + Add custom…
            </option>
          )}
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            autoFocus
            className={`form-input flex-1 ${error ? 'form-input-error' : ''}`}
            placeholder="Type custom value…"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            disabled={creating}
          />
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={!customInput.trim() || creating}
            className="shrink-0 flex items-center gap-1 px-3 py-2 bg-brand-gold text-brand-bg rounded-lg text-sm font-medium hover:bg-brand-gold-light disabled:opacity-40 transition-colors"
          >
            {creating ? <Loader2 size={13} className="animate-spin" /> : 'Add'}
          </button>
          <button
            type="button"
            onClick={() => { setCustomMode(false); setCustomInput('') }}
            className="shrink-0 text-brand-muted hover:text-brand-text text-xs px-3 border border-brand-border rounded-lg hover:border-brand-gold transition-colors"
          >
            ← List
          </button>
        </div>
      )}

      {/* Show current selection name as hint when value is set */}
      {value && currentDoc && !customMode && (
        <p className="text-brand-muted text-xs mt-0.5">Selected: {currentDoc.name}</p>
      )}

      {error && <p className="text-brand-error text-xs mt-0.5">{error}</p>}
    </div>
  )
}
