import { useCallback, useEffect, useState } from 'react'

type AsyncFunction<R, P extends any[] = []> = (...params: P) => R | Promise<R>

export function useQuery<R>(fn: AsyncFunction<R>) {
  const {data, loading, error, fetch} = useDelayedQuery<R>(fn)
  useEffect(() => void fetch(), [fetch])
  return {data, loading, error, refetch: fetch}
}

export function useDelayedQuery<R, P extends any[] = []>(fn: AsyncFunction<R, P>) {
  const [data, setData] = useState<R>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()

  const fetch = useCallback(async (...params: P) => {
    setLoading(true)
    try {
      setData(await fn(...params))
    } catch(e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [setLoading, setData, setError])

  return {data, loading, error, fetch}
}
