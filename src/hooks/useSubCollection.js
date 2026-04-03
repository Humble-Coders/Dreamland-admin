import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Real-time hook for any sub-collection filtered by hotelId.
 * Returns [] immediately when hotelId is falsy (no Firestore call made).
 *
 * usage:
 *   const { docs, loading } = useSubCollection('attractions', hotelId)
 */
export default function useSubCollection(collectionName, hotelId) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(!!hotelId)

  useEffect(() => {
    if (!hotelId) {
      setDocs([])
      setLoading(false)
      return
    }

    setLoading(true)
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
        setLoading(false)
      }
    )

    return unsubscribe
  }, [collectionName, hotelId])

  return { docs, loading }
}
