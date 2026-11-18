import type { App } from 'vue'
import { BUGSINK_DSN } from './constants'

// Errors in the browser are sent to Bugsink (https://bug.cracking.ovh), which speaks the Sentry
// protocol. The Sentry SDK weighs about 20 KB gzipped, so it is only downloaded after the first
// error: a visit without errors costs nothing. Only production builds report, and only with a
// BUGSINK_DSN in constants.ts: leave it empty and the build has neither the listeners nor the SDK.

type Send = (error: unknown, tags?: Record<string, string>) => void

let sdk: Promise<Send> | undefined

const report = (error: unknown, tags?: Record<string, string>) => {
  sdk ??= import('./errors-sdk').then(({ start }) => start(BUGSINK_DSN))
  // If the SDK can't be loaded (offline…), there is nothing more to do
  sdk.then((send) => send(error, tags)).catch(() => {})
}

export const trackErrors = (app: App) => {
  // An empty DSN is known at build time: report() and the import() of errors-sdk.ts are dropped
  if (!import.meta.env.PROD || !BUGSINK_DSN) return

  // `error` without an Error object is a cross-origin "Script error.", which tells nothing
  window.addEventListener('error', (event) => event.error && report(event.error))
  window.addEventListener('unhandledrejection', (event) => report(event.reason))

  // Vue only logs an error when no handler is set: keep the log in the console
  app.config.errorHandler = (error, _instance, info) => {
    console.error(error)
    report(error, { vue: info })
  }
}
