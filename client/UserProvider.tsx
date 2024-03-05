import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import client from './api/client.ts'
import type { User } from '../server/user_data.ts'
import getTokenInfo from './getTokenInfo.ts'

interface UserContextValue {
  user?: Pick<User, 'name' | 'team' | 'isAdmin'>;
  fetchingUser: boolean
}

const UserContext = createContext<UserContextValue>({fetchingUser: true})

export default function UserProvider({children}: { children: ReactNode }) {
  const [user, setUser] = useState<User>()
  const [fetchingUser, setFetchingUser] = useState(true)

  useEffect(() => {
    const {token, rememberUser} = getTokenInfo()

    if (token) {
      client.get<User>(`/me`)
        .then(response => {
          setUser(response.data)
          const storage = rememberUser ? localStorage : sessionStorage
          storage.setItem('token', token)
        })
        .catch(e => {
          console.error(e)
          const storage = rememberUser ? localStorage : sessionStorage
          storage.removeItem('token')
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
