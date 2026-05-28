import Input from '../components/ui/Input'
import SearchableSelect from '../components/ui/SearchableSelect'
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
        <SearchableSelect
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
          type="number"
          min={0}
          max={5}
          step="0.5"
          placeholder="e.g. 4.5"
          value={data.starRating ?? ''}
          onChange={(e) => onChange({ starRating: e.target.value !== '' ? Number(e.target.value) : null })}
          error={errors?.starRating}
        />
      </div>

      <Input
        label="Total Rooms"
        type="number"
        min={1}
        placeholder="e.g. 120"
        value={data.totalRooms || ''}
        onChange={(e) => onChange({ totalRooms: Number(e.target.value) })}
      />

    </div>
  )
}
