import { SUPPORTED_ALGORITHM } from './constants'

const decodeHeader = (token: string) => {
  const parts = token.split('.')

  try {
    const base64 = parts[0].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decodedHeader = JSON.parse(atob(padded))

    return decodedHeader
  } catch {
    throw 'Invalid token format. Invalid header.'
  }
}

export const getAlgorithm = (token: string) => {
  try {
    const { alg } = decodeHeader(token)

    return alg
  } catch {
    return ''
  }
}

const validateGeneralJwtFormat = (token: string) => {
  const parts = token.split('.')

  if (parts.length !== 3) {
    throw 'Invalid token format: Invalid number of parts.'
  }

  if (!parts.every((part) => part.length > 0)) {
    throw 'Invalid token format: Parts should not be empty.'
  }
}

const validateHmacAlgorithmHeader = (token: string) => {
  const decodedHeader = decodeHeader(token)

  if (decodedHeader.typ && decodedHeader.typ !== 'JWT') {
    throw `Unsupported Typ: <b class="warning">${decodedHeader.typ}</b> (<b>JWT</b> expected here)`
  }

  if (!SUPPORTED_ALGORITHM.includes(decodedHeader.alg)) {
    throw `Unsupported algorithm <b class="warning">${
      decodedHeader.alg
    }</b>. Only ${SUPPORTED_ALGORITHM.join(', ')} are supported.`
  }
}

export const validateJWT = (token: string): [boolean, string | undefined] => {
  try {
    validateGeneralJwtFormat(token)
    validateHmacAlgorithmHeader(token)
  } catch (error: any) {
    return [false, error]
  }
  return [true, undefined]
}
