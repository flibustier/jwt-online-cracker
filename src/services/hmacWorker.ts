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
    const trimmedSecret = secret.replace(/\r$/, '')
    if (trimmedSecret.length === 0) {
      return ''
    }

    try {
      const key = await crypto.subtle.importKey(
        'raw',
        utf8encoder.encode(trimmedSecret),
        algorithm,
        false,
        ['sign']
      )

      const signature = await crypto.subtle.sign(algorithm, key, encodedHeader)

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

  const processWords = async () => {
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const forgedSignature = await hmac(word)

      if (forgedSignature === signature) {
        console.info('Secret found :', word)
        postMessage({ secretFound: word })
      }

      // Send progress every 1000 words to reduce main thread overhead
      if (i > 0 && i % 1000 === 0) {
        postMessage({ isProgress: true, batchSize: 1000, sample: word })
      }
    }
    const remainingInBatch = words.length % 1000 || 1000
    postMessage({ isDone: true, batchSize: remainingInBatch, sample: words[words.length - 1] })
  }

  processWords()
}
