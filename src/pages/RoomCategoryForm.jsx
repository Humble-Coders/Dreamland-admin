import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addDoc, updateDoc, doc, getDoc, getDocs, collection, serverTimestamp, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../schema'
import useLookupCollection from '../hooks/useLookupCollection'
import {
  Loader2, Save, Plus, X, ChevronLeft, ChevronRight,
  BedDouble, Settings2, IndianRupee, ShieldCheck, Images, Gift, ArrowLeft,
} from 'lucide-react'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import RefComboSelect from '../components/ui/RefComboSelect'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

// ─── Suggestions ─────────────────────────────────────────────────────────────

const AMENITY_SUGGESTIONS = [
  'Air Conditioning', 'Free WiFi', 'Smart TV', 'Mini Bar', 'In-Room Safe',
  'Hair Dryer', 'Bathrobe & Slippers', 'Iron & Board', 'Coffee Maker',
  'Work Desk', 'Balcony', 'Private Pool', 'Jacuzzi', 'Rainfall Shower',
  'Blackout Curtains', 'Room Service', 'Daily Housekeeping',
]

const ACCESSIBILITY_SUGGESTIONS = [
  'Wheelchair Accessible', 'Elevator Access', 'Roll-in Shower',
  'Grab Bars', 'Visual Alarms', 'Braille Signage', 'Wide Doorways',
]

const COMPLIMENTARY_SUGGESTIONS = [
  'Breakfast Included', 'Welcome Drink', 'Evening Snacks',
  'Newspaper', 'Airport Pickup', 'Early Check-in', 'Late Check-out',
]

const PURCHASABLE_SUGGESTIONS = [
  'Spa Package', 'Romantic Room Setup', 'Decorated Room', 'Extra Bed',
  'Airport Transfer', 'Private Dining', 'Bonfire Setup',
]

// ─── Default form state ───────────────────────────────────────────────────────

