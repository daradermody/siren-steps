import axios, { Axios } from 'axios'
import getTokenInfo from '../getTokenInfo.ts'

const client = new Axios({
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

const {token} = getTokenInfo()
if (token) {
  client.interceptors.request.use(config => {
    config.headers.token = token;
    return config;
  });
}

export default client
