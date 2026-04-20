import Input from '../components/ui/Input'
import RefComboSelect from '../components/ui/RefComboSelect'
import { COLLECTIONS } from '../schema'

const HOTEL_TYPE_SEEDS = ['resort', 'boutique', 'hostel', 'villa', 'homestay']

export default function BasicInfo({ data, onChange, errors }) {
  return (
    <div className="space-y-4">
      <Input
        label="Hotel Name"
        required
        placeholder="e.g. Grand Dreamland Palace"
        value={data.name || ''}
        onChange={(e) => onChange({ name: e.target.value })}
        error={errors?.name}
      />

      <div>
        <label className="form-label">
          Description
        </label>
        <textarea
          className={`form-input resize-none h-24 ${errors?.description ? 'form-input-error' : ''}`}
          placeholder="Describe the hotel — ambiance, location, highlights..."
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RefComboSelect
          label="Hotel Type"
          required
          placeholder="Select type"
          collectionName={COLLECTIONS.hotelTypes}
          seedValues={HOTEL_TYPE_SEEDS}
          value={data.hotelTypeId || ''}
          onSelect={(id, name) => onChange({ hotelTypeId: id, hotelType: name })}
          error={errors?.hotelType}
        />

        <Input
          label="Star Rating"
          required
          type="number"
          min={1}
          max={5}
          placeholder="1–5"
          value={data.starRating || ''}
          onChange={(e) => onChange({ starRating: Number(e.target.value) })}
          error={errors?.starRating}
        />
      </div>

      <Input
        label="Total Rooms"
        type="number"
        placeholder="e.g. 120"
        value={data.totalRooms || ''}
        onChange={(e) => onChange({ totalRooms: Number(e.target.value) })}
      />

      <div className="flex gap-6 pt-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              data.isActive
                ? 'bg-brand-gold border-brand-gold'
                : 'border-brand-border group-hover:border-brand-gold'
            }`}
            onClick={() => onChange({ isActive: !data.isActive })}
          >
            {data.isActive && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#0a1f13" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-brand-text">Active</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              data.isLuxury
                ? 'bg-brand-gold border-brand-gold'
                : 'border-brand-border group-hover:border-brand-gold'
            }`}
            onClick={() => onChange({ isLuxury: !data.isLuxury })}
          >
            {data.isLuxury && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#0a1f13" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-brand-text">Luxury Property</span>
        </label>
      </div>
    </div>
  )
}
