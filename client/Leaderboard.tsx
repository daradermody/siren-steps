import { EuiButtonIcon, EuiDescriptionList, EuiInMemoryTable, EuiText } from '@elastic/eui'
import React, { type ReactNode, useEffect, useState } from 'react'
import api from './api.ts'
import type { TeamStat } from '../server/api.ts'
import PageHeader from './PageHeader.tsx'

export default function Leaderboard() {
  const {stats, loading, error} = useTeamStats()
  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState<Record<string, ReactNode>>({})

  const toggleDetails = (stat: TeamStat) => {
    const itemIdToExpandedRowMapValues = {...itemIdToExpandedRowMap}
    if (itemIdToExpandedRowMapValues[stat.name]) {
      delete itemIdToExpandedRowMapValues[stat.name]
    } else {
      itemIdToExpandedRowMapValues[stat.name] = (
        <EuiDescriptionList
          compressed
          type="column"
          listItems={
            stat.members
              .sort((a, b) => b.totalSteps - a.totalSteps)
              .map(member => ({title: member.name, description: member.totalSteps.toLocaleString()}))
          }
        />
      )
    }
    setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues)
  }

  return (
    <>
      <PageHeader/>
      <EuiText><h2>Leaderboard</h2></EuiText>
      <EuiInMemoryTable
        loading={loading}
        error={error?.message}
        tableCaption="Demo of EuiInMemoryTable"
        items={stats || []}
        itemId="name"
        columns={[
          {field: 'name', name: 'Team', sortable: true},
          {field: 'steps', name: 'Steps', sortable: true, render: (steps: number) => steps.toLocaleString()},
          {
            align: 'right',
            width: '40px',
            isExpander: true,
            render: (stat: TeamStat) => (
              <EuiButtonIcon
                onClick={() => toggleDetails(stat)}
                aria-label={itemIdToExpandedRowMap[stat.name] ? 'Collapse' : 'Expand'}
                iconType={itemIdToExpandedRowMap[stat.name] ? 'arrowDown' : 'arrowRight'}
              />
            )
          }
        ]}
        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
        isExpandable
        hasActions
        sorting={{sort: {field: 'steps', direction: 'desc' as const}}}
      />
    </>
  )
}

function useTeamStats() {
  const [stats, setStats] = useState<TeamStat[]>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()

  useEffect(() => {
    api.get<string>('/teamStats')
      .then(response => setStats(JSON.parse(response.data)))
      .catch(e => setError(e))
      .finally(() => setLoading(false))
  }, [])

  return {stats, loading, error}
}