const DEFAULT_FORM = {
  name: '', description: '',
  capacity: '', maxOccupancy: '', price: '', tax: '', noOfRooms: '',
  bedType: '', bedTypeId: '', noOfBeds: '', view: '', roomSizeSqft: '', floor: '',
  bathroomType: '', smokingAllowed: false, accessibilityFeatures: [], connectedRooms: false,
  extraGuestCharge: '', weekendPricingFri: '', weekendPricingSat: '',
  minStayNights: '', seasonalPricing: [],
  freeCancellation: false, cancellationFreeBefore: '',
  cancellationRefundPercent: '', cancellationPolicyNote: '',
  amenities: [], media: [],
  complimentaryBenefits: [], purchasableBenefits: [],
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm text-brand-text">{label}</p>
        {description && <p className="text-xs text-brand-muted mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`shrink-0 relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-gold' : 'bg-brand-border'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

function TagInput({ label, value = [], onChange, placeholder, suggestions = [] }) {
  const [input, setInput] = useState('')

  function add(tag) {
    const t = tag.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setInput('')
  }

  return (
    <div className="space-y-2">
      {label && <label className="form-label">{label}</label>}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-brand-gold text-xs">
              {t}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="hover:opacity-70"><X size={11} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="form-input flex-1"
          placeholder={placeholder || 'Type and press Enter…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(input) } }}
        />
        <button type="button" disabled={!input.trim()} onClick={() => add(input)}
          className="shrink-0 px-3 py-2 bg-brand-gold text-brand-bg rounded-lg text-sm font-medium hover:bg-brand-gold-light disabled:opacity-40 transition-colors">
          Add
        </button>
      </div>
      {suggestions.filter((s) => !value.includes(s)).length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {suggestions.filter((s) => !value.includes(s)).map((s) => (
            <button key={s} type="button" onClick={() => add(s)}
              className="px-2.5 py-1 rounded-full border border-brand-border text-brand-muted hover:border-brand-gold hover:text-brand-gold text-xs transition-colors">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LookupTagInput({ label, value = [], onChange, placeholder, collectionName, docs = [], docsLoading = false }) {
  const [input, setInput] = useState('')

  async function addNew(tagName) {
    const t = tagName.trim()
    if (!t) return
    setInput('')
    // Always add to form first so UX is never blocked
    if (!value.includes(t)) onChange([...value, t])
    // Then try to persist to the lookup collection
    try {
      await addDoc(collection(db, collectionName), { name: t, createdAt: serverTimestamp() })
    } catch (err) {
      console.error(`Failed to add "${t}" to ${collectionName}:`, err)
    }
  }

  function select(name) {
    if (!value.includes(name)) onChange([...value, name])
  }

  const availableChips = docs.filter((d) => !value.includes(d.name))

  return (
    <div className="space-y-2">
      {label && <label className="form-label">{label}</label>}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-brand-gold text-xs">
              {t}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="hover:opacity-70"><X size={11} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="form-input flex-1"
          placeholder={placeholder || 'Type and press Enter…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNew(input) } }}
        />
        <button type="button" disabled={!input.trim()} onClick={() => addNew(input)}
          className="shrink-0 px-3 py-2 bg-brand-gold text-brand-bg rounded-lg text-sm font-medium hover:bg-brand-gold-light disabled:opacity-40 transition-colors">
          Add
        </button>
      </div>
      {docsLoading ? (
        <p className="text-brand-muted text-xs">Loading…</p>
      ) : availableChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {availableChips.map((d) => (
            <button key={d.id} type="button" onClick={() => select(d.name)}
              className="px-2.5 py-1 rounded-full border border-brand-border text-brand-muted hover:border-brand-gold hover:text-brand-gold text-xs transition-colors">
              + {d.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function URLListInput({ label, value = [], onChange }) {
  const [input, setInput] = useState('')

  function add() {
    const url = input.trim()
    if (url && !value.includes(url)) onChange([...value, url])
    setInput('')
  }

  return (
    <div className="space-y-2">
      {label && <label className="form-label">{label}</label>}
      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((url, i) => (
            <div key={i} className="flex items-center gap-2 bg-brand-bg border border-brand-border rounded-lg px-3 py-2">
              <span className="flex-1 text-xs text-brand-muted truncate">{url}</span>
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="shrink-0 text-brand-muted hover:text-brand-error transition-colors"><X size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input className="form-input flex-1" placeholder="https://…" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
        <button type="button" disabled={!input.trim()} onClick={add}
          className="shrink-0 px-3 py-2 bg-brand-gold text-brand-bg rounded-lg text-sm font-medium hover:bg-brand-gold-light disabled:opacity-40 transition-colors">
          Add
        </button>
      </div>
    </div>
  )
}

function SeasonalPricingInput({ value = [], onChange }) {
  const [showForm, setShowForm] = useState(false)
  const [entry, setEntry] = useState({ label: '', startDate: '', endDate: '', price: '' })

  function addEntry() {
    if (!entry.label || !entry.price) { toast.error('Season name and price are required'); return }
    onChange([...value, { label: entry.label, startDate: entry.startDate, endDate: entry.endDate, price: Number(entry.price) }])
    setEntry({ label: '', startDate: '', endDate: '', price: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-2">
      <label className="form-label">Seasonal Pricing</label>
      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((sp, i) => (
            <div key={i} className="flex items-center gap-3 bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-brand-text text-sm font-medium">{sp.label}</p>
                {(sp.startDate || sp.endDate) && (
                  <p className="text-brand-muted text-xs mt-0.5">{sp.startDate}{sp.endDate ? ` → ${sp.endDate}` : ''}</p>
                )}
              </div>
              <span className="text-brand-gold text-sm font-semibold shrink-0">₹{sp.price.toLocaleString('en-IN')}</span>
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="text-brand-muted hover:text-brand-error transition-colors"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
      {showForm ? (
        <div className="bg-brand-bg border border-brand-gold/30 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Season Name" placeholder="e.g. Peak Summer" value={entry.label} onChange={(e) => setEntry((p) => ({ ...p, label: e.target.value }))} />
            <Input label="Price / Night (₹)" type="number" placeholder="e.g. 8000" value={entry.price} onChange={(e) => setEntry((p) => ({ ...p, price: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={entry.startDate} onChange={(e) => setEntry((p) => ({ ...p, startDate: e.target.value }))} />
            <Input label="End Date" type="date" value={entry.endDate} onChange={(e) => setEntry((p) => ({ ...p, endDate: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={addEntry}>Add Season</Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEntry({ label: '', startDate: '', endDate: '', price: '' }) }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-brand-border hover:border-brand-gold text-brand-muted hover:text-brand-gold text-sm transition-colors">
          <Plus size={14} /> Add Seasonal Price
        </button>
      )}
    </div>
  )
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 'basic', label: 'Basic Info', description: 'Name, pricing and inventory', icon: BedDouble },
  { id: 'physical', label: 'Room Physical Details', description: 'Bed, size, view and bathroom', icon: Settings2 },
  { id: 'pricing', label: 'Pricing & Availability', description: 'Weekend rates and seasonal pricing', icon: IndianRupee },
  { id: 'cancellation', label: 'Cancellation Policy', description: 'Refund and cancellation terms', icon: ShieldCheck },
  { id: 'amenities', label: 'Amenities & Media', description: 'Room features and photos', icon: Images },
  { id: 'benefits', label: 'Benefits', description: 'Complimentary and purchasable add-ons', icon: Gift },
]

// ─── Step content components ──────────────────────────────────────────────────

function StepBasic({ form, set }) {
  return (
    <div className="space-y-4">
      <Input label="Room Category Name" required placeholder="e.g. Deluxe Ocean View, Standard Room" value={form.name} onChange={(e) => set({ name: e.target.value })} />
      <div>
        <label className="form-label">Description</label>
        <textarea className="form-input resize-none" rows={3} placeholder="Describe what makes this room special…" value={form.description} onChange={(e) => set({ description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Price per Night (₹)" required type="number" placeholder="e.g. 5000" value={form.price} onChange={(e) => set({ price: e.target.value })} />
        <Input label="Tax (%)" type="number" placeholder="e.g. 18" value={form.tax} onChange={(e) => set({ tax: e.target.value })} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Capacity" required type="number" placeholder="2" value={form.capacity} onChange={(e) => set({ capacity: e.target.value })} />
        <Input label="Max Occupancy" type="number" placeholder="3" value={form.maxOccupancy} onChange={(e) => set({ maxOccupancy: e.target.value })} />
        <Input label="No. of Rooms" type="number" placeholder="10" value={form.noOfRooms} onChange={(e) => set({ noOfRooms: e.target.value })} />
      </div>
    </div>
  )
}

function StepPhysical({ form, set, lookup }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <RefComboSelect
          label="Bed Type"
          placeholder="Select"
          collectionName={COLLECTIONS.bedTypes}
          seedValues={['single', 'twin', 'double', 'queen', 'king', 'bunk']}
          value={form.bedTypeId || ''}
          onSelect={(id, name) => set({ bedTypeId: id, bedType: name })}
        />
        <Input label="Number of Beds" type="number" placeholder="e.g. 1" value={form.noOfBeds} onChange={(e) => set({ noOfBeds: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="View" placeholder="Select" value={form.view} onChange={(e) => set({ view: e.target.value })} options={['pool', 'garden', 'sea', 'city', 'mountain', 'courtyard']} />
        <Select label="Bathroom Type" placeholder="Select" value={form.bathroomType} onChange={(e) => set({ bathroomType: e.target.value })} options={['attached', 'shared', 'en-suite']} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Room Size (sq ft)" type="number" placeholder="e.g. 350" value={form.roomSizeSqft} onChange={(e) => set({ roomSizeSqft: e.target.value })} />
        <Input label="Floor" placeholder="e.g. 3rd floor" value={form.floor} onChange={(e) => set({ floor: e.target.value })} />
      </div>
      <div className="bg-brand-bg rounded-xl border border-brand-border px-4 divide-y divide-brand-border">
        <Toggle label="Smoking Allowed" checked={form.smokingAllowed} onChange={(v) => set({ smokingAllowed: v })} />
        <Toggle label="Connected Rooms Available" description="Can be joined with adjacent room" checked={form.connectedRooms} onChange={(v) => set({ connectedRooms: v })} />
      </div>
      <LookupTagInput label="Accessibility Features" value={form.accessibilityFeatures} onChange={(v) => set({ accessibilityFeatures: v })} placeholder="e.g. Wheelchair Accessible" collectionName="roomAccessibilityFeatures" docs={lookup.accessibilityDocs} docsLoading={lookup.accessibilityLoading} />
    </div>
  )
}

function StepPricing({ form, set }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Extra Guest Charge (₹)" type="number" placeholder="e.g. 500" value={form.extraGuestCharge} onChange={(e) => set({ extraGuestCharge: e.target.value })} />
        <Input label="Minimum Stay (nights)" type="number" placeholder="e.g. 1" value={form.minStayNights} onChange={(e) => set({ minStayNights: e.target.value })} />
      </div>
      <div>
        <label className="form-label">Weekend Pricing (₹ / night)</label>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Friday price" type="number" value={form.weekendPricingFri} onChange={(e) => set({ weekendPricingFri: e.target.value })} />
          <Input placeholder="Saturday price" type="number" value={form.weekendPricingSat} onChange={(e) => set({ weekendPricingSat: e.target.value })} />
        </div>
      </div>
      <SeasonalPricingInput value={form.seasonalPricing} onChange={(v) => set({ seasonalPricing: v })} />
    </div>
  )
}

function StepCancellation({ form, set }) {
  return (
    <div className="space-y-4">
      <div className="bg-brand-bg rounded-xl border border-brand-border px-4">
        <Toggle label="Free Cancellation Available" checked={form.freeCancellation} onChange={(v) => set({ freeCancellation: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Free Before Check-in (days)" type="number" placeholder="e.g. 3" value={form.cancellationFreeBefore} onChange={(e) => set({ cancellationFreeBefore: e.target.value })} />
        <Input label="Refund Percentage (%)" type="number" placeholder="e.g. 100" value={form.cancellationRefundPercent} onChange={(e) => set({ cancellationRefundPercent: e.target.value })} />
      </div>
      <div>
        <label className="form-label">Policy Note</label>
        <textarea className="form-input resize-none" rows={3} placeholder="Any additional cancellation terms…" value={form.cancellationPolicyNote} onChange={(e) => set({ cancellationPolicyNote: e.target.value })} />
      </div>
    </div>
  )
}

function StepAmenities({ form, set, lookup }) {
  return (
    <div className="space-y-5">
      <LookupTagInput label="Room Amenities" value={form.amenities} onChange={(v) => set({ amenities: v })} placeholder="e.g. Air Conditioning" collectionName="roomAmenities" docs={lookup.amenityDocs} docsLoading={lookup.amenityLoading} />
      <URLListInput label="Photo URLs" value={form.media} onChange={(v) => set({ media: v })} />
    </div>
  )
}

function StepBenefits({ form, set, lookup }) {
  return (
    <div className="space-y-5">
      <LookupTagInput label="Complimentary Benefits" value={form.complimentaryBenefits} onChange={(v) => set({ complimentaryBenefits: v })} placeholder="e.g. Breakfast Included" collectionName="roomComplimentaryBenefits" docs={lookup.complimentaryDocs} docsLoading={lookup.complimentaryLoading} />
      <LookupTagInput label="Purchasable Add-ons" value={form.purchasableBenefits} onChange={(v) => set({ purchasableBenefits: v })} placeholder="e.g. Spa Package" collectionName="roomPurchasableBenefits" docs={lookup.purchasableDocs} docsLoading={lookup.purchasableLoading} />
    </div>
  )
}

const STEP_COMPONENTS = [StepBasic, StepPhysical, StepPricing, StepCancellation, StepAmenities, StepBenefits]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RoomCategoryForm() {
  const { hotelId, roomId } = useParams()
  const navigate = useNavigate()
  const isEdit = roomId && roomId !== 'new'

  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(0)

  // Lookup collections — always mounted so seeding fires on page load
  const { docs: amenityDocs, loading: amenityLoading } = useLookupCollection('roomAmenities')
  const { docs: accessibilityDocs, loading: accessibilityLoading } = useLookupCollection('roomAccessibilityFeatures')
  const { docs: complimentaryDocs, loading: complimentaryLoading } = useLookupCollection('roomComplimentaryBenefits')
  const { docs: purchasableDocs, loading: purchasableLoading } = useLookupCollection('roomPurchasableBenefits')

  const lookup = { amenityDocs, amenityLoading, accessibilityDocs, accessibilityLoading, complimentaryDocs, complimentaryLoading, purchasableDocs, purchasableLoading }

  // Seed lookup collections on first load if empty
  useEffect(() => {
    const seedData = [
      { colName: 'roomAmenities', values: AMENITY_SUGGESTIONS },
      { colName: 'roomAccessibilityFeatures', values: ACCESSIBILITY_SUGGESTIONS },
      { colName: 'roomComplimentaryBenefits', values: COMPLIMENTARY_SUGGESTIONS },
      { colName: 'roomPurchasableBenefits', values: PURCHASABLE_SUGGESTIONS },
    ]
    seedData.forEach(async ({ colName, values }) => {
      try {
        const colRef = collection(db, colName)
        const snap = await getDocs(colRef)
        if (!snap.empty) return
        const batch = writeBatch(db)
        values.forEach((name) => batch.set(doc(colRef), { name, createdAt: serverTimestamp() }))
        await batch.commit()
      } catch (err) {
        console.error(`Failed to seed ${colName}:`, err)
        toast.error(`Could not seed ${colName} — check Firestore rules`)
      }
    })
  }, [])

  const isFirst = step === 0
  const isLast = step === STEPS.length - 1

  // Load existing room when editing
  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    getDoc(doc(db, COLLECTIONS.rooms, roomId))
      .then((snap) => {
        if (!snap.exists()) { toast.error('Room not found'); navigate(-1); return }
        const d = snap.data()
        setForm({
          name: d.name || '',
          description: d.description || '',
          capacity: d.capacity ?? '',
          maxOccupancy: d.maxOccupancy ?? '',
          price: d.price ?? '',
          tax: d.tax ?? '',
          noOfRooms: d.noOfRooms ?? '',
          bedType: d.bedType || '',
          bedTypeId: '',
          noOfBeds: d.noOfBeds ?? '',
          view: d.view || '',
          roomSizeSqft: d.roomSizeSqft ?? '',
          floor: d.floor || '',
          bathroomType: d.bathroomType || '',
          smokingAllowed: d.smokingAllowed || false,
          accessibilityFeatures: d.accessibilityFeatures || [],
          connectedRooms: d.connectedRooms || false,
          extraGuestCharge: d.extraGuestCharge ?? '',
          weekendPricingFri: d.weekendPricing?.fri ?? '',
          weekendPricingSat: d.weekendPricing?.sat ?? '',
          minStayNights: d.minStayNights ?? '',
          seasonalPricing: d.seasonalPricing || [],
          freeCancellation: d.freeCancellation || false,
          cancellationFreeBefore: d.cancellationPolicy?.freeBefore ?? '',
          cancellationRefundPercent: d.cancellationPolicy?.refundPercent ?? '',
          cancellationPolicyNote: d.cancellationPolicy?.policyNote || '',
          amenities: d.amenities || [],
          media: d.media || [],
          complimentaryBenefits: d.complimentaryBenefits || [],
          purchasableBenefits: d.purchasableBenefits || [],
        })
      })
      .catch((err) => toast.error('Failed to load: ' + err.message))
      .finally(() => setLoading(false))
  }, [isEdit, roomId, navigate])

  function set(patch) {
    setForm((p) => ({ ...p, ...patch }))
  }

  function num(v) {
    const n = Number(v)
    return isNaN(n) || v === '' ? null : n
  }

  function validateStep() {
    if (step === 0) {
      if (!form.name.trim()) { toast.error('Room category name is required'); return false }
      if (!form.price && form.price !== 0) { toast.error('Price per night is required'); return false }
      if (!form.capacity) { toast.error('Capacity is required'); return false }
    }
    return true
  }

  function handleNext() {
    if (!validateStep()) return
    setStep((s) => s + 1)
  }

  async function handleSave() {
    if (!validateStep()) return
    setSaving(true)
    try {
      const payload = {
        hotelId,
        name: form.name.trim(),
        description: form.description || null,
        capacity: num(form.capacity),
        maxOccupancy: num(form.maxOccupancy),
        price: num(form.price),
        tax: num(form.tax),
        noOfRooms: num(form.noOfRooms),
        bedType: form.bedType || null,
        noOfBeds: num(form.noOfBeds),
        view: form.view || null,
        roomSizeSqft: num(form.roomSizeSqft),
        floor: form.floor || null,
        bathroomType: form.bathroomType || null,
        smokingAllowed: form.smokingAllowed,
        accessibilityFeatures: form.accessibilityFeatures,
        connectedRooms: form.connectedRooms,
        extraGuestCharge: num(form.extraGuestCharge),
        weekendPricing: { fri: num(form.weekendPricingFri), sat: num(form.weekendPricingSat) },
        minStayNights: num(form.minStayNights),
        seasonalPricing: form.seasonalPricing,
        freeCancellation: form.freeCancellation,
        cancellationPolicy: {
          freeBefore: num(form.cancellationFreeBefore),
          refundPercent: num(form.cancellationRefundPercent),
          policyNote: form.cancellationPolicyNote || null,
        },
        amenities: form.amenities,
        media: form.media,
        complimentaryBenefits: form.complimentaryBenefits,
        purchasableBenefits: form.purchasableBenefits,
        updatedAt: serverTimestamp(),
      }

      if (isEdit) {
        await updateDoc(doc(db, COLLECTIONS.rooms, roomId), payload)
        toast.success('Room category updated')
      } else {
        payload.createdAt = serverTimestamp()
        await addDoc(collection(db, COLLECTIONS.rooms), payload)
        toast.success('Room category created')
      }
      navigate(`/add-hotel/rooms/${hotelId}`)
    } catch (err) {
      toast.error('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={32} className="text-brand-gold animate-spin" />
        <p className="text-brand-muted text-sm">Loading room…</p>
      </div>
    )
  }

  const CurrentStep = STEP_COMPONENTS[step]
  const currentStepMeta = STEPS[step]
  const StepIcon = currentStepMeta.icon

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky header ──────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-brand-surface border-b border-brand-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center shrink-0">
              <StepIcon size={18} className="text-brand-gold" />
            </div>
            <div>
              <h2 className="font-serif text-brand-gold text-xl font-semibold leading-tight">
                {currentStepMeta.label}
              </h2>
              <p className="text-brand-muted text-xs">{currentStepMeta.description}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/add-hotel/rooms/${hotelId}`)}
            className="text-brand-muted hover:text-brand-text p-1.5 rounded-lg hover:bg-brand-card transition-colors"
            title="Back to rooms"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Step progress pills */}
        <div className="flex items-center gap-1 px-6 pb-4">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              title={s.label}
              className={`h-1.5 rounded-full transition-all flex-1 ${
                i === step
                  ? 'bg-brand-gold'
                  : i < step
                  ? 'bg-brand-gold/40'
                  : 'bg-brand-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Scrollable content ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <CurrentStep form={form} set={set} lookup={lookup} />
      </div>

      {/* ── Sticky footer ──────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-brand-surface border-t border-brand-border px-6 py-4 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="md"
          disabled={isFirst}
          onClick={() => setStep((s) => s - 1)}
        >
          <ChevronLeft size={16} />
          Previous
        </Button>

        <span className="text-brand-muted text-xs shrink-0">
          {step + 1} / {STEPS.length}
        </span>

        {isLast ? (
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            <Save size={15} />
            {isEdit ? 'Save Changes' : 'Create Room'}
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={handleNext}>
            Next
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}
