import { useEffect, useState } from 'react'
import { batches as fallbackBatches } from './batches'

// Fetches the live batch list from /api/batches (backed by D1, admin-editable
// via /admin/batches — see issue #15) and falls back to the static
// batches.js list if the request fails or the API isn't deployed yet.
// The promise is memoized at module scope so every component calling this
// hook (Batches, each CoursesCard) shares one request instead of firing one
// per card.
let cachedPromise = null

function fetchBatches() {
    if (!cachedPromise) {
        cachedPromise = fetch('/api/batches')
            .then((res) => {
                if (!res.ok) {
                    throw new Error('bad response')
                }
                return res.json()
            })
            .then((data) => (Array.isArray(data) && data.length ? data : fallbackBatches))
            .catch(() => fallbackBatches)
    }
    return cachedPromise
}

export function useBatches() {
    let [batches, setBatches] = useState(fallbackBatches)
    let [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        fetchBatches().then((data) => {
            if (!cancelled) {
                setBatches(data)
                setLoading(false)
            }
        })
        return () => {
            cancelled = true
        }
    }, [])

    return { batches, loading }
}
