import Input from '../components/ui/Input'

export default function Location({ data, onChange, errors }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="form-label">
          Street Address <span className="text-brand-error">*</span>
        </label>
        <textarea
          className={`form-input resize-none h-20 ${errors?.address ? 'form-input-error' : ''}`}
          placeholder="123 Main Street, Near Landmark..."
          value={data.address || ''}
          onChange={(e) => onChange({ address: e.target.value })}
        />
        {errors?.address && (
          <p className="text-brand-error text-xs mt-0.5">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          required
          placeholder="e.g. Maldives"
          value={data.city || ''}
          onChange={(e) => onChange({ city: e.target.value })}
          error={errors?.city}
        />

        <Input
          label="Country"
          required
          placeholder="e.g. Maldives"
          value={data.country || ''}
          onChange={(e) => onChange({ country: e.target.value })}
          error={errors?.country}
        />
      </div>

      <Input
        label="Pincode / ZIP"
        placeholder="e.g. 400001"
        value={data.pincode || ''}
        onChange={(e) => onChange({ pincode: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Latitude"
          type="number"
          step="any"
          placeholder="e.g. 4.1755"
          value={data.latitude || ''}
          onChange={(e) => onChange({ latitude: parseFloat(e.target.value) || '' })}
          hint="Optional — for map display"
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          placeholder="e.g. 73.5093"
          value={data.longitude || ''}
          onChange={(e) => onChange({ longitude: parseFloat(e.target.value) || '' })}
        />
      </div>
    </div>
  )
}
