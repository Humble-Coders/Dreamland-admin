import { useState } from 'react'
import { LocateFixed, Loader2 } from 'lucide-react'
import Input from '../components/ui/Input'

export default function Location({ data, onChange, errors }) {
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState('')

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
        })
        setLocating(false)
      },
      (err) => {
        setGeoError(
          err.code === 1
            ? 'Location access denied. Please allow location in your browser settings.'
            : 'Unable to retrieve location. Please try again.'
        )
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

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
        onChange={(e) => onChange({ pincode: e.target.value.replace(/[^0-9]/g, '') })}
      />

      {/* Coordinates */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="form-label mb-0">Coordinates</span>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            className="flex items-center gap-1.5 text-xs text-brand-gold hover:text-brand-gold-light
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {locating
              ? <Loader2 size={13} className="animate-spin" />
              : <LocateFixed size={13} />}
            {locating ? 'Detecting…' : 'Use my location'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude"
            type="number"
            step="any"
            min={-90}
            max={90}
            placeholder="e.g. 4.1755"
            value={data.latitude ?? ''}
            onChange={(e) => onChange({ latitude: e.target.value !== '' ? parseFloat(e.target.value) : '' })}
            hint="Optional — for map display"
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            min={-180}
            max={180}
            placeholder="e.g. 73.5093"
            value={data.longitude ?? ''}
            onChange={(e) => onChange({ longitude: e.target.value !== '' ? parseFloat(e.target.value) : '' })}
          />
        </div>

        {geoError && (
          <p className="text-brand-error text-xs mt-1.5">{geoError}</p>
        )}
      </div>
    </div>
  )
}
