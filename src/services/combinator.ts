interface IteratorResult {
  value: string[]
  done: boolean
  length: number
  nextLength?: number
}

export function makeAlphabetCombinationsIterator(
  alphabet: string[],
  startLength = 1,
  maxLength = 12
) {
  if (startLength > maxLength) {
    throw new Error(
      `startLength (${startLength} given) must be less or equal to maxLength (${maxLength} given)`
    )
  }

  const previous: string[] = []

  const iterator = {
    next(): IteratorResult {
      const base = previous.shift() || ''
      const value = []

      if (base.length >= maxLength) {
        return {
          done: true,
          value: [],
          length: maxLength
        }
      }

      for (let c = 0; c < alphabet.length; c++) {
        const combination = base + alphabet[c]
        value.push(combination)
        previous.push(combination)
      }

      const nextLength = previous[0].length + 1

      return {
        value,
        done: nextLength > maxLength,
        length: base.length + 1,
        nextLength
      }
    }
  }

  if (startLength > 1) {
    let i = iterator.next()
    while ((i.nextLength || 0) < startLength) {
      i = iterator.next()
    }
  }

  return iterator
}

onmessage = (e) => {
  const { alphabet, startLength, maxLength }: any = e.data
  console.info(
    `Worker combinator received alphabet with ${alphabet.length} symbols, with a length of [${startLength}-${maxLength}]`
  )
  const iterator = makeAlphabetCombinationsIterator(alphabet, startLength, maxLength)

  let iteration = iterator.next()
  while (!iteration.done) {
    postMessage(iteration.value)
    iteration = iterator.next()
  }
  console.info('Worker combinator finished sending words')
}
