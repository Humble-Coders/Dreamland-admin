import { Loader2, Star, MessageSquare, User } from 'lucide-react'
import useSubCollection from '../hooks/useSubCollection'
import { COLLECTIONS } from '../schema'

const BREAKDOWN_KEYS = ['cleanliness', 'food', 'staff', 'location', 'value']

function StarRow({ rating = 0, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < Math.round(rating) ? 'text-brand-gold fill-brand-gold' : 'text-brand-border'}
          fill={i < Math.round(rating) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

function RatingBar({ label, value = 0 }) {
  const pct = Math.min(100, (value / 5) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-brand-muted text-xs w-20 capitalize shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-brand-border rounded-full overflow-hidden">
        <div className="h-full bg-brand-gold rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-brand-muted text-xs w-6 text-right shrink-0">{value?.toFixed(1) ?? '—'}</span>
    </div>
  )
}

function formatDate(ts) {
  if (!ts) return ''
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function Reviews({ hotelId }) {
  const { docs: reviews, loading } = useSubCollection(COLLECTIONS.reviews, hotelId)

  if (!hotelId) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-card border border-brand-border flex items-center justify-center">
          <MessageSquare size={20} className="text-brand-muted" />
        </div>
        <p className="text-brand-text font-medium text-sm">No reviews yet</p>
        <p className="text-brand-muted text-xs">Guest reviews will appear here once the hotel is saved and live</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={28} className="text-brand-gold animate-spin" />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-card border border-brand-border flex items-center justify-center">
          <MessageSquare size={20} className="text-brand-muted" />
        </div>
        <p className="text-brand-text font-medium text-sm">No reviews yet</p>
        <p className="text-brand-muted text-xs">Guest reviews will appear here after they check out</p>
      </div>
    )
  }

  // Compute averages
  const avg = {}
  BREAKDOWN_KEYS.forEach((k) => {
    const vals = reviews.map((r) => r[k]).filter((v) => typeof v === 'number')
    avg[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  })
  const overallAvg =
    reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="bg-brand-bg rounded-xl border border-brand-border p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-serif text-brand-gold text-4xl font-bold">{overallAvg.toFixed(1)}</p>
            <StarRow rating={overallAvg} />
            <p className="text-brand-muted text-xs mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 space-y-2">
            {BREAKDOWN_KEYS.map((k) => (
              <RatingBar key={k} label={k} value={avg[k]} />
            ))}
          </div>
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-brand-bg rounded-xl border border-brand-border p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-card border border-brand-border flex items-center justify-center shrink-0">
                  <User size={14} className="text-brand-muted" />
                </div>
                <div>
                  <p className="text-brand-text text-sm font-medium">
                    {r.userId ? r.userId.slice(0, 10) + '…' : 'Guest'}
                  </p>
                  {r.createdAt && (
                    <p className="text-brand-muted text-xs">{formatDate(r.createdAt)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <StarRow rating={r.rating} />
                <span className="text-brand-gold text-sm font-semibold">{r.rating}</span>
              </div>
            </div>

            {r.comment && (
              <p className="text-brand-text text-sm leading-relaxed">{r.comment}</p>
            )}

            {/* Mini breakdown */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              {BREAKDOWN_KEYS.map((k) =>
                r[k] != null ? (
                  <span key={k} className="text-brand-muted text-xs capitalize">
                    {k}: <span className="text-brand-gold">{r[k]}</span>
                  </span>
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
