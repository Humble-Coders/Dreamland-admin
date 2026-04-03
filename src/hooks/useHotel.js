import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../schema'

export default function useHotel(hotelId) {
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(!!hotelId)

  useEffect(() => {
    if (!hotelId) { setLoading(false); return }
    setLoading(true)
    const unsubscribe = onSnapshot(
      doc(db, COLLECTIONS.hotels, hotelId),
      (snap) => {
        setHotel(snap.exists() ? { id: snap.id, ...snap.data() } : null)
        setLoading(false)
      },
      (err) => {
        console.error('useHotel error:', err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [hotelId])

  return { hotel, loading }
}
