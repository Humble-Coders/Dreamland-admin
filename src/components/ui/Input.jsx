export default function Input({
  label,
  error,
  hint,
  required,
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
      <input
        className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-brand-error text-xs mt-0.5">{error}</p>}
      {hint && !error && <p className="text-brand-muted text-xs mt-0.5">{hint}</p>}
    </div>
  )
}
