import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../schema'
import { SECTIONS } from '../sections'
import useHotel from '../hooks/useHotel'
import useSubCollection from '../hooks/useSubCollection'
import SectionDialog from '../components/SectionDialog'
import RoomDialog from '../components/RoomDialog'
import Badge from '../components/ui/Badge'
import StorageImage from '../components/StorageImage'
import {
  ArrowLeft, Star, MapPin, Phone, Mail, Globe, Clock, Loader2,
  BedDouble, Pencil, Utensils, SquareParking, ShieldCheck,
  Sparkles, Users, IndianRupee, CheckCircle2, XCircle, Plus,
  Link2, Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'

const HIDDEN_SECTIONS = new Set(['transport', 'categories', 'activity'])

function StarDisplay({ count = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} fill={i <= count ? 'currentColor' : 'none'}
          className={i <= count ? 'text-brand-gold' : 'text-brand-border'} />
      ))}
    </div>
  )
}

function Flag({ ok }) {
  return ok
    ? <CheckCircle2 size={15} className="text-brand-success shrink-0" />
    : <XCircle size={15} className="text-brand-error/40 shrink-0" />
}

function InfoRow({ label, value, icon: Icon }) {
  if (!value && value !== 0 && value !== false) return null
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-brand-border/50 last:border-0">
      {Icon && <Icon size={14} className="text-brand-muted shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <p className="text-brand-muted text-xs uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-brand-text text-sm">{value}</p>
      </div>
    </div>
  )
}

function SectionCard({ title, onEdit, children, empty, emptyMsg }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border">
        <h3 className="font-medium text-brand-text text-sm">{title}</h3>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 text-brand-muted hover:text-brand-gold text-xs transition-colors px-2.5 py-1 rounded-lg hover:bg-brand-gold/10 border border-transparent hover:border-brand-gold/20">
          <Pencil size={11} /> Edit
        </button>
      </div>
      <div className="px-5 py-4">
        {empty ? (
          <p className="text-brand-muted text-sm italic">{emptyMsg || 'Not configured'}</p>
        ) : children}
      </div>
    </div>
  )
}

const BED_LABELS = { single: 'Single', twin: 'Twin', double: 'Double', queen: 'Queen', king: 'King', bunk: 'Bunk' }

