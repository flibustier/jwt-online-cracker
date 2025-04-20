const HASH_ALGORITHM = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512'
}

const utf8encoder = new TextEncoder()

const CreateHmacFunction = (hashAlgorithm: string, content: string) => {
  const algorithm = { name: 'HMAC', hash: hashAlgorithm }
  const encodedHeader = utf8encoder.encode(content)

  return async (secret: string) => {
    try {
      const key = await crypto.subtle.importKey(
        'raw',
        utf8encoder.encode(secret),
        algorithm,
        false,
        ['sign']
      )

      const signature = await crypto.subtle.sign(algorithm.name, key, encodedHeader)

      return btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    } catch (error) {
      console.warn(error)

      return ''
    }
  }
}

interface Data {
  algorithm: keyof typeof HASH_ALGORITHM
  token: string
  words: string[]
  id: number
}

onmessage = (e) => {
  const { algorithm, token, words, id }: Data = e.data
  console.debug(`Worker ${id} received ${words.length} words`)
  const [header, payload, signature] = token.split('.')
  const content = `${header}.${payload}`

  const hmac = CreateHmacFunction(HASH_ALGORITHM[algorithm], content)

  Promise.all(
    words.map(async (word) => {
      const forgedSignature = await hmac(word)

      if (forgedSignature === signature) {
        console.info('Secret found :', word)
        postMessage({ secretFound: word })
      }
    })
  ).then(() => postMessage({ isDone: true, batchSize: words.length, sample: words[0] }))
}
