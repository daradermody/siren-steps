import { Link, useNavigate } from 'react-router-dom'
import { useUser } from './UserProvider.tsx'
import { EuiButton, EuiPageHeader, EuiPageHeaderSection, EuiSpacer, EuiText, EuiTitle, useIsWithinMaxBreakpoint } from '@elastic/eui'
import React from 'react'

interface PageHeaderProps {
  navigation?: ('takePart' | 'submitSteps' | 'admin')[]
}

export default function PageHeader({navigation}: PageHeaderProps) {
  const {user, fetchingUser} = useUser()
  const isNarrow = useIsWithinMaxBreakpoint('xs')

  return (
    <EuiPageHeader style={{marginBottom: 40}}>
      <EuiPageHeaderSection style={{width: '100%'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isNarrow ? 'column' : 'row'}}>
          <Link to="/" style={{display: 'flex', gap: '10px', alignItems: 'center', margin: '26px 0', width: 'fit-content'}}>
            <img src="/public/logo60.png" alt="logo" style={{height: '60px', width: '60px', backgroundColor: '#00e7d6', borderRadius: '50%'}}/>
            <EuiTitle size="l"><h1>Siren Steps</h1></EuiTitle>
          </Link>
          {!fetchingUser && (
            <div style={{display: 'flex', gap: '16px', width: isNarrow ? '100%' : 'unset', alignItems: 'baseline'}}>
              {user?.isAdmin && navigation?.includes('admin') && <AdminButton/>}
              {!!user && navigation?.includes('submitSteps') && <SubmitStepsButton/>}
              {!user && navigation?.includes('takePart') && <TakePartButton/>}
            </div>
          )}
        </div>
      </EuiPageHeaderSection>
    </EuiPageHeader>
  )
}

function AdminButton() {
  const navigate = useNavigate()
  return (
    <EuiButton onClick={() => navigate('/admin')} fullWidth>
      Admin
    </EuiButton>
  )
}

function SubmitStepsButton() {
  const navigate = useNavigate()
  const {user} = useUser()
  const isNarrow = useIsWithinMaxBreakpoint('xs')

  if (!user) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      textWrap: 'nowrap',
      paddingTop: isNarrow ? 0 : '32px',
      inlineSize: '100%'
    }}>
      <EuiButton onClick={() => navigate('/submitSteps')} fullWidth fill>Submit steps</EuiButton>
      <EuiSpacer size="s"/>
      <EuiText color="subdued" textAlign="center" size="xs">{user.name}</EuiText>
      <EuiText color="subdued" textAlign="center" size="xs">{user.team}</EuiText>
    </div>
  )
}

function TakePartButton() {
  const navigate = useNavigate()
  return (
    <EuiButton fill onClick={() => navigate('/takePart')} fullWidth>
      Take part
    </EuiButton>
  )
}
