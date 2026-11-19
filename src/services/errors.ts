import type { App } from 'vue'
import { BUGSINK_DSN } from './constants'
import { isReloading, reload } from './reload'

// Errors in the browser are sent to Bugsink (https://bug.cracking.ovh), which speaks the Sentry
// protocol. The Sentry SDK weighs about 20 KB gzipped, so it is only downloaded after the first
// error: a visit without errors costs nothing. Only production builds report, and only with a
// BUGSINK_DSN in constants.ts: leave it empty and the build has no SDK. A worker of an older build
// that fails to load reloads the page instead (reload.ts).

type Send = (error: unknown, tags?: Record<string, string>) => void

let sdk: Promise<Send> | undefined

const report = (error: unknown, tags?: Record<string, string>) => {
  // An empty DSN is known at build time: the import() of errors-sdk.ts is dropped
  if (!BUGSINK_DSN || isReloading()) return
  sdk ??= import('./errors-sdk').then(({ start }) => start(BUGSINK_DSN))
  // If the SDK can't be loaded (offline…), there is nothing more to do
  sdk.then((send) => send(error, tags)).catch(() => {})
}

export const trackErrors = (app: App) => {
  if (!import.meta.env.PROD) return

  // `error` without an Error object is a cross-origin "Script error.", which tells nothing, or the
  // error of a worker, sent as a message instead (watchWorker)
  window.addEventListener('error', (event) => event.error && report(event.error))
  window.addEventListener('unhandledrejection', (event) => report(event.reason))

  // Vue only logs an error when no handler is set: keep the log in the console
  app.config.errorHandler = (error, _instance, info) => {
    if (isReloading()) return
    console.error(error)
    report(error, { vue: info })
  }
}

// The same error comes from each worker (one per CPU thread), and again for each slice of words:
// it is reported once
const workerErrors = new Set<string>()

// A worker that can't be loaded (the file of an older build, gone) only fires an `error` Event:
// the page reloads on the current build. Its errors while running come as messages
// (workerErrors.ts), with their stack.
export const watchWorker = (worker: Worker, name: string) => {
  if (!import.meta.env.PROD) return

  worker.addEventListener('error', (event) => {
    // an ErrorEvent is an error while running, already sent as a message
    if (event instanceof ErrorEvent || reload()) return
    report(new Error(`The ${name} worker failed to load`), { worker: name, reload: 'skipped' })
  })
  worker.addEventListener('message', ({ data }) => {
    const key = data?.workerError && JSON.stringify(data.workerError)
    if (!key || workerErrors.has(key)) return
    workerErrors.add(key)
    report(Object.assign(new Error(), data.workerError), { worker: name })
  })
}
