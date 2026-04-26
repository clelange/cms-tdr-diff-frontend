import { getRequestURL, proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const path = event.context.params?.path || ''
  const backendUrl = process.env.BACKEND_URL || process.env.NUXT_BACKEND_URL || config.backendUrl
  const apiToken = process.env.API_TOKEN || process.env.NUXT_API_TOKEN || config.apiToken
  const backendBase = backendUrl.replace(/\/+$/, '')
  const target = `${backendBase}/${path}${getRequestURL(event).search}`

  return proxyRequest(event, target, {
    headers: {
      api_token: apiToken
    }
  })
})
