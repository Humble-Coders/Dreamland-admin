import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

function PlanPriceInput({ price, onChange }) {
  const [local, setLocal] = useState(String(price))

  useEffect(() => { setLocal(String(price)) }, [price])

  return (
    <input
      type="number"
      min="0"
      className="form-input w-40"
      value={local}
      placeholder="0"
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onChange(local === '' ? 0 : Number(local))}
    />
  )
}

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

export default function FoodDining({ data, onChange }) {
  const selected = data.mealPlansAvailable || []
  const cuisines = data.cuisines || []
  const [cuisineInput, setCuisineInput] = useState('')

  function isSelected(value) {
    return selected.some((p) => p.value === value)
  }

  function getPrice(value) {
    return selected.find((p) => p.value === value)?.price ?? 0
  }

  function togglePlan(value) {
    if (isSelected(value)) {
      onChange({ mealPlansAvailable: selected.filter((p) => p.value !== value) })
    } else {
      onChange({ mealPlansAvailable: [...selected, { value, price: 0 }] })
    }
  }

  function setPlanPrice(value, price) {
    onChange({
      mealPlansAvailable: selected.map((p) =>
        p.value === value ? { ...p, price: price === '' ? 0 : Number(price) } : p
      ),
    })
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
            const active = isSelected(value)
            return (
              <div
                key={value}
                className={`rounded-xl border transition-all ${
                  active
                    ? 'bg-brand-gold/10 border-brand-gold'
                    : 'bg-brand-bg border-brand-border'
                }`}
              >
                <button
                  type="button"
                  onClick={() => togglePlan(value)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      active ? 'border-brand-gold bg-brand-gold' : 'border-brand-border'
                    }`}
                  >
                    {active && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="#0a1f13" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${active ? 'text-brand-gold' : 'text-brand-text'}`}>{label}</span>
                </button>

                {active && (
                  <div className="px-4 pb-3">
                    <label className="text-xs text-brand-muted mb-1 block">Price per person (₹)</label>
                    <PlanPriceInput
                      price={getPrice(value)}
                      onChange={(num) => setPlanPrice(value, num)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Cuisines */}
      <div>
        <p className="form-label mb-2">Cuisines Served</p>

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
    </div>
  )
}
