import Worker from './hmacWorker?worker'
import CombinatorWorker from './combinator?worker'

const utf8decoder = new TextDecoder()

const MAX_WORKER_SLICE = 1000
const WORKER_PER_THREAD = 1

export default class BruteForce {
  private workerPool: Worker[] = []

  private algorithm: string = ''
  private token: String = ''
  private dictionarySize = 0
  private downloaded = 0
  private wordsDone = 0
  private wordsSent = 0
  private wordsRemaining = 0

  private initWorkers = (onProgress: Function, onSucceeded: Function) => {
    this.workerPool = new Array<Worker>((navigator.hardwareConcurrency || 1) * WORKER_PER_THREAD)
    this.workerPool.fill(new Worker()).forEach(
      (worker) =>
        (worker.onmessage = (e) => {
          const { isDone, batchSize, secretFound } = e.data

          if (secretFound) {
            onSucceeded(secretFound)
          }

          if (isDone) {
            this.wordsDone = batchSize + this.wordsDone
            onProgress(this.globalProgress)
          }
        })
    )
  }

  private sendSliceToWorker = (workerIndex: number, slice: string[]) => {
    this.workerPool[workerIndex].postMessage({
      algorithm: this.algorithm,
      token: this.token,
      words: slice,
      id: workerIndex
    })
  }

  private dispatchWordsToWorkers = (words: string[]) => {
    if (words.length > 0) {
      const wordsPerWorker = Math.floor(words.length / this.workerPool.length)
      this.workerPool.forEach((_worker, index) => {
        const sliceStart = index * wordsPerWorker
        // last worker get all remaining
        const sliceEnd =
          index === this.workerPool.length - 1 ? undefined : (index + 1) * wordsPerWorker
        const slice = words.slice(sliceStart, sliceEnd)

        // if slice is too big, we send it in multiple smaller chunks
        for (let i = 0; i < slice.length; i += MAX_WORKER_SLICE) {
          const chunk = slice.slice(i, i + MAX_WORKER_SLICE)
          this.sendSliceToWorker(index, chunk)
          this.wordsSent += chunk.length
        }
      })
    }
  }

  private get downloadPercent() {
    return Math.trunc((this.downloaded / this.dictionarySize) * 100)
  }
  private get globalProgress() {
    return Math.trunc(
      (this.wordsDone / this.wordsRemaining) *
        (this.dictionarySize > 0 ? this.downloadPercent : 100)
    )
  }

  constructor(algorithm: string, token: string, onProgress: Function, onSucceeded: Function) {
    this.token = token
    this.algorithm = algorithm
    this.initWorkers(onProgress, onSucceeded)
  }

  public startAlphabet = async (
    alphabetString: string,
    startLength: number = 0,
    maxLength: number = 6
  ) => {
    // deduplicate
    const alphabet = [...new Set(alphabetString.split(''))]

    this.wordsRemaining =
      Math.pow(alphabet.length, maxLength) - Math.pow(alphabet.length, startLength)

    console.log(`starting brute-force of ${this.wordsRemaining} combinations`)
    /*
    const iterator = makeAlphabetCombinationsIterator(alphabet, 1, MAX_LENGTH)
    let iteration = iterator.next()
    while (!iteration.done) {
      await this.sendSliceToWorker(0, iteration.value)
      // send progress
      console.log(iteration.length)
      iteration = iterator.next()
    }
    console.log('done')
    */
    const combinator = new CombinatorWorker()
    combinator.onmessage = (e) => this.dispatchWordsToWorkers(e.data)
    combinator.postMessage({ alphabet, startLength, maxLength })
  }

  public startDictionary = async (
    dictionaryURL: string,
    dictionarySize: number,
    onDownloadProgress: Function
  ) => {
    this.downloaded = 0
    this.wordsRemaining = 0
    this.dictionarySize = dictionarySize

    console.log(`starting download of dictionary ${dictionaryURL} (${dictionarySize} bytes)`)

    const response = await fetch(dictionaryURL)

    let splitWord
    for await (const chunk of response.body as any) {
      let words = utf8decoder.decode(chunk).split('\n')
      if (splitWord) {
        words = [splitWord + words.shift(), ...words]
      }
      splitWord = words.pop()

      this.dispatchWordsToWorkers(words)

      this.wordsRemaining += words.length
      this.downloaded += chunk.length
      onDownloadProgress(this.downloadPercent)
    }

    if (splitWord) {
      this.sendSliceToWorker(0, [splitWord])
    }
  }

  public cancel = () => this.workerPool.forEach((worker) => worker.terminate())
}
