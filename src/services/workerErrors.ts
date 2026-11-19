// Imported first by each worker. The errors of a worker stay in it: an uncaught one reaches the
// page as an event without its Error (dropped by errors.ts, it tells too little), a rejected
// promise does not reach it at all. They are sent to the page as a message instead (watchWorker in
// errors.ts), as plain text: an Error can't always be cloned.

const send = (error: unknown) => {
  const { name, message, stack } = error instanceof Error ? error : new Error(String(error))
  postMessage({ workerError: { name, message, stack } })
}

addEventListener('error', (event) => send(event.error ?? event.message))
addEventListener('unhandledrejection', (event) => send(event.reason))
