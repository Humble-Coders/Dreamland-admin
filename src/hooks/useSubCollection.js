import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Real-time hook for any sub-collection filtered by hotelId.
 * Returns [] immediately when hotelId is falsy (no Firestore call made).
 *
 * usage:
 *   const { docs, loading, error } = useSubCollection('attractions', hotelId)
 */
export default function useSubCollection(collectionName, hotelId) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(!!hotelId)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!hotelId) {
      setDocs([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const q = query(
      collection(db, collectionName),
      where('hotelId', '==', hotelId)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setDocs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setLoading(false)
      },
      (err) => {
        console.error(`useSubCollection(${collectionName}) error:`, err)
        setError(err.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [collectionName, hotelId])

  return { docs, loading, error }
}
