import { useState, useCallback } from 'react'

const DRAFT_KEY = 'dreamland_hotel_draft'

export default function useDraft(initialData = {}) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) return { ...initialData, ...JSON.parse(saved) }
    } catch (_) {}
    return initialData
  })

  const update = useCallback((section, values) => {
    setData((prev) => {
      const next = { ...prev, ...values }
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
      } catch (_) {}
      return next
    })
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    setData(initialData)
  }, [initialData])

  const hasDraft = Object.keys(data).some(
    (k) => data[k] !== undefined && data[k] !== '' && data[k] !== null
  )

  return { data, update, clear, hasDraft }
}
