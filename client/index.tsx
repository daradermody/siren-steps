import React from 'react'
import ReactDOM from 'react-dom/client'
// @ts-ignore
import css from './index.css'
// @ts-ignore
import elasticCss from '@elastic/eui/dist/eui_theme_light.css'
import { EuiButton, EuiPage, EuiPageBody, EuiProvider, EuiText } from '@elastic/eui'
import './icons'
import Leaderboard from './Leaderboard.tsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, useLocation, useNavigate } from 'react-router-dom'
import TakePart from './TakePart.tsx'
import SubmitSteps from './SubmitSteps.tsx'
import UserProvider from './UserProvider.tsx'
import { Admin } from './Admin.tsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="" element={<Leaderboard/>}/>
      <Route path="takePart" element={<TakePart/>}/>
      <Route path="submitSteps" element={<SubmitSteps/>}/>
      <Route path="admin" element={<Admin/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Route>
  )
)

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <UserProvider>
      <EuiProvider colorMode="light">
        <link rel="stylesheet" href={css}/>
        <link rel="stylesheet" href={elasticCss}/>
        <EuiPage restrictWidth paddingSize="m">
          <EuiPageBody>
            <RouterProvider router={router}/>
          </EuiPageBody>
        </EuiPage>
      </EuiProvider>
    </UserProvider>
  </React.StrictMode>
)

function NotFound() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '24px', flexDirection: 'column', marginTop: '40px'}}>
      <EuiText><h2>Not found: {location.pathname}</h2></EuiText>
      <EuiButton fullWidth={false} onClick={() => navigate('/')}>Go home</EuiButton>
    </div>
  )
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/static/serviceWorker.js")
      .catch(err => console.log("Service worker not registered", err))
  })
}
