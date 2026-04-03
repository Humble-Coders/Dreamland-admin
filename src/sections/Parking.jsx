import Input from '../components/ui/Input'
import RefComboSelect from '../components/ui/RefComboSelect'
import { COLLECTIONS } from '../schema'

// Seed values — written to Firestore on first load if collections are empty
const PARKING_TYPE_SEEDS = ['covered', 'shared', 'guest', 'valet', 'paid', 'free']
const PARKING_CATEGORY_SEEDS = ['basement', 'surface', 'multi-level', 'rooftop', 'street', 'indoor']

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2.5 cursor-pointer">
      <span className="text-sm text-brand-text">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-gold' : 'bg-brand-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

export default function Parking({ data, onChange }) {
  return (
    <div className="space-y-4">
      <div className="bg-brand-bg rounded-xl border border-brand-border px-4 divide-y divide-brand-border">
        <Toggle
          label="Parking Available"
          checked={!!data.parkingAvailable}
          onChange={(val) => onChange({ parkingAvailable: val })}
        />
      </div>

      {data.parkingAvailable && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Parking Type — stores doc ID from parkingTypes collection */}
            <RefComboSelect
              label="Parking Type"
              placeholder="Select parking type"
              collectionName={COLLECTIONS.parkingTypes}
              seedValues={PARKING_TYPE_SEEDS}
              value={data.parkingTypeId || ''}
              onSelect={(id, name) => onChange({ parkingTypeId: id, parkingType: name })}
            />
            {/* Parking Category — stores doc ID from parkingCategories collection */}
            <RefComboSelect
              label="Parking Category"
              placeholder="Select category"
              collectionName={COLLECTIONS.parkingCategories}
              seedValues={PARKING_CATEGORY_SEEDS}
              value={data.parkingCategoryId || ''}
              onSelect={(id, name) => onChange({ parkingCategoryId: id, parkingCategory: name })}
            />
          </div>
          <Input
            label="Total Parking Spots"
            type="number"
            placeholder="e.g. 50"
            value={data.parkingSpots || ''}
            onChange={(e) => onChange({ parkingSpots: Number(e.target.value) })}
          />
        </div>
      )}

      {!data.parkingAvailable && (
        <p className="text-brand-muted text-sm italic text-center py-4">
          Enable parking to configure details
        </p>
      )}
    </div>
  )
}
