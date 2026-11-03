export const API_UNREACHABLE_MESSAGE =
  'The API is not reachable. Start the server and refresh this page.'

export function readApiFailure(error: unknown, fallback: string): string {
  if (error instanceof TypeError) {
    return API_UNREACHABLE_MESSAGE
  }
  if (error instanceof Error) {
    if (/failed to fetch|networkerror|load failed/i.test(error.message)) {
      return API_UNREACHABLE_MESSAGE
    }
    return error.message || fallback
  }
  return fallback
}

export function isApiUnreachableMessage(message: string): boolean {
  return message === API_UNREACHABLE_MESSAGE
}
