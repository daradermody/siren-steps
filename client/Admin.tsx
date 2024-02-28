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
import React, { useCallback, useEffect, useState } from 'react'
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

function useEditUser(name: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()

  const editUser = useCallback(async (newName?: string, newTeam?: string) => {
    try {
      setLoading(true)
      await api.post('/editUser', {previousName: name, name: newName, team: newTeam})
    } catch (e) {
      setError(e as Error)
      throw e
    } finally {
      setLoading(false)
    }
  }, [name, setLoading, setError])

  return {editUser, loading, error}
}

function useDeleteUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()

  const deleteUser = useCallback(async (name: string) => {
    try {
      setLoading(true)
      await api.post('/deleteUser', {name})
    } catch (e) {
      setError(e as Error)
      throw e
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  return {deleteUser, loading, error}
}

export function Admin() {
  const user = useUser()
  const {users, loading, error, refetch} = useUsers()
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined)
  const [userToDelete, setUserToDelete] = useState<User | undefined>(undefined)

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
          {field: 'team', name: 'Team', sortable: true},
          {field: 'totalSteps', name: 'Steps', sortable: true, render: (steps: number) => steps.toLocaleString()},
          {actions: [
            {name: 'Edit', description: 'Edit this user', icon: 'pencil', type: 'icon', onClick: setUserToEdit},
            {name: 'Delete', description: 'Delete this user', icon: 'trash', type: 'icon', color: 'danger', onClick: setUserToDelete}
          ]},
        ]}
        sorting={{sort: {field: 'name', direction: 'asc' as const}}}
      />
      <EuiSpacer size="xl"/>
      <EuiButton onClick={() => setShowAddUserModal(true)}>Add user</EuiButton>

      {showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} onAdd={refetch}/>}
      {userToEdit && (
        <EditUserModal
          user={userToEdit}
          onClose={() => setUserToEdit(undefined)}
          onEdit={() => {
            refetch()
            setUserToEdit(undefined)
          }}
        />
      )}
      {userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => setUserToDelete(undefined)}
          onDelete={() => {
            refetch()
            setUserToDelete(undefined)
          }}
        />
      )}
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
        <EuiButton disabled={loading} onClick={onClose}>Cancel</EuiButton>
        <EuiButton disabled={loading || !name || !team} onClick={handleAddUser} fill>Save</EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
}

function EditUserModal({user, onClose, onEdit}: { user: User; onClose: () => void, onEdit: () => void }) {
  const {editUser, loading, error} = useEditUser(user.name)
  const [newName, setNewName] = useState(user.name)
  const [newTeam, setNewTeam] = useState(user.team)

  async function handleEditUser() {
    await editUser(newName, newTeam)
    onEdit()
  }

  useEffect(() => {
    if (error) console.error(error)
  }, [error])

  const detailsChanged = user.name !== newName || user.team !== newTeam

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Edit user</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiFormRow label="Name">
          <EuiFieldText value={newName} onChange={e => setNewName(e.target.value)}/>
        </EuiFormRow>
        <EuiFormRow label="Team">
          <EuiFieldText value={newTeam} onChange={e => setNewTeam(e.target.value)}/>
        </EuiFormRow>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton disabled={loading} onClick={onClose}>Cancel</EuiButton>
        <EuiButton disabled={loading || !newName || !newTeam || !detailsChanged} onClick={handleEditUser} fill>Save</EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
}

function DeleteUserModal({user, onClose, onDelete}: { user: User; onClose: () => void, onDelete: () => void }) {
  const {deleteUser, loading, error} = useDeleteUser()

  async function handleDeleteUser() {
    await deleteUser(user.name)
    onDelete()
  }

  useEffect(() => {
    if (error) console.error(error)
  }, [error])

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Delete user</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiText>
          <p>Are you sure you want to delete user "{user.name}" on team "{user.team}"?</p>
        </EuiText>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton disabled={loading} onClick={onClose}>Cancel</EuiButton>
        <EuiButton disabled={loading} onClick={handleDeleteUser} fill color="danger">Delete</EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
}
