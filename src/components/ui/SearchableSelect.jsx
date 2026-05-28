import { useState, useRef, useEffect } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ChevronDown, ChevronUp, Plus, Loader2 } from 'lucide-react'
import { db } from '../../firebase'
import useLookupCollection from '../../hooks/useLookupCollection'

export default function SearchableSelect({
  collectionName,
  seedValues = [],
  value = '',
  onSelect,
  label,
  placeholder = 'Select or search…',
  required = false,
  error,
}) {
  const { docs, loading } = useLookupCollection(collectionName, seedValues)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Resolve display name — support both doc ID and raw name as value
  const selected = docs.find((d) => d.id === value) || docs.find((d) => d.name?.toLowerCase() === value?.toLowerCase())
  const displayName = selected?.name ?? ''

  // Filter docs by search text
  const filtered = search
    ? docs.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
    : docs

  // Show "+ Add" only when typed text doesn't exactly match an existing doc
  const trimmed = search.trim()
  const showAdd = trimmed && !docs.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  // Focus the search input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function openDropdown() {
    setSearch('')
    setOpen(true)
  }

  function closeDropdown() {
    setOpen(false)
    setSearch('')
  }

  function selectDoc(d) {
    onSelect(d.id, d.name)
    closeDropdown()
  }

  async function handleAdd() {
    if (!trimmed) return
    setAdding(true)
    try {
      const existing = docs.find((d) => d.name.toLowerCase() === trimmed.toLowerCase())
      if (existing) {
        onSelect(existing.id, existing.name)
      } else {
        const docRef = await addDoc(collection(db, collectionName), {
          name: trimmed,
          createdAt: serverTimestamp(),
        })
        onSelect(docRef.id, trimmed)
      }
      closeDropdown()
    } catch (err) {
      console.error('SearchableSelect add failed:', err)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-brand-error ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        className={`form-input flex items-center justify-between gap-2
          ${!open ? 'cursor-pointer' : ''}
          ${open ? 'border-brand-gold' : ''}
          ${error ? 'form-input-error' : ''}
        `}
        onClick={!open ? openDropdown : undefined}
      >
        {open ? (
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-sm text-brand-text placeholder:text-brand-muted min-w-0"
            placeholder="Type to search or add new..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); if (showAdd) handleAdd() }
              if (e.key === 'Escape') closeDropdown()
            }}
          />
        ) : (
          <span className={`text-sm flex-1 truncate ${displayName ? 'text-brand-text' : 'text-brand-muted'}`}>
            {displayName || placeholder}
          </span>
        )}
        <button
          type="button"
          className="shrink-0 text-brand-muted hover:text-brand-text transition-colors"
          onClick={(e) => { e.stopPropagation(); open ? closeDropdown() : openDropdown() }}
        >
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {error && <p className="text-brand-error text-xs mt-0.5">{error}</p>}

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-brand-surface border border-brand-border rounded-xl shadow-dialog overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={16} className="text-brand-gold animate-spin" />
            </div>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-brand-text hover:bg-brand-card transition-colors capitalize"
                    onClick={() => selectDoc(d)}
                  >
                    {d.name}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && !showAdd && (
                <li className="px-4 py-3 text-brand-muted text-sm text-center">No options found</li>
              )}
            </ul>
          )}

          {showAdd && (
            <button
              type="button"
              disabled={adding}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-brand-gold
                         hover:bg-brand-card border-t border-brand-border transition-colors
                         disabled:opacity-50"
              onClick={handleAdd}
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add &ldquo;{trimmed}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
