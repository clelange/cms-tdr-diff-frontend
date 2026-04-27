import { getHeader, getRequestURL, proxyRequest } from 'h3'

const identityHeaders = [
  'x-forwarded-user',
  'x-forwarded-email',
  'x-forwarded-preferred-username',
  'x-forwarded-groups',
  'x-auth-request-user',
  'x-auth-request-email',
  'x-auth-request-preferred-username',
  'x-auth-request-groups',
  'x-remote-user'
]

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const path = event.context.params?.path || ''
  const backendUrl = process.env.BACKEND_URL || process.env.NUXT_BACKEND_URL || config.backendUrl
  const apiToken = process.env.API_TOKEN || process.env.NUXT_API_TOKEN || config.apiToken
  const backendBase = backendUrl.replace(/\/+$/, '')
  const target = `${backendBase}/${path}${getRequestURL(event).search}`
  const headers: Record<string, string> = {
    api_token: apiToken
  }

  for (const header of identityHeaders) {
    const value = getHeader(event, header)
    if (value) {
      headers[header] = value
    }
  }

  return proxyRequest(event, target, {
    headers
  })
})
