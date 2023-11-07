const SUPPORTED_ALGORITHM = ['HS256', 'HS384', 'HS512']

const decodeHeader = (token: string) => {
  const parts = token.split('.')

  try {
    const decodedHeader = JSON.parse(atob(parts[0]))

    return decodedHeader
  } catch (e) {
    throw 'Invalid token format. Invalid header.'
  }
}

export const getAlgorithm = (token: string) => {
  try {
    const { alg } = decodeHeader(token)

    return alg
  } catch (error) {
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

  if (decodedHeader.typ !== 'JWT') {
    throw `Unsupported Typ: <b class="warning">${decodedHeader.typ}<b> (<b>JWT</b> expected here)`
  }

  if (!SUPPORTED_ALGORITHM.includes(decodedHeader.alg)) {
    throw `Unsupported algorithm <b class="warning">${decodedHeader.alg}</b>. Only ${SUPPORTED_ALGORITHM.join(
      ', '
    )} are supported.`
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
