export const useApi = () => {
  type ApiRequestBody = BodyInit | Record<string, unknown> | null | undefined

  const get = async <T>(url: string): Promise<T> => {
    return $fetch(`/api${url}`)
  }

  const post = async <T>(url: string, body: ApiRequestBody): Promise<T> => {
    return $fetch(`/api${url}`, {
      method: 'POST',
      body
    })
  }

  return {
    get,
    post
  }
}