export default function HotelDetail() {
  const { hotelId } = useParams()
  const navigate = useNavigate()
  const { hotel, loading: hotelLoading } = useHotel(hotelId)
  const { docs: rooms, loading: roomsLoading } = useSubCollection(COLLECTIONS.rooms, hotelId)

  const [formData, setFormData] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const [openSection, setOpenSection] = useState(null)
  const [roomDialog, setRoomDialog] = useState(null)
  const autoSaveTimer = useRef(null)

  useEffect(() => {
    if (hotel && !initialized) {
      const { id, createdAt, updatedAt, status, ...fields } = hotel
      setFormData(fields)
      setInitialized(true)
    }
  }, [hotel, initialized])

  const handleChange = useCallback((patch) => {
    setFormData((prev) => {
      const next = { ...prev, ...patch }
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(async () => {
        try {
          await updateDoc(doc(db, COLLECTIONS.hotels, hotelId), { ...patch, updatedAt: serverTimestamp() })
          toast.success('Saved')
        } catch (err) {
          toast.error('Save failed: ' + err.message)
        }
      }, 1500)
      return next
    })
  }, [hotelId])

  const visibleSections = SECTIONS.filter((s) => !HIDDEN_SECTIONS.has(s.id))

  function openEdit(sectionId) {
    const idx = visibleSections.findIndex((s) => s.id === sectionId)
    if (idx !== -1) setOpenSection(idx)
  }

  if (hotelLoading || !initialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={32} className="text-brand-gold animate-spin" />
        <p className="text-brand-muted text-sm">Loading hotel…</p>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-brand-text font-serif text-xl">Hotel not found</p>
        <button onClick={() => navigate('/hotels')} className="text-brand-gold text-sm hover:underline">← Back to hotels</button>
      </div>
    )
  }

  const data = formData || {}
  const statusVariant = hotel.status === 'ACTIVE' ? 'active' : hotel.status === 'DRAFT' ? 'draft' : 'inactive'

  return (
    <div className="pb-20">
      {/* ── Back nav ───────────────────────────────────────────── */}
      <div className="px-6 lg:px-8 pt-6">
        <button onClick={() => navigate('/hotels')}
          className="text-brand-muted hover:text-brand-gold text-sm font-medium flex items-center gap-1.5 mb-4 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-card border border-transparent hover:border-brand-border">
          <ArrowLeft size={14} /> All Hotels
        </button>
      </div>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative h-72 sm:h-96 bg-brand-surface mx-0">
        <StorageImage src={hotel.photos?.[0]} alt={hotel.name}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-8 pb-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge label={hotel.status ?? 'draft'} variant={statusVariant} />
                {hotel.isLuxury && <Badge label="Luxury" variant="complete" />}
                {hotel.hotelType && <Badge label={hotel.hotelType} variant="draft" />}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                {hotel.name || 'Untitled Hotel'}
              </h1>
              {(hotel.city || hotel.country) && (
                <p className="text-white/70 flex items-center gap-1.5 mt-1.5 text-sm">
                  <MapPin size={14} />
                  {[hotel.city, hotel.country].filter(Boolean).join(', ')}
                </p>
              )}
              {hotel.starRating > 0 && (
                <div className="mt-2">
                  <StarDisplay count={hotel.starRating} />
                </div>
              )}
            </div>
            <button onClick={() => openEdit('basicInfo')}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm hover:bg-white/20 transition-colors">
              <Pencil size={13} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* ── Photo strip ────────────────────────────────────────── */}
      {hotel.photos?.length > 1 && (
        <div className="flex gap-2 px-6 lg:px-8 py-4 overflow-x-auto">
          {hotel.photos.slice(1, 6).map((url, i) => (
            <div key={i} className="shrink-0 w-24 h-16 rounded-xl overflow-hidden border border-brand-border">
              <StorageImage src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {hotel.photos.length > 6 && (
            <button onClick={() => openEdit('media')}
              className="shrink-0 w-24 h-16 rounded-xl border-2 border-dashed border-brand-border flex items-center justify-center text-brand-muted hover:border-brand-gold hover:text-brand-gold text-xs transition-colors">
              +{hotel.photos.length - 6} more
            </button>
          )}
        </div>
      )}

      {/* ── Description ────────────────────────────────────────── */}
      {hotel.description && (
        <div className="px-6 lg:px-8 py-2">
          <p className="text-brand-muted text-sm leading-relaxed max-w-3xl">{hotel.description}</p>
        </div>
      )}

      {/* ── Main content grid ──────────────────────────────────── */}
      <div className="px-6 lg:px-8 mt-6 space-y-4">

        {/* Row 1: Contact + Check-In/Out */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Contact" onEdit={() => openEdit('contact')}
            empty={!hotel.contactPhone && !hotel.contactEmail}>
            <div>
              <InfoRow icon={Phone} label="Phone" value={hotel.contactPhone} />
              <InfoRow icon={Mail} label="Email" value={hotel.contactEmail} />
              <InfoRow icon={Globe} label="Website" value={hotel.website} />
              {hotel.socialLinks && (
                <InfoRow icon={Link2} label="Social" value={hotel.socialLinks} />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Check-In / Check-Out" onEdit={() => openEdit('checkInOut')}
            empty={!hotel.checkInTime && !hotel.checkOutTime}>
            <div>
              <InfoRow icon={Clock} label="Check-In" value={hotel.checkInTime} />
              <InfoRow icon={Clock} label="Check-Out" value={hotel.checkOutTime} />
              <div className="flex gap-4 mt-3 pt-2 border-t border-brand-border/50">
                <div className="flex items-center gap-2">
                  <Flag ok={hotel.earlyCheckInAllowed} />
                  <span className="text-brand-muted text-xs">
                    Early Check-In{hotel.earlyCheckInAllowed && hotel.earlyCheckInPrice ? ` (₹${hotel.earlyCheckInPrice})` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag ok={hotel.lateCheckOutAllowed} />
                  <span className="text-brand-muted text-xs">
                    Late Check-Out{hotel.lateCheckOutAllowed && hotel.lateCheckOutPrice ? ` (₹${hotel.lateCheckOutPrice})` : ''}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Row 2: Location */}
        <SectionCard title="Location" onEdit={() => openEdit('location')}
          empty={!hotel.address && !hotel.city}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <InfoRow icon={MapPin} label="Address" value={hotel.address} />
              <InfoRow label="City" value={hotel.city} />
              <InfoRow label="Country" value={hotel.country} />
              <InfoRow label="Pincode" value={hotel.pincode} />
            </div>
            {(hotel.latitude || hotel.longitude) && (
              <div>
                <InfoRow label="Latitude" value={hotel.latitude} />
                <InfoRow label="Longitude" value={hotel.longitude} />
              </div>
            )}
          </div>
        </SectionCard>

        {/* Row 3: Food + Parking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Food & Dining" onEdit={() => openEdit('foodDining')}
            empty={!hotel.mealPlansAvailable?.length && !hotel.cuisines?.length}>
            <div className="space-y-3">
              {hotel.mealPlansAvailable?.length > 0 && (
                <div>
                  <p className="form-label mb-2">Meal Plans</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.mealPlansAvailable.map((plan) => (
                      <Badge
                        key={plan.value ?? plan}
                        label={plan.price > 0 ? `${plan.value ?? plan} — ₹${plan.price}` : (plan.value ?? plan)}
                        variant="default"
                      />
                    ))}
                  </div>
                </div>
              )}
              {hotel.cuisines?.length > 0 && (
                <div>
                  <p className="form-label mb-2">Cuisines</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.cuisines.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-text text-xs">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Parking" onEdit={() => openEdit('parking')}
            empty={!hotel.parkingAvailable}>
            {hotel.parkingAvailable ? (
              <div className="space-y-1">
                <InfoRow icon={SquareParking} label="Parking Type" value={hotel.parkingType} />
                <InfoRow label="Parking Category" value={hotel.parkingCategory} />
                {hotel.parkingSpots > 0 && (
                  <InfoRow label="Total Spots" value={`${hotel.parkingSpots} spots`} />
                )}
              </div>
            ) : (
              <p className="text-brand-muted text-sm italic">Parking not available</p>
            )}
          </SectionCard>
        </div>

        {/* Row 4: Property Highlights */}
        {hotel.highlights?.length > 0 && (
          <SectionCard title="Property Highlights" onEdit={() => openEdit('propertyHighlights')}>
            <div className="flex flex-wrap gap-2">
              {hotel.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-brand-bg border border-brand-border rounded-xl">
                  <Sparkles size={13} className="text-brand-gold shrink-0" />
                  <div>
                    <p className="text-brand-text text-xs font-medium">{h.title}</p>
                    {h.category && <p className="text-brand-muted text-[10px]">{h.category}</p>}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Row 5: Policies */}
        <SectionCard title="Policies & Compliance" onEdit={() => openEdit('policiesCompliance')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            <div>
              <div className="flex items-center gap-2 py-1.5 border-b border-brand-border/50">
                <Flag ok={hotel.pdfRequired} />
                <span className="text-brand-text text-sm">ID / PDF Required at Check-In</span>
              </div>
              <div className="flex items-center gap-2 py-1.5 border-b border-brand-border/50">
                <Flag ok={hotel.privacyPremium} />
                <span className="text-brand-text text-sm">Privacy Premium Room</span>
              </div>
              <div className="flex items-center gap-2 py-1.5">
                <Flag ok={hotel.petPolicy} />
                <span className="text-brand-text text-sm">Pets Allowed</span>
              </div>
            </div>
            <div>
              {hotel.ageRestriction > 0 && (
                <div className="py-1.5 border-b border-brand-border/50">
                  <p className="text-brand-muted text-xs uppercase tracking-wider mb-0.5">Min Age</p>
                  <p className="text-brand-text text-sm">{hotel.ageRestriction}+ years</p>
                </div>
              )}
              {hotel.customPolicies?.length > 0 && (
                <div className="py-1.5">
                  <p className="text-brand-muted text-xs uppercase tracking-wider mb-1.5">Custom Policies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.customPolicies.map((p) => (
                      <span key={p} className="px-2.5 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-muted text-xs">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Room Categories ─────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-bold text-brand-text">Room Categories</h2>
            <button onClick={() => navigate(`/add-hotel/rooms/${hotelId}`)}
              className="flex items-center gap-2 px-3 py-2 text-brand-muted hover:text-brand-gold text-sm transition-colors rounded-xl hover:bg-brand-card border border-transparent hover:border-brand-border">
              <Plus size={14} /> Manage Rooms
            </button>
          </div>

          {roomsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="text-brand-gold animate-spin" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-brand-card border border-brand-border rounded-2xl">
              <BedDouble size={32} className="text-brand-border mb-3" />
              <p className="text-brand-muted text-sm">No room categories configured</p>
              <button onClick={() => navigate(`/add-hotel/rooms/${hotelId}`)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-bg rounded-xl text-sm font-medium hover:bg-brand-gold-light transition-colors">
                <Plus size={14} /> Add Room Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <button key={room.id} type="button" onClick={() => setRoomDialog(room)}
                  className="section-card text-left flex flex-col gap-3">
                  {/* Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center shrink-0">
                        <BedDouble size={17} className="text-brand-gold" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-brand-text font-medium text-sm truncate">{room.name}</p>
                        <p className="text-brand-muted text-xs mt-0.5 flex items-center gap-2 flex-wrap">
                          {room.capacity > 0 && <span className="flex items-center gap-1"><Users size={10} /> {room.capacity} guests</span>}
                          {room.price > 0 && <span className="flex items-center gap-1"><IndianRupee size={10} /> {room.price.toLocaleString('en-IN')}/night</span>}
                        </p>
                      </div>
                    </div>
                    <Badge label={room.available !== false ? 'available' : 'unavailable'} variant={room.available !== false ? 'complete' : 'inactive'} />
                  </div>
                  {/* Bottom */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {room.bedType && <Badge label={BED_LABELS[room.bedType] || room.bedType} variant="default" />}
                    {room.view && <Badge label={room.view} variant="draft" />}
                    {room.amenities?.length > 0 && (
                      <span className="text-brand-muted text-xs ml-auto">{room.amenities.length} amenities</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Section edit dialog ─────────────────────────────────── */}
      {openSection !== null && formData && (
        <SectionDialog
          sections={visibleSections}
          sectionIndex={openSection}
          onClose={() => setOpenSection(null)}
          onNavigate={(idx) => setOpenSection(idx)}
          data={formData}
          onChange={handleChange}
          errors={{}}
          hotelId={hotelId}
        />
      )}

      {/* ── Room edit dialog ────────────────────────────────────── */}
      {roomDialog && (
        <RoomDialog
          hotelId={hotelId}
          room={roomDialog}
          onClose={() => setRoomDialog(null)}
        />
      )}
    </div>
  )
}
