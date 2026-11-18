import {
  BrowserClient,
  captureException,
  dedupeIntegration,
  defaultStackParser,
  getCurrentScope,
  linkedErrorsIntegration,
  makeFetchTransport
} from '@sentry/browser'

// Loaded by errors.ts after the first error only. This file keeps the same name from one deploy to
// the next (vite.config.mts), so a tab opened before a deploy can still load it. It imports nothing
// from the app (the DSN comes from errors.ts): otherwise, in an old tab, it would load the main
// chunk of the new deploy.

// A token pasted by a visitor never leaves in a report: anything shaped like a JWT is masked
const JWT = /eyJ[\w-]*(\.[\w-]*){0,2}/g
const mask = (text?: string) => text?.replace(JWT, '[jwt]')

export const start = (dsn: string) => {
  const client = new BrowserClient({
    dsn,
    environment: location.hostname === 'jwt.cracking.ovh' ? 'production' : 'local',
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    // No breadcrumbs, no tracing, no replay: only the error itself
    integrations: [linkedErrorsIntegration(), dedupeIntegration()],
    // Nothing about the visitor: no user, cookies, headers, bodies or query strings
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false
    },
    // Add the host to "Failed to fetch" in the report only: the app's own error stays the same
    enhanceFetchErrorMessages: 'report-only',
    beforeSend(event) {
      event.request = {
        url: location.origin + location.pathname,
        headers: { 'User-Agent': navigator.userAgent }
      }
      event.message = mask(event.message)
      for (const exception of event.exception?.values ?? []) {
        exception.value = mask(exception.value)
      }
      // A rejected object is copied here in full: keep its keys only, they are in the title
      if (event.extra?.__serialized__) delete event.extra.__serialized__
      return event
    }
  })
  getCurrentScope().setClient(client)
  client.init()

  return (error: unknown, tags?: Record<string, string>) => captureException(error, { tags })
}
