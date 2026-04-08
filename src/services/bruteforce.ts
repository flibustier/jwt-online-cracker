import Worker from './hmacWorker?worker'
import CombinatorWorker from './combinator?worker'

const utf8decoder = new TextDecoder()

const MAX_WORKER_SLICE = 1000
const WORKER_PER_THREAD = 1

export default class BruteForce {
  private workerPool: Worker[] = []
  private combinatorWorker: Worker = new CombinatorWorker()
  private workerReadyResolvers: (() => void)[] = []
  private availableWorkerIndices: number[] = []

  private algorithm: string = ''
  private token: string = ''
  private dictionarySize = 0
  private downloaded = 0
  private wordsDone = 0
  private wordsSent = 0
  private wordsRemaining = 0
  private isDone = false

  private initWorkers = (
    onProgress: (progressPercent: number, sample?: string) => void,
    onSucceeded: (secret: string) => void
  ) => {
    const workerCount = (navigator.hardwareConcurrency || 1) * WORKER_PER_THREAD
    this.workerPool = Array.from({ length: workerCount }, () => new Worker())
    this.availableWorkerIndices = Array.from({ length: workerCount }, (_, i) => i)

    this.workerPool.forEach(
      (worker, index) =>
        (worker.onmessage = (e) => {
          const { isDone, isProgress, batchSize, secretFound, sample } = e.data

          if (secretFound) {
            onSucceeded(secretFound)
            this.cancel()
          }

          if (isProgress || isDone) {
            this.wordsDone = batchSize + this.wordsDone
            onProgress(this.globalProgress, sample)
          }

          if (isDone) {
            this.availableWorkerIndices.push(index)
            const resolver = this.workerReadyResolvers.shift()
            if (resolver) resolver()
          }
        })
    )
  }

  private waitForWorker = () => {
    if (this.availableWorkerIndices.length > 0) return Promise.resolve()
    return new Promise<void>((resolve) => this.workerReadyResolvers.push(resolve))
  }

  private sendSliceToWorker = (workerIndex: number, slice: string[]) => {
    if (!this.isDone) {
      this.workerPool[workerIndex].postMessage({
        algorithm: this.algorithm,
        token: this.token,
        words: slice,
        id: workerIndex
      })
    }
  }

  private dispatchWordsToWorkers = async (words: string[]) => {
    if (words.length === 0) return

    for (let i = 0; i < words.length; i += MAX_WORKER_SLICE) {
      if (this.isDone) break
      await this.waitForWorker()
      if (this.isDone) break

      const chunk = words.slice(i, i + MAX_WORKER_SLICE)
      const workerIndex = this.availableWorkerIndices.shift()!
      this.sendSliceToWorker(workerIndex, chunk)
      this.wordsSent += chunk.length
    }
  }

  private get downloadPercent() {
    return Math.trunc((this.downloaded / this.dictionarySize) * 100)
  }
  private get globalProgress() {
    if (this.wordsRemaining === 0) return 0
    const progress = Math.trunc(
      (this.wordsDone / this.wordsRemaining) *
        (this.dictionarySize > 0 ? this.downloadPercent : 100)
    )

    return Math.min(progress, 100)
  }

  constructor(
    algorithm: string,
    token: string,
    onProgress: (progressPercent: number, sample?: string) => void,
    onSucceeded: (secret: string) => void
  ) {
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

    console.info(`Starting brute-force of ${this.wordsRemaining} combinations`)

    this.combinatorWorker.onmessage = (e) => this.dispatchWordsToWorkers(e.data)
    this.combinatorWorker.postMessage({ alphabet, startLength, maxLength })
  }

  public startDictionary = async (
    dictionaryURL: string,
    dictionarySize: number,
    onDownloadProgress: (downloadPercent: number) => void
  ) => {
    this.downloaded = 0
    this.wordsRemaining = 0
    this.dictionarySize = dictionarySize

    console.debug(`starting download of dictionary ${dictionaryURL} (${dictionarySize} bytes)`)

    const response = await fetch(dictionaryURL)

    let splitWord
    for await (const chunk of response.body as any) {
      if (this.isDone) break

      let words = utf8decoder.decode(chunk, { stream: true }).split('\n')
      if (splitWord) {
        words = [splitWord + words.shift(), ...words]
      }
      splitWord = words.pop()

      this.wordsRemaining += words.length
      this.downloaded += chunk.length
      onDownloadProgress(this.downloadPercent)

      await this.dispatchWordsToWorkers(words)
    }

    if (splitWord && !this.isDone) {
      await this.dispatchWordsToWorkers([splitWord])
    }
  }

  public cancel() {
    this.isDone = true
    this.workerPool.forEach((worker) => worker.terminate())
    this.combinatorWorker?.terminate()
    this.workerReadyResolvers.forEach((resolve) => resolve())
  }
}
