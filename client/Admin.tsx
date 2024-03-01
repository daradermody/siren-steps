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
import React, { useEffect, useState } from 'react'
import type { User, UserWithToken } from '../server/user_data.ts'
import { useAddUser, useUsers, useDeleteUser, useEditUser } from './api/api_hooks.ts'
import PageHeader from './PageHeader.tsx'

export function Admin() {
  const user = useUser()
  const {users, loading, error, refetch} = useUsers<UserWithToken[]>()
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined)
  const [userToDelete, setUserToDelete] = useState<User | undefined>(undefined)

  if (!user) {
    return <Navigate to="/" replace={true}/>
  }

  const baseLink = `${window.location.protocol}//${window.location.host}`;

  return (
    <div>
      <PageHeader navigation={['submitSteps']}/>

      <EuiText><h2>Users</h2></EuiText>
      <EuiInMemoryTable
        itemId="name"
        loading={loading}
        error={error?.message}
        items={users?.sort((a, b) => b.name < a.name ? 1 : -1) || []}
        hasActions
        columns={[
          {field: 'name', name: 'Name', sortable: true},
          {field: 'team', name: 'Team', sortable: true},
          {field: 'totalSteps', name: 'Steps', sortable: true, render: (steps: number) => steps.toLocaleString()},
          {actions: [
            {
              name: 'Impersonate',
              isPrimary: true,
              description: 'Login as this user',
              href: user => `${baseLink}?token=${user.token}`,
              target: '_blank',
              icon: 'play',
              type: 'icon'
            },
            {
              name: 'Edit',
              description: 'Edit this user',
              icon: 'pencil',
              type: 'icon',
              onClick: setUserToEdit
            },
            {
              name: 'Delete',
              description: 'Delete this user',
              icon: 'trash',
              type: 'icon',
              color: 'danger',
              onClick: setUserToDelete
            }
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
        <EuiButton disabled={loading} onClick={onClose}>{magicLink ? 'Close' : 'Cancel'}</EuiButton>
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
