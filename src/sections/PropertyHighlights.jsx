import { Plus, Trash2 } from 'lucide-react'
import Input from '../components/ui/Input'
import RefComboSelect from '../components/ui/RefComboSelect'
import { COLLECTIONS } from '../schema'

const HIGHLIGHT_CATEGORY_SEEDS = ['hotel', 'shared', 'outdoor', 'cultural', 'water', 'wellness', 'entertainment']
const AMENITY_TYPE_SEEDS = ['basic', 'shared', 'premium', 'exclusive']

// Each highlight stores categoryId + category (name) and amenityTypeId + amenityType (name)
const emptyHighlight = () => ({
  title: '',
  categoryId: '', category: '',
  amenityTypeId: '', amenityType: '',
})

export default function PropertyHighlights({ data, onChange }) {
  const highlights = data.highlights || []

  function add() {
    onChange({ highlights: [...highlights, emptyHighlight()] })
  }

  function remove(idx) {
    onChange({ highlights: highlights.filter((_, i) => i !== idx) })
  }

  function update(idx, patch) {
    const next = highlights.map((h, i) => (i === idx ? { ...h, ...patch } : h))
    onChange({ highlights: next })
  }

  return (
    <div className="space-y-4">
      <p className="text-brand-muted text-sm">
        Add amenities and property highlights — pools, spa, garden, views, etc.
      </p>

      {highlights.map((h, idx) => (
        <div key={idx} className="bg-brand-bg rounded-xl border border-brand-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-brand-gold text-sm font-medium">Highlight {idx + 1}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-brand-muted hover:text-brand-error p-1 rounded transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <Input
            label="Title"
            placeholder="e.g. Infinity Pool, Rooftop Garden"
            value={h.title}
            onChange={(e) => update(idx, { title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <RefComboSelect
              label="Category"
              placeholder="Select"
              collectionName={COLLECTIONS.highlightCategories}
              seedValues={HIGHLIGHT_CATEGORY_SEEDS}
              value={h.categoryId || ''}
              onSelect={(id, name) => update(idx, { categoryId: id, category: name })}
            />
            <RefComboSelect
              label="Amenity Type"
              placeholder="Select"
              collectionName={COLLECTIONS.amenityTypes}
              seedValues={AMENITY_TYPE_SEEDS}
              value={h.amenityTypeId || ''}
              onSelect={(id, name) => update(idx, { amenityTypeId: id, amenityType: name })}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-brand-border
                   hover:border-brand-gold text-brand-muted hover:text-brand-gold text-sm transition-colors"
      >
        <Plus size={16} />
        Add Highlight
      </button>
    </div>
  )
}
