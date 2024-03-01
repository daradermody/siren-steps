import axios, { Axios } from 'axios'

export default new Axios({
  baseURL: '/api',
  validateStatus: status => status >= 200 && status < 300,
  responseType: 'json',
  transitional: {
    silentJSONParsing: false,
    forcedJSONParsing: true,
  },
  transformRequest: [...axios.defaults.transformRequest as any],
  transformResponse: [(...args) => {
    return (axios.defaults.transformResponse as any)[0](...args)
  }],
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})
