import { Plus, Trash2 } from 'lucide-react'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

const CATEGORIES = ['BUS', 'TRAIN', 'AIRPORT', 'METRO']

const emptyMode = () => ({
  category: '',
  name: '',
  distance: '',
  distanceInKm: '',
  detailed: '',
  cab: false,
  auto: false,
})

export default function Transport({ data, onChange }) {
  const modes = data.modes || []

  function addMode() {
    onChange({ modes: [...modes, emptyMode()] })
  }

  function removeMode(idx) {
    onChange({ modes: modes.filter((_, i) => i !== idx) })
  }

  function updateMode(idx, patch) {
    const next = modes.map((m, i) => (i === idx ? { ...m, ...patch } : m))
    onChange({ modes: next })
  }

  return (
    <div className="space-y-4">
      <p className="text-brand-muted text-sm">
        Add nearby transport options — bus stops, train stations, airports, or metro.
      </p>

      {modes.map((mode, idx) => (
        <div key={idx} className="bg-brand-bg rounded-xl border border-brand-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-brand-gold text-sm font-medium">Transport {idx + 1}</span>
            <button
              type="button"
              onClick={() => removeMode(idx)}
              className="text-brand-muted hover:text-brand-error p-1 rounded transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              placeholder="Select"
              options={CATEGORIES}
              value={mode.category}
              onChange={(e) => updateMode(idx, { category: e.target.value })}
            />
            <Input
              label="Name / Station"
              placeholder="e.g. Velana Int'l Airport"
              value={mode.name}
              onChange={(e) => updateMode(idx, { name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Distance (text)"
              placeholder="e.g. 2.5 km"
              value={mode.distance}
              onChange={(e) => updateMode(idx, { distance: e.target.value })}
            />
            <Input
              label="Distance (km)"
              type="number"
              step="0.1"
              placeholder="e.g. 2.5"
              value={mode.distanceInKm}
              onChange={(e) => updateMode(idx, { distanceInKm: parseFloat(e.target.value) || '' })}
            />
          </div>

          <Input
            label="Description"
            placeholder="e.g. 15 mins by cab from hotel"
            value={mode.detailed}
            onChange={(e) => updateMode(idx, { detailed: e.target.value })}
          />

          <div className="flex gap-5 pt-1">
            {[
              { key: 'cab', label: 'Cab Available' },
              { key: 'auto', label: 'Auto Available' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-brand-text">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    mode[key] ? 'bg-brand-gold border-brand-gold' : 'border-brand-border'
                  }`}
                  onClick={() => updateMode(idx, { [key]: !mode[key] })}
                >
                  {mode[key] && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="#0a1f13" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                {label}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addMode}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-brand-border
                   hover:border-brand-gold text-brand-muted hover:text-brand-gold text-sm transition-colors"
      >
        <Plus size={16} />
        Add Transport Mode
      </button>
    </div>
  )
}
