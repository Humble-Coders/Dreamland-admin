export default function TimePicker({ label, required, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-brand-error ml-0.5">*</span>}
        </label>
      )}
      <input
        type="time"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`form-input ${error ? 'form-input-error' : ''} [color-scheme:dark]`}
      />
      {error && <p className="text-brand-error text-xs mt-0.5">{error}</p>}
    </div>
  )
}
