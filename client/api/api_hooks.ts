import type { User, UserWithToken } from '../../server/user_data.ts'
import { useDelayedQuery, useQuery } from './useQuery.ts'
import client from './client.ts'


export function useUsers<T extends User[] | UserWithToken[] = User[]>({ withToken } = { withToken: false }) {
  const { data, loading, error, refetch } = useQuery(
    () => client.get<T>(withToken ? 'users' : '/usersWithTokens')
  )
  return {users: data?.data, loading, error, refetch}
}

export function useAddUser() {
  const {fetch, data, loading, error} = useDelayedQuery(
    (name?: string, team?: string) => client.post<string>('/addUser', {name, team})
  )
  const magicLink = data?.data ? `${window.location.protocol}//${window.location.host}?token=${data.data}` : undefined
  return {addUser: fetch, magicLink, loading, error}
}

export function useEditUser(name: string) {
  const {fetch, loading, error} = useDelayedQuery(
    (newName: string, newTeam: string) => client.post('/editUser', {previousName: name, name: newName, team: newTeam})
  )
  return {editUser: fetch, loading, error}
}

export function useDeleteUser() {
  const {fetch, loading, error} = useDelayedQuery(
    (name: string) => client.post('/deleteUser', {name})
  )
  return {deleteUser: fetch, loading, error}
}

