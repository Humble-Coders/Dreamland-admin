export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-brand-surface disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-brand-gold text-brand-bg hover:bg-brand-gold-light focus:ring-brand-gold shadow-md hover:shadow-gold',
    outline:
      'border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-bg focus:ring-brand-gold',
    ghost:
      'text-brand-muted hover:text-brand-text hover:bg-brand-card focus:ring-brand-border',
    danger:
      'bg-brand-error text-white hover:bg-red-600 focus:ring-brand-error',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
