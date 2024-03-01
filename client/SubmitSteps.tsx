import {
  EuiButton,
  EuiFieldNumber,
  EuiInMemoryTable,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
  useIsWithinMaxBreakpoint
} from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import type { StepSubmission } from '../server/user_data.ts'
import client from './api/client.ts'
import PageHeader from './PageHeader.tsx'

function useSteps() {
  const [steps, setSteps] = useState<StepSubmission[]>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()

  const fetch = useCallback(() => {
    client.get<StepSubmission[]>('/mySteps')
      .then(response => setSteps(response.data))
      .catch(e => setError(e))
      .finally(() => setLoading(false))
  }, [setError, setLoading, setSteps])

  useEffect(fetch, [fetch])

  return {steps, loading, error, refetch: fetch}
}

function useSubmitSteps() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>()

  const submitSteps = useCallback(async (steps: number): Promise<void> => {
    setLoading(true)
    await client.post('/mySteps', { steps })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [setLoading])

  return {submitSteps, loading, error}
}

export default function SubmitSteps() {
  const {steps, loading, refetch} = useSteps()
  const {submitSteps, loading: loadingSubmit} = useSubmitSteps()

  return (
    <>
      <PageHeader navigation={['admin']}/>
      <StepSubmissionForm
        loading={loading || loadingSubmit}
        onSubmit={async steps => {
          await submitSteps(steps)
          refetch()
        }}
      />
      <EuiSpacer size="xl"/>
      <PastSubmissions submissions={steps} loading={loading} onDelete={refetch}/>
    </>
  )
}

function StepSubmissionForm({onSubmit, loading}: {onSubmit: (steps: number) => void, loading?: boolean}) {
  const isNarrow = useIsWithinMaxBreakpoint('xs')
  const [steps, setSteps] = useState('')

  function handleSubmission() {
    setSteps('')
    onSubmit(Number(steps))
  }

  return (
    <>
      <EuiText><h2>Submit steps</h2></EuiText>
      <div style={{display: 'flex', gap: '10px', flexDirection: isNarrow ? 'column' : 'row'}}>
        <EuiFieldNumber
          fullWidth={isNarrow}
          placeholder="Steps taken today"
          value={steps}
          onChange={e => setSteps(e.target.value)}
        />
        <EuiButton disabled={!Number(steps)} onClick={handleSubmission}>Submit</EuiButton>
      </div>
    </>
  )
}

function PastSubmissions({submissions, loading, onDelete}: {submissions?: StepSubmission[], loading?: boolean, onDelete: () => void}) {
  const [entryToDelete, setEntryToDelete] = useState<StepSubmission | undefined>(undefined);

  return (
    <>
      <EuiText><h2>Previous submissions</h2></EuiText>
      <EuiInMemoryTable
        items={submissions || []}
        loading={loading}
        columns={[
          {field: 'date', name: 'Date', render: (date: string) => new Date(date).toLocaleString()},
          {field: 'steps', name: 'Steps', render: (steps: number) => steps.toLocaleString()},
          {actions: [{
            name: 'Delete',
            description: 'Delete step submission from this time',
            icon: 'trash',
            color: 'danger',
            type: 'icon',
            onClick: setEntryToDelete
          }]},
        ]}
        sorting={{sort: {field: 'steps', direction: 'desc' as const}}}
      />

      {entryToDelete && (
        <DeleteStepModal
          entry={entryToDelete}
          onDelete={() => {
            onDelete()
            setEntryToDelete(undefined)
          }}
          onClose={() => setEntryToDelete(undefined)}
        />
      )}
    </>
  )
}

function DeleteStepModal({entry, onDelete, onClose}: {entry: StepSubmission; onClose: () => void; onDelete: () => void}) {
  const [deleting, setDeleting] = useState(false)

  async function deleteSubmission() {
    setDeleting(true)
    try {
      await client.post('/mySteps/_delete', { date: entry.date })
      onDelete()
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Delete steps</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiText>
          <p>
            Are you sure you want to delete the {entry.steps} steps you walked on {new Date(entry.date).toLocaleString()}?
          </p>
        </EuiText>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton disabled={deleting} onClick={onClose}>Cancel</EuiButton>
        <EuiButton disabled={deleting} onClick={deleteSubmission} fill color="danger">Delete</EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
}
