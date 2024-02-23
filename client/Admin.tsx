import { useUser } from './UserProvider.tsx'
import { Navigate } from 'react-router-dom'
import {
  EuiButton,
  EuiFieldText,
  EuiFormRow,
  EuiInMemoryTable,
  EuiLink,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText
} from '@elastic/eui'
import { useCallback, useEffect, useState } from 'react'
import api from './api.ts'
import type { User } from '../server/user_data.ts'

function useUsers() {
  const [users, setUsers] = useState<User[]>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()

  const fetch = useCallback(() => {
    api.get<string>('/users')
      .then(response => setUsers(JSON.parse(response.data)))
      .catch(e => setError(e))
      .finally(() => setLoading(false))
  }, [setUsers, setLoading, setError])

  useEffect(fetch, [fetch])

  return {users, loading, error, refetch: fetch}
}

function useAddUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [magicLink, setMagicLink] = useState<string>()

  const addUser = useCallback(async (name: string, team: string) => {
    try {
      setLoading(true)
      const response = await api.post('/addUser', {name, team})
      setMagicLink(response.data)
    } catch (e) {
      setError(e as Error)
      throw e
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  return {addUser, magicLink, loading, error}
}

export function Admin() {
  const user = useUser()
  const {users, loading, error, refetch} = useUsers()
  const [showAddUserModal, setShowAddUserModal] = useState(false)

  console.log('user', user)
  if (!user) {
    return <Navigate to="/" replace={true}/>
  }

  return (
    <div>
      <EuiText><h2>Users</h2></EuiText>
      <EuiInMemoryTable
        itemId="name"
        loading={loading}
        error={error?.message}
        items={users?.sort((a, b) => b.name < a.name ? 1 : -1) || []}
        columns={[
          {field: 'name', name: 'Name', sortable: true},
          {field: 'totalSteps', name: 'Steps', sortable: true, render: (steps: number) => steps.toLocaleString()},
        ]}
      />
      <EuiSpacer size="xl"/>
      <EuiButton onClick={() => setShowAddUserModal(true)}>Add user</EuiButton>
      {showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} onAdd={refetch}/>}
    </div>
  )
}

function AddUserModal({onClose, onAdd}: { onClose: () => void, onAdd: () => void }) {
  const {addUser, magicLink, loading, error} = useAddUser()
  const [name, setName] = useState('')
  const [team, setTeam] = useState('')

  async function handleAddUser() {
    await addUser(name, team)
    setName('')
    setTeam('')
    onAdd()
  }

  useEffect(() => {
    if (error) console.error(error)
  }, [error])

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Add user</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiFormRow label="Name">
          <EuiFieldText value={name} onChange={e => setName(e.target.value)}/>
        </EuiFormRow>
        <EuiFormRow label="Team">
          <EuiFieldText value={team} onChange={e => setTeam(e.target.value)}/>
        </EuiFormRow>

        <EuiSpacer/>
        <div style={{display: 'flex', justifyContent: 'center', visibility: magicLink ? 'visible' : 'hidden'}}>
          <EuiLink href={magicLink} target="_blank">Magic link</EuiLink>
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton disabled={loading} onClick={onClose}>Close</EuiButton>
        <EuiButton disabled={loading || !name || !team} onClick={handleAddUser} fill>Save</EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
}
