export const useApi = () => {
  const get = async <T>(url: string): Promise<T> => {
    return $fetch(`/api${url}`)
  }

  const post = async <T>(url: string, body: any): Promise<T> => {
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
