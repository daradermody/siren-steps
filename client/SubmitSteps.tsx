import { EuiButton, EuiFieldNumber, EuiInMemoryTable, EuiSpacer, EuiText, useIsWithinMaxBreakpoint } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import type { StepSubmission } from '../server/user_data.ts'
import api from './api.ts'
import PageHeader from './PageHeader.tsx'

function useSteps() {
  const [steps, setSteps] = useState<StepSubmission[]>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()

  const fetch = useCallback(() => {
    api.get<string>('/mySteps')
      .then(response => setSteps(JSON.parse(response.data)))
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
    await api.post('/mySteps', { steps })
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
      <PageHeader/>
      <StepSubmissionForm
        loading={loading || loadingSubmit}
        onSubmit={async steps => {
          await submitSteps(steps)
          refetch()
        }}
      />
      <EuiSpacer size="xl"/>
      <PastSubmissions submissions={steps} loading={loading}/>
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

function PastSubmissions({submissions, loading}: {submissions?: StepSubmission[], loading?: boolean}) {
  return (
    <>
      <EuiText><h2>Previous submissions</h2></EuiText>
      <EuiInMemoryTable
        items={submissions || []}
        loading={loading}
        columns={[
          {field: 'date', name: 'Date', render: (date: string) => new Date(date).toLocaleString()},
          {field: 'steps', name: 'Steps', render: (steps: number) => steps.toLocaleString()}
        ]}
        sorting={{sort: {field: 'steps', direction: 'desc' as const}}}
      />
    </>
  )
}
