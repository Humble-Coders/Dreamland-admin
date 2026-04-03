export default function Badge({ label, variant = 'default', className = '' }) {
  const variants = {
    active: 'bg-brand-success/20 text-brand-success border border-brand-success/30',
    inactive: 'bg-brand-error/20 text-brand-error border border-brand-error/30',
    draft: 'bg-brand-warning/20 text-brand-warning border border-brand-warning/30',
    default: 'bg-brand-border/50 text-brand-muted border border-brand-border',
    complete: 'bg-brand-success/20 text-brand-success border border-brand-success/30',
    partial: 'bg-brand-warning/20 text-brand-warning border border-brand-warning/30',
    empty: 'bg-brand-border/50 text-brand-muted border border-brand-border',
    gold: 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] ?? variants.default} ${className}`}
    >
      {label}
    </span>
  )
}
