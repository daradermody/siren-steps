export default function getTokenInfo(): {token: string | null; rememberUser: boolean} {
  const params = new URLSearchParams(window.location.search)
  if (params.get('token')) {
    return {token: params.get('token'), rememberUser: true}
  } else if (params.get('sessionToken')) {
    return {token: params.get('sessionToken'), rememberUser: false}
  } else if (sessionStorage.getItem('token')) {
    return {token: sessionStorage.getItem('token'), rememberUser: false}
  } else if (localStorage.getItem('token'))  {
    return {token: localStorage.getItem('token'), rememberUser: true}
  } else {
    return {token: null, rememberUser: false}
  }
}
