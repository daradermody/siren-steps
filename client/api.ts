import axios, { Axios } from 'axios'

export default new Axios({
  baseURL: '/api',
  validateStatus: status => status >= 200 && status < 300,
  transformRequest: [...axios.defaults.transformRequest as any],
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})
