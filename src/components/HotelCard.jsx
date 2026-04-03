import { MapPin, Star, BedDouble, Pencil, Eye } from 'lucide-react'
import Badge from './ui/Badge'
import Button from './ui/Button'
import StorageImage from './StorageImage'

function StarRating({ rating = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'text-brand-gold fill-brand-gold' : 'text-brand-border'}
          fill={i <= rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

export default function HotelCard({ hotel, onEdit, onView }) {
  const coverPhoto = hotel.photos?.[0] || null
  const statusVariant =
    hotel.status === 'active' ? 'active' : hotel.status === 'draft' ? 'draft' : 'inactive'

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-card hover:border-brand-gold/40 transition-all duration-200 group flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-brand-surface overflow-hidden shrink-0">
        <StorageImage
          src={coverPhoto}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          placeholderIcon={<BedDouble size={40} className="text-brand-border" />}
        />
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge
            label={hotel.status ?? 'draft'}
            variant={statusVariant}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3 className="font-serif text-brand-gold text-lg font-semibold leading-snug line-clamp-2">
            {hotel.name || 'Untitled Hotel'}
          </h3>

          {(hotel.city || hotel.country) && (
            <p className="flex items-center gap-1 text-brand-muted text-sm mt-1">
              <MapPin size={13} className="shrink-0" />
              {[hotel.city, hotel.country].filter(Boolean).join(', ')}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={hotel.starRating} />
            {hotel.totalRooms != null && (
              <span className="text-brand-muted text-xs">{hotel.totalRooms} rooms</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-brand-border" />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(hotel)}
          >
            <Pencil size={13} />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(hotel)}
          >
            <Eye size={13} />
            View
          </Button>
        </div>
      </div>
    </div>
  )
}
