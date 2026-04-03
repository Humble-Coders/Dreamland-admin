import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './ui/Button'
import { SECTIONS as ALL_SECTIONS } from '../sections'

export default function SectionDialog({
  sections: sectionsProp,
  sectionIndex,
  onClose,
  onNavigate,
  data,
  onChange,
  errors,
  hotelId,
}) {
  const sections = sectionsProp || ALL_SECTIONS
  const section = sections[sectionIndex]
  if (!section) return null

  const SectionComponent = section.component
  const isFirst = sectionIndex === 0
  const isLast = sectionIndex === sections.length - 1

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const sectionErrors = errors?.[section.id] || {}
  const hasErrors = Object.keys(sectionErrors).length > 0

  return (
    <div className="dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog-box">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center shrink-0">
              <section.icon size={18} className="text-brand-gold" />
            </div>
            <div>
              <h2 className="font-serif text-brand-gold text-xl font-semibold">
                {section.label}
              </h2>
              <p className="text-brand-muted text-xs">{section.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-muted hover:text-brand-text p-1.5 rounded-lg hover:bg-brand-card transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 pt-4">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onNavigate(i)}
              className={`h-1.5 rounded-full transition-all flex-1 ${
                i === sectionIndex
                  ? 'bg-brand-gold'
                  : i < sectionIndex
                  ? 'bg-brand-gold/40'
                  : 'bg-brand-border'
              }`}
              title={s.label}
            />
          ))}
        </div>

        {/* Error banner */}
        {hasErrors && (
          <div className="mx-6 mt-4 px-4 py-3 bg-brand-error/10 border border-brand-error/30 rounded-xl">
            <p className="text-brand-error text-sm font-medium">
              Please fill in the required fields highlighted below
            </p>
          </div>
        )}

        {/* Section content */}
        <div className="px-6 py-5">
          <SectionComponent
            data={data}
            onChange={onChange}
            errors={sectionErrors}
            hotelId={hotelId}
          />
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border sticky bottom-0 bg-brand-surface">
          <Button
            variant="ghost"
            size="md"
            disabled={isFirst}
            onClick={() => onNavigate(sectionIndex - 1)}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <span className="text-brand-muted text-xs">
            {sectionIndex + 1} / {sections.length}
          </span>

          <Button
            variant={isLast ? 'outline' : 'primary'}
            size="md"
            onClick={() => (isLast ? onClose() : onNavigate(sectionIndex + 1))}
          >
            {isLast ? 'Done' : 'Next'}
            {!isLast && <ChevronRight size={16} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
