import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from './Button'

/**
 * Usage:
 *   const [confirm, setConfirm] = useState(null)
 *
 *   // trigger:
 *   setConfirm({ title: 'Delete room?', message: 'This cannot be undone.', onConfirm: () => doDelete() })
 *
 *   // render:
 *   <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
 */
export default function ConfirmDialog({ state, onClose }) {
  useEffect(() => {
    if (!state) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, onClose])

  if (!state) return null

  function handleConfirm() {
    state.onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-dialog w-full max-w-sm p-6 flex flex-col gap-5">
        {/* Icon + text */}
        <div className="flex gap-4 items-start">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-error/10 border border-brand-error/20 flex items-center justify-center">
            <AlertTriangle size={18} className="text-brand-error" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-brand-text text-lg font-semibold leading-snug">
              {state.title}
            </h3>
            {state.message && (
              <p className="text-brand-muted text-sm mt-1 leading-relaxed">{state.message}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={handleConfirm}>
            {state.confirmLabel || 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
