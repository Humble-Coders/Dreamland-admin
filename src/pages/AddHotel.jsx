import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import {
  CheckCircle2, Circle, AlertCircle, Send, Plus,
  FileText, Loader2, Clock, MapPin, Building2, Trash2, TriangleAlert,
  BedDouble, ArrowUpRight,
} from 'lucide-react'
import { db } from '../firebase'
import { COLLECTIONS, SECTION_REQUIRED_FIELDS } from '../schema'
import { SECTIONS } from '../sections'
import SectionDialog from '../components/SectionDialog'
import useHotels from '../hooks/useHotels'
import useHotel from '../hooks/useHotel'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import StorageImage from '../components/StorageImage'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  isActive: true,
  isLuxury: false,
  checkInTime: '',
  checkOutTime: '',
  earlyCheckInFee: false,
  lateCheckOutFee: false,
  parkingAvailable: false,
  pdfRequired: false,
  privacyPremium: false,
  petPolicy: false,
  foodInclusivity: false,
  photos: [],
  modes: [],
  mealPlansAvailable: [],
  highlights: [],
}

function isMeaningfulValue(v) {
  if (typeof v === 'boolean') return false
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'number') return !isNaN(v) && v > 0
  return v !== undefined && v !== '' && v !== null
}

function getSectionStatus(sectionId, data) {
  const requiredFields = SECTION_REQUIRED_FIELDS[sectionId] || []
  if (requiredFields.length === 0) {
    const keys = getSectionKeys(sectionId)
    return keys.some((k) => isMeaningfulValue(data[k])) ? 'complete' : 'empty'
  }
  const allFilled = requiredFields.every((f) => isMeaningfulValue(data[f]))
  const anyFilled = requiredFields.some((f) => isMeaningfulValue(data[f]))
  if (allFilled) return 'complete'
  if (anyFilled) return 'partial'
  return 'empty'
}

function getSectionKeys(sectionId) {
  const map = {
    basicInfo: ['name', 'description', 'hotelType', 'starRating', 'totalRooms'],
    contact: ['contactPhone', 'contactEmail', 'socialLinks', 'website'],
    checkInOut: ['checkInTime', 'checkOutTime'],
    location: ['address', 'city', 'country', 'pincode', 'latitude', 'longitude'],
    media: ['photos'],
    transport: ['modes'],
    foodDining: ['mealPlansAvailable'],
    parking: ['parkingType', 'parkingSpots'],
    propertyHighlights: ['highlights'],
    policiesCompliance: ['ageRestriction'],
    categories: [], attractions: [], activity: [], reviews: [],
  }
  return map[sectionId] || []
}

function validateAll(data) {
  const allErrors = {}
  for (const [sectionId, fields] of Object.entries(SECTION_REQUIRED_FIELDS)) {
    const sectionErrors = {}
    for (const field of fields) {
      if (!isMeaningfulValue(data[field])) {
        sectionErrors[field] = 'This field is required'
      }
    }
    if (Object.keys(sectionErrors).length > 0) allErrors[sectionId] = sectionErrors
  }
  return allErrors
}

// Strip lookup-reference IDs before writing to Firestore.
// The actual value (name) is already stored in the sibling field without the "Id" suffix.
function prepareForSave(data) {
  const { parkingTypeId, parkingCategoryId, ...rest } = data
  if (rest.highlights) {
    rest.highlights = rest.highlights.map(({ categoryId, amenityTypeId, ...h }) => h)
  }
  return rest
}

function formatDate(ts) {
  if (!ts) return ''
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '' }
}

// ─── Landing Page — shows drafts + "Add New Hotel" ───────────────────────────

