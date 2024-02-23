import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUser } from './UserProvider.tsx'
import { EuiButton, EuiPageHeader, EuiPageHeaderSection, EuiSpacer, EuiText, EuiTitle, useIsWithinMaxBreakpoint } from '@elastic/eui'
// @ts-ignore
import logo from './assets/logo.png'
import React from 'react'

export default function PageHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useUser()
  const isNarrow = useIsWithinMaxBreakpoint('xs')

  return (
    <EuiPageHeader style={{marginBottom: 40}}>
      <EuiPageHeaderSection style={{ width: '100%'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isNarrow ? 'column' : 'row'}}>
          <Link to="/" style={{display: 'flex', gap: '10px', alignItems: 'center', margin: '26px 0', width: 'fit-content'}}>
            <img src={logo} alt="logo" style={{height: '60px'}}/>
            <EuiTitle size="l"><h1>Siren Steps</h1></EuiTitle>
          </Link>
          <div style={{display: location.pathname === '/' ? 'block' : 'none', width: isNarrow ? '100%' : 'unset'}}>
            {user && (
              <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', textWrap: 'nowrap', paddingTop: isNarrow ? 0 : '32px'}}>
                <EuiButton onClick={() => navigate('/submitSteps')} fullWidth>Submit steps</EuiButton>
                <EuiSpacer size="s"/>
                <EuiText color="subdued" textAlign="center" size="xs">{user.name}</EuiText>
                <EuiText color="subdued" textAlign="center" size="xs">{user.team}</EuiText>
              </div>
            )}
            {!user && <EuiButton fill onClick={() => navigate('/takePart')} fullWidth>Take part</EuiButton>}
          </div>
        </div>
      </EuiPageHeaderSection>
    </EuiPageHeader>
  )
}
