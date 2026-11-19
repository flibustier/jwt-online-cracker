// After a deploy, a tab opened before keeps running the previous build: its workers are files of
// that build, loaded when the cracking starts. The deploy keeps them online for a week
// (keep-old-assets.sh); later, or on a network blip, a worker fails to load (errors.ts), and the
// page reloads on the current build.

let reloading = false

// A load error soon after such a reload does not come from an old tab: the current build fails
// too, or the network does. Reloading again would loop, the error is reported instead.
const RELOADED_AT = 'reloadedAt'
const RELOAD_INTERVAL = 60 * 1000

// True while the page reloads: the errors of the page being left are not reported
export const isReloading = () => reloading

// Reloads the page, unless it is offline or has just been reloaded. Returns whether it reloads.
export const reload = () => {
  if (reloading) return true
  if (!navigator.onLine) return false
  try {
    const reloadedAt = Number(sessionStorage.getItem(RELOADED_AT))
    if (Date.now() - reloadedAt < RELOAD_INTERVAL) return false
    sessionStorage.setItem(RELOADED_AT, String(Date.now()))
  } catch {
    // without sessionStorage, nothing would stop a reload loop
    return false
  }
  reloading = true
  location.reload()
  return true
}