function AddHotelLanding() {
  const navigate = useNavigate()
  const { hotels, loading } = useHotels()

  const drafts = hotels.filter((h) => h.status === 'draft')

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <div className="mb-7">
        <h1 className="font-serif text-4xl font-bold text-brand-text">Add Hotel</h1>
        <p className="text-brand-muted mt-1">Start a new hotel or continue editing a draft</p>
      </div>

      {/* New hotel CTA */}
      <button
        onClick={() => navigate('/add-hotel?new=1')}
        className="w-full flex items-center justify-center gap-3 py-6 rounded-2xl border-2 border-dashed
                   border-brand-gold/40 hover:border-brand-gold bg-brand-gold/5 hover:bg-brand-gold/10
                   text-brand-gold transition-all duration-150 mb-8 group"
      >
        <Plus size={22} className="group-hover:scale-110 transition-transform" />
        <span className="font-serif text-lg font-semibold">Add New Hotel</span>
      </button>

      {/* Draft hotels */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={30} className="text-brand-gold animate-spin" />
        </div>
      ) : drafts.length > 0 ? (
        <div>
          <h2 className="text-brand-muted text-xs uppercase tracking-widest font-medium mb-4">
            Draft Hotels — {drafts.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {drafts.map((hotel) => (
              <button
                key={hotel.id}
                onClick={() => navigate(`/add-hotel?id=${hotel.id}`)}
                className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden text-left
                           hover:border-brand-gold/50 transition-all duration-150 group"
              >
                {/* Cover image */}
                <div className="h-32 bg-brand-surface relative">
                  {hotel.photos?.[0] ? (
                    <StorageImage
                      src={hotel.photos[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={32} className="text-brand-border" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge label="Draft" variant="draft" />
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <p className="font-serif text-brand-gold font-semibold truncate">
                    {hotel.name || 'Untitled Hotel'}
                  </p>
                  {(hotel.city || hotel.country) && (
                    <p className="text-brand-muted text-xs flex items-center gap-1">
                      <MapPin size={11} />
                      {[hotel.city, hotel.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {hotel.updatedAt && (
                    <p className="text-brand-muted text-xs flex items-center gap-1">
                      <Clock size={11} />
                      Last edited {formatDate(hotel.updatedAt)}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText size={36} className="text-brand-border mx-auto mb-3" />
          <p className="text-brand-muted text-sm">No draft hotels yet</p>
        </div>
      )}
    </div>
  )
}

// ─── Editor — full form with auto-save ───────────────────────────────────────

function AddHotelEditor({ initialHotelId }) {
  const navigate = useNavigate()

  // hotelId managed as local state so it can be set after first save in "new" mode
  const [hotelId, setHotelId] = useState(initialHotelId)
  const { hotel, loading: hotelLoading } = useHotel(hotelId)

  const [formData, setFormData] = useState(DEFAULT_FORM)
  // New mode starts as already initialized (no Firestore read needed)
  const [initialized, setInitialized] = useState(!initialHotelId)
  const [openSection, setOpenSection] = useState(null)
  const [errors, setErrors] = useState({})
  const [publishing, setPublishing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const autoSaveTimer = useRef(null)
  const pendingSaveData = useRef(null)
  // Track if we're creating the first doc (prevents double-creation)
  const creatingRef = useRef(false)

  // Populate form from Firestore when editing an existing hotel
  useEffect(() => {
    if (hotel && !initialized) {
      const { id, createdAt, updatedAt, status, ...fields } = hotel
      setFormData({ ...DEFAULT_FORM, ...fields })
      setInitialized(true)
    }
    if (!hotelLoading && !hotel && !initialized) setInitialized(true)
  }, [hotel, hotelLoading, initialized])

  // Auto-save: create doc on first save if new, otherwise update
  const performAutoSave = useCallback(async (data) => {
    const { draftCategories, draftAttractions, draftActivities, ...raw } = data
    const hotelFields = prepareForSave(raw)
    try {
      setAutoSaving(true)
      if (hotelId) {
        // Update existing doc
        await updateDoc(doc(db, COLLECTIONS.hotels, hotelId), {
          ...hotelFields,
          status: 'draft',
          updatedAt: serverTimestamp(),
        })
      } else {
        // Create new doc on first save
        if (creatingRef.current) return
        creatingRef.current = true
        const ref = await addDoc(collection(db, COLLECTIONS.hotels), {
          ...hotelFields,
          status: 'draft',
          isActive: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setHotelId(ref.id)
        // Update URL without remounting (replace so back button works correctly)
        navigate(`/add-hotel?id=${ref.id}`, { replace: true })
      }
      setIsDirty(false)
    } catch (err) {
      console.error('Auto-save failed:', err)
      creatingRef.current = false
    } finally {
      setAutoSaving(false)
    }
  }, [hotelId, navigate])

  const handleChange = useCallback((patch) => {
    setFormData((prev) => {
      const next = { ...prev, ...patch }
      pendingSaveData.current = next

      // Debounce auto-save — 1.5s after last change
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        performAutoSave(next)
      }, 1500)

      return next
    })
    setIsDirty(true)

    // Clear field errors
    setErrors((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(patch)) {
        for (const sectionId of Object.keys(next)) {
          if (next[sectionId]?.[key]) {
            const { [key]: _, ...rest } = next[sectionId]
            if (Object.keys(rest).length === 0) delete next[sectionId]
            else next[sectionId] = rest
          }
        }
      }
      return next
    })
  }, [performAutoSave])

  // Keep refs in sync for use in cleanup (avoid stale closures)
  const isDirtyRef = useRef(false)
  const hotelIdRef = useRef(hotelId)
  useEffect(() => { isDirtyRef.current = isDirty }, [isDirty])
  useEffect(() => { hotelIdRef.current = hotelId }, [hotelId])

  // Warn on browser close / refresh while dirty
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!isDirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Save on unmount (in-app navigation away from this page)
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      if (!isDirtyRef.current) return
      const data = pendingSaveData.current
      if (!data) return
      const { draftCategories, draftAttractions, draftActivities, ...raw } = data
      const hotelFields = prepareForSave(raw)
      if (hotelIdRef.current) {
        // Fire-and-forget: saves to Firestore when navigating away
        updateDoc(doc(db, COLLECTIONS.hotels, hotelIdRef.current), {
          ...hotelFields, status: 'draft', updatedAt: serverTimestamp(),
        }).then(() => toast.success('Draft saved automatically')).catch(() => {})
      } else if (!creatingRef.current) {
        // Never saved yet — create the doc before leaving
        creatingRef.current = true
        addDoc(collection(db, COLLECTIONS.hotels), {
          ...hotelFields, status: 'draft', isActive: false,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        }).then(() => toast.success('Draft saved automatically')).catch(() => {})
      }
    }
  }, [])

  async function handlePublish() {
    const allErrors = validateAll(formData)
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      const firstId = Object.keys(allErrors)[0]
      const idx = SECTIONS.findIndex((s) => s.id === firstId)
      if (idx !== -1) setOpenSection(idx)
      toast.error('Please fill all required fields')
      return
    }

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setPublishing(true)
    try {
      const { draftCategories, draftAttractions, draftActivities, ...raw } = formData
      const hotelFields = prepareForSave(raw)

      if (hotelId) {
        await updateDoc(doc(db, COLLECTIONS.hotels, hotelId), {
          ...hotelFields, status: 'active', updatedAt: serverTimestamp(),
        })
      } else {
        // First-time publish from new mode
        await addDoc(collection(db, COLLECTIONS.hotels), {
          ...hotelFields, status: 'active', isActive: true,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        })
      }

      setIsDirty(false)
      toast.success('Hotel published!')
      navigate('/hotels', { replace: true })
    } catch (err) {
      toast.error('Failed to publish: ' + err.message)
    } finally {
      setPublishing(false)
    }
  }

  async function handleDelete() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setDeleting(true)
    try {
      if (hotelId) {
        await deleteDoc(doc(db, COLLECTIONS.hotels, hotelId))
        toast.success('Hotel deleted')
      }
      setIsDirty(false)
      navigate('/add-hotel', { replace: true })
    } catch (err) {
      toast.error('Failed to delete: ' + err.message)
      setDeleting(false)
    }
    setShowDeleteDialog(false)
  }

  if (hotelLoading || !initialized) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
        <Loader2 size={36} className="text-brand-gold animate-spin" />
        <p className="text-brand-muted text-sm">Loading hotel…</p>
      </div>
    )
  }

  const HIDDEN_SECTIONS = new Set(['transport', 'categories', 'activity'])
  const visibleSections = SECTIONS.filter((s) => !HIDDEN_SECTIONS.has(s.id))

  const statusVariant = { complete: 'complete', partial: 'partial', empty: 'empty' }
  const completedCount = visibleSections.filter(
    (s) => !s.usesHotelId && getSectionStatus(s.id, formData) === 'complete'
  ).length
  const totalRequired = visibleSections.length

  return (
    <div className="p-6 lg:p-8 pb-32 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate('/add-hotel')}
            className="text-brand-muted hover:text-brand-gold text-sm font-medium flex items-center gap-1.5 mb-3 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-card border border-transparent hover:border-brand-border"
          >
            ← Back to drafts
          </button>
          <h1 className="font-serif text-3xl font-bold text-brand-text">
            {formData.name || 'Untitled Hotel'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge label="Draft" variant="draft" />
            {autoSaving && (
              <span className="text-brand-muted text-xs flex items-center gap-1">
                <Loader2 size={11} className="animate-spin" /> Saving…
              </span>
            )}
            {!autoSaving && !isDirty && initialized && hotelId && (
              <span className="text-brand-muted text-xs">All changes saved</span>
            )}
            {!hotelId && (
              <span className="text-brand-muted text-xs">Will save on first change</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="md" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 size={15} className="text-brand-error" />
            <span className="text-brand-error">Delete</span>
          </Button>
          <Button variant="primary" size="md" loading={publishing} onClick={handlePublish}>
            <Send size={15} />
            Publish Hotel
          </Button>
        </div>
      </div>

      {/* Global error banner */}
      {Object.keys(errors).length > 0 && (
        <div className="flex items-center gap-3 bg-brand-error/10 border border-brand-error/30 rounded-xl px-5 py-4 mb-6">
          <AlertCircle size={18} className="text-brand-error shrink-0" />
          <p className="text-brand-text text-sm">
            Some required sections are incomplete. Sections with issues are highlighted below.
          </p>
        </div>
      )}

      {/* Sections grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleSections.map((section, visibleIdx) => {
          const status = getSectionStatus(section.id, formData)
          const hasError = !!errors[section.id]
          const SectionIcon = section.icon

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setOpenSection(visibleIdx)}
              className={`section-card text-left flex flex-col gap-3 ${
                hasError ? 'border-brand-error/60 bg-brand-error/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center shrink-0">
                    <SectionIcon size={17} className="text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-brand-text font-medium text-sm">{section.label}</p>
                    <p className="text-brand-muted text-xs mt-0.5">{section.description}</p>
                  </div>
                </div>
                {status === 'complete' && !hasError ? (
                  <CheckCircle2 size={18} className="text-brand-success shrink-0" />
                ) : hasError ? (
                  <AlertCircle size={18} className="text-brand-error shrink-0" />
                ) : (
                  <Circle size={18} className="text-brand-border shrink-0" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <Badge
                  label={hasError ? 'Required' : status}
                  variant={hasError ? 'inactive' : statusVariant[status]}
                />
                {section.required && <span className="text-brand-muted text-xs">Required</span>}
                {section.readOnly && <span className="text-brand-muted text-xs">Read-only</span>}
              </div>
            </button>
          )
        })}

        {/* Rooms — navigates to dedicated rooms management page */}
        <button
          type="button"
          onClick={() => {
            if (!hotelId) {
              toast.error('Save the hotel as a draft first to manage rooms')
              return
            }
            navigate(`/add-hotel/rooms/${hotelId}`)
          }}
          className="section-card text-left flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center shrink-0">
                <BedDouble size={17} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-brand-text font-medium text-sm">Room Categories</p>
                <p className="text-brand-muted text-xs mt-0.5">Manage room types, pricing & amenities</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-brand-muted shrink-0 mt-0.5" />
          </div>
          <div className="flex items-center justify-between">
            <Badge label={hotelId ? 'manage' : 'save draft first'} variant={hotelId ? 'partial' : 'draft'} />
            <span className="text-brand-muted text-xs">Opens new page</span>
          </div>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-8 bg-brand-card rounded-2xl border border-brand-border p-5">
        <p className="text-brand-muted text-sm mb-3">Completion Progress</p>
        <div className="flex gap-1.5 mb-2">
          {visibleSections.map((s) => {
            const st = s.usesHotelId ? 'empty' : getSectionStatus(s.id, formData)
            return (
              <div
                key={s.id}
                className={`h-2 flex-1 rounded-full ${
                  st === 'complete' ? 'bg-brand-gold' : st === 'partial' ? 'bg-brand-warning' : 'bg-brand-border'
                }`}
                title={s.label}
              />
            )
          })}
        </div>
        <p className="text-brand-muted text-xs">{completedCount} / {totalRequired} sections complete</p>
      </div>

      {/* Section dialog */}
      {openSection !== null && (
        <SectionDialog
          sections={visibleSections}
          sectionIndex={openSection}
          onClose={() => setOpenSection(null)}
          onNavigate={(idx) => setOpenSection(idx)}
          data={formData}
          onChange={handleChange}
          errors={errors}
          hotelId={hotelId}
        />
      )}

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div
          className="dialog-overlay"
          onClick={() => !deleting && setShowDeleteDialog(false)}
        >
          <div
            className="bg-brand-surface border border-brand-border rounded-2xl shadow-dialog w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-error/10 border border-brand-error/30 flex items-center justify-center shrink-0">
                <TriangleAlert size={20} className="text-brand-error" />
              </div>
              <div>
                <h2 className="font-serif text-brand-text text-lg font-semibold">Delete Hotel?</h2>
                <p className="text-brand-muted text-xs">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-brand-muted text-sm mb-6">
              <span className="text-brand-text font-medium">{formData.name || 'This hotel'}</span> and all its data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="md"
                className="flex-1"
                disabled={deleting}
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-error text-white rounded-lg text-sm font-medium hover:bg-brand-error/90 transition-colors disabled:opacity-60"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                {deleting ? 'Deleting…' : 'Delete Hotel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Root — routes between landing and editor ─────────────────────────────────

export default function AddHotel() {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  const isNew = searchParams.get('new') === '1'

  if (!editId && !isNew) return <AddHotelLanding />
  // Use editId as key so the component fully remounts when switching between different hotels.
  // For new mode, key is 'new' — stable until the first auto-save updates the URL to ?id=xxx.
  return <AddHotelEditor key={editId || 'new'} initialHotelId={editId} />
}
