export default function Select({
  label,
  error,
  required,
  options = [],
  placeholder,
  className = '',
  wrapperClass = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${wrapperClass}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-brand-error ml-0.5">*</span>}
        </label>
      )}
      <select
        className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-brand-surface">
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value
          const label = typeof opt === 'string' ? opt : opt.label
          return (
            <option key={value} value={value} className="bg-brand-surface">
              {label}
            </option>
          )
        })}
      </select>
      {error && <p className="text-brand-error text-xs mt-0.5">{error}</p>}
    </div>
  )
}
