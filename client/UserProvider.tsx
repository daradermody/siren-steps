import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import api from './api.ts'
import type { User } from '../server/user_data.ts'

const UserContext = createContext<Pick<User, 'name' | 'team'> | undefined>(undefined)

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token') || localStorage.getItem('token')
    if (token) {
      api.interceptors.request.use(config => {
        config.headers.token =  token;
        return config;
      });
      api.get<User>(`/me`)
        .then(response => {
          setUser(JSON.parse(response.data as any))
          localStorage.setItem('token', token)
        })
        .catch(e => {
          console.error(e)
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return null
  }
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
