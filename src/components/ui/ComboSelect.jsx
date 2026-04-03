import { useState } from 'react'

/**
 * Dropdown with preset options + ability to type a fully custom value.
 * When "Add custom" is picked from the select, it switches to a text input.
 * A "← Presets" button lets the user go back to the dropdown.
 */
export default function ComboSelect({
  label, presets, value, onChange,
  placeholder, required, error,
}) {
  const isCustom = !!value && !presets.map((p) => p.toLowerCase()).includes(value.toLowerCase())
  const [customMode, setCustomMode] = useState(isCustom)

  function handleSelect(e) {
    const val = e.target.value
    if (val === '__custom__') {
      setCustomMode(true)
      onChange('')
    } else {
      setCustomMode(false)
      onChange(val)
    }
  }

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

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
          onChange={handleSelect}
        >
          <option value="" disabled className="bg-brand-surface text-brand-muted">
            {placeholder || 'Select…'}
          </option>
          {presets.map((o) => (
            <option key={o} value={o} className="bg-brand-surface text-brand-text">
              {capitalize(o)}
            </option>
          ))}
          <option value="__custom__" className="bg-brand-surface text-brand-muted">
            + Add custom…
          </option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            autoFocus
            className={`form-input flex-1 ${error ? 'form-input-error' : ''}`}
            placeholder="Type custom value…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => { setCustomMode(false); onChange('') }}
            className="shrink-0 text-brand-muted hover:text-brand-text text-xs px-3 border border-brand-border rounded-lg hover:border-brand-gold transition-colors"
          >
            ← Presets
          </button>
        </div>
      )}
      {error && <p className="text-brand-error text-xs mt-0.5">{error}</p>}
    </div>
  )
}
