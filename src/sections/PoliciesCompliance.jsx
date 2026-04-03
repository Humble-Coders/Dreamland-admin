import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import Input from '../components/ui/Input'
import ComboSelect from '../components/ui/ComboSelect'

const POLICY_SUGGESTIONS = [
  'No smoking indoors', 'No alcohol on premises', 'Quiet hours after 10 PM',
  'No outside food allowed', 'No unmarried couples', 'Couples only',
  'Government ID mandatory', 'Local ID not accepted',
]

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm text-brand-text">{label}</p>
        {description && <p className="text-brand-muted text-xs mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 mt-0.5 ${
          checked ? 'bg-brand-gold' : 'bg-brand-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default function PoliciesCompliance({ data, onChange }) {
  const customPolicies = data.customPolicies || []
  const [policyInput, setPolicyInput] = useState('')

  function addPolicy(name) {
    const trimmed = name.trim()
    if (!trimmed || customPolicies.includes(trimmed)) return
    onChange({ customPolicies: [...customPolicies, trimmed] })
    setPolicyInput('')
  }

  function removePolicy(name) {
    onChange({ customPolicies: customPolicies.filter((p) => p !== name) })
  }

  return (
    <div className="space-y-4">
      <div className="bg-brand-bg rounded-xl border border-brand-border px-4 divide-y divide-brand-border">
        <Toggle
          label="ID / PDF Required at Check-In"
          description="Guest must show valid government ID or confirmation PDF"
          checked={!!data.pdfRequired}
          onChange={(val) => onChange({ pdfRequired: val })}
        />
        <Toggle
          label="Privacy Premium Room"
          description="Private rooms away from common areas"
          checked={!!data.privacyPremium}
          onChange={(val) => onChange({ privacyPremium: val })}
        />
        <Toggle
          label="Pets Allowed"
          description="Hotel accepts guests with pets"
          checked={!!data.petPolicy}
          onChange={(val) => onChange({ petPolicy: val })}
        />
      </div>

      <Input
        label="Minimum Age Restriction"
        type="number"
        min={0}
        max={99}
        placeholder="e.g. 18 (leave blank for no restriction)"
        value={data.ageRestriction || ''}
        onChange={(e) =>
          onChange({ ageRestriction: e.target.value ? Number(e.target.value) : null })
        }
        hint="Minimum guest age for check-in without guardian"
      />

      {/* Custom policies */}
      <div>
        <p className="form-label mb-2">Additional Policies</p>

        {customPolicies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {customPolicies.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-card border border-brand-border rounded-lg text-xs text-brand-text"
              >
                {p}
                <button
                  type="button"
                  onClick={() => removePolicy(p)}
                  className="text-brand-muted hover:text-brand-error transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {POLICY_SUGGESTIONS.filter((s) => !customPolicies.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addPolicy(s)}
              className="px-2.5 py-1 text-xs rounded-full border border-brand-border text-brand-muted hover:border-brand-gold hover:text-brand-gold transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="form-input flex-1"
            placeholder="Add custom policy…"
            value={policyInput}
            onChange={(e) => setPolicyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPolicy(policyInput)}
          />
          <button
            type="button"
            disabled={!policyInput.trim()}
            onClick={() => addPolicy(policyInput)}
            className="flex items-center gap-1 px-3 py-2 bg-brand-gold text-brand-bg rounded-lg text-sm font-medium hover:bg-brand-gold-light disabled:opacity-40 transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}
