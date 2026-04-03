import TimePicker from '../components/ui/TimePicker'

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2 cursor-pointer group">
      <span className="text-sm text-brand-text">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
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

export default function CheckInOut({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <TimePicker
          label="Check-In Time"
          required
          value={data.checkInTime || ''}
          onChange={(val) => onChange({ checkInTime: val })}
          error={errors?.checkInTime}
        />

        <TimePicker
          label="Check-Out Time"
          required
          value={data.checkOutTime || ''}
          onChange={(val) => onChange({ checkOutTime: val })}
          error={errors?.checkOutTime}
        />
      </div>

      <div className="bg-brand-bg rounded-xl border border-brand-border divide-y divide-brand-border px-4">
        <Toggle
          label="Early Check-In Fee"
          checked={!!data.earlyCheckInFee}
          onChange={(val) => onChange({ earlyCheckInFee: val })}
        />
        <Toggle
          label="Late Check-Out Fee"
          checked={!!data.lateCheckOutFee}
          onChange={(val) => onChange({ lateCheckOutFee: val })}
        />
      </div>
    </div>
  )
}
