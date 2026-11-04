export default function logRequest({ requestId, method, path, status, durationMs }) {
    // eslint-disable-next-line no-console
    console.log(
        `[${requestId}] ${method} ${path} ${status} ${durationMs}ms`
    )
}
