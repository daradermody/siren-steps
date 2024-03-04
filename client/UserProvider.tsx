import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import client from './api/client.ts'
import type { User } from '../server/user_data.ts'

interface UserContextValue {
  user?: Pick<User, 'name' | 'team' | 'isAdmin'>;
  fetchingUser: boolean
}

const UserContext = createContext<UserContextValue>({fetchingUser: true})

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>()
  const [fetchingUser, setFetchingUser] = useState(true)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token') || localStorage.getItem('token')
    if (token) {
      client.interceptors.request.use(config => {
        config.headers.token = token;
        return config;
      });
      client.get<User>(`/me`)
        .then(response => {
          setUser(response.data)
          localStorage.setItem('token', token)
        })
        .catch(e => {
          console.error(e)
          localStorage.removeItem('token')
        })
        .finally(() => setFetchingUser(false))
    } else {
      setFetchingUser(false)
    }
  }, [])

  return (
    <UserContext.Provider value={{user, fetchingUser}}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
