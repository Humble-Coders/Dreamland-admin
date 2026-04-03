import { useState } from 'react'
import { Plus, X } from 'lucide-react'

const MEAL_PLANS = [
  { value: 'Breakfast', label: 'Breakfast Only (B&B)' },
  { value: 'HB', label: 'Half Board (HB) — Breakfast + Dinner' },
  { value: 'FullBoard', label: 'Full Board — All Meals' },
  { value: 'RO', label: 'Room Only (RO)' },
]

const CUISINE_SUGGESTIONS = [
  'Indian', 'Chinese', 'Continental', 'Italian', 'Mexican',
  'Thai', 'Japanese', 'Mediterranean', 'Middle Eastern', 'French',
]

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2.5 cursor-pointer">
      <span className="text-sm text-brand-text">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-gold' : 'bg-brand-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

export default function FoodDining({ data, onChange }) {
  const selected = data.mealPlansAvailable || []
  const cuisines = data.cuisines || []
  const [cuisineInput, setCuisineInput] = useState('')

  function togglePlan(value) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange({ mealPlansAvailable: next })
  }

  function addCuisine(name) {
    const trimmed = name.trim()
    if (!trimmed || cuisines.map((c) => c.toLowerCase()).includes(trimmed.toLowerCase())) return
    onChange({ cuisines: [...cuisines, trimmed] })
    setCuisineInput('')
  }

  function removeCuisine(name) {
    onChange({ cuisines: cuisines.filter((c) => c !== name) })
  }

  return (
    <div className="space-y-5">
      {/* Meal Plans */}
      <div>
        <p className="form-label mb-3">Available Meal Plans</p>
        <div className="space-y-2">
          {MEAL_PLANS.map(({ value, label }) => {
            const isSelected = selected.includes(value)
            return (
              <button
                key={value}
                type="button"
                onClick={() => togglePlan(value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-brand-gold/10 border-brand-gold text-brand-gold'
                    : 'bg-brand-bg border-brand-border text-brand-text hover:border-brand-gold/50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-brand-gold bg-brand-gold' : 'border-brand-border'
                  }`}
                >
                  {isSelected && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="#0a1f13" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cuisines */}
      <div>
        <p className="form-label mb-2">Cuisines Served</p>

        {/* Added cuisines */}
        {cuisines.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {cuisines.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 border border-brand-gold/40 rounded-full text-sm text-brand-gold"
              >
                {c}
                <button
                  type="button"
                  onClick={() => removeCuisine(c)}
                  className="hover:text-brand-error transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {CUISINE_SUGGESTIONS.filter((s) => !cuisines.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addCuisine(s)}
              className="px-2.5 py-1 text-xs rounded-full border border-brand-border text-brand-muted hover:border-brand-gold hover:text-brand-gold transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex gap-2">
          <input
            className="form-input flex-1"
            placeholder="Add custom cuisine…"
            value={cuisineInput}
            onChange={(e) => setCuisineInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCuisine(cuisineInput)}
          />
          <button
            type="button"
            disabled={!cuisineInput.trim()}
            onClick={() => addCuisine(cuisineInput)}
            className="flex items-center gap-1 px-3 py-2 bg-brand-gold text-brand-bg rounded-lg text-sm font-medium hover:bg-brand-gold-light disabled:opacity-40 transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Toggle */}
      <div className="bg-brand-bg rounded-xl border border-brand-border px-4 divide-y divide-brand-border">
        <Toggle
          label="Vegetarian / Inclusive Menu Available"
          checked={!!data.foodInclusivity}
          onChange={(val) => onChange({ foodInclusivity: val })}
        />
      </div>
    </div>
  )
}
