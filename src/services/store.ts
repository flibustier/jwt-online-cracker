import { reactive, computed } from "vue";

const DEFAULT_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DEFAULT_ALPHABET_MAX_LENGTH = 6;

export enum Method {
  alphabet = "alphabet",
  dictionary = "dictionary",
  dictionaryCustom = "custom",
}

interface Dictionary {
  name: string;
  dictionaryURL: string;
  rawSize: number;
}

const defaultState = {
  token: "",
  isTokenLocked: false,

  secret: null as string | null,

  method: null as Method | null,

  alphabetSelected: DEFAULT_ALPHABET,
  isAlphabetLocked: false,
  alphabetMaxLength: DEFAULT_ALPHABET_MAX_LENGTH,

  dictionarySelected: null as Dictionary | null,
  isDictionaryLocked: false,

  customDictionaryURL: null as string | null,
  isCustomDictionaryLocked: false,

  startTime: null as Date | null,
  stopTime: null as Date | null,

  isDone: false,

  progressPercent: 0,
  downloadPercent: 0,
  lastWord: "",
};

export const store = reactive({
  ...defaultState,

  timeElapsed() {
    if (!this.startTime) {
      return 0;
    }
    const differenceInMilliseconds =
      (this.stopTime || new Date()).getTime() - this.startTime.getTime();
    const seconds = Math.floor(differenceInMilliseconds / 1000);

    return seconds;
  },

  end() {
    this.stopTime = new Date();
    this.isDone = true;
  },

  reset() {
    this.secret = null;
    this.isDone = false;
    this.startTime = null;
    this.stopTime = null;
    this.downloadPercent = 0;
    this.progressPercent = 0;
    this.lastWord = "";
  },

  start() {
    this.reset();
    this.startTime = new Date();
  },

  hardReset() {
    this.reset();
    this.isTokenLocked = false;
    this.token = "";
  },

  onSuccess(secretFound: string) {
    this.secret = secretFound;
    this.end();

    addToHistory({
      token: this.token,
      secret: this.secret,
      date: new Date().toISOString(),
      method: this.method!,
    });
  },

  setMethod(method: Method) {
    this.method = method;
    if (method !== Method.dictionary) {
      this.isDictionaryLocked = false;
    }
    if (method !== Method.alphabet) {
      this.isAlphabetLocked = false;
    }
    if (method !== Method.dictionaryCustom) {
      this.isCustomDictionaryLocked = false;
    }
  },

  updateDownloadProgress(downloadPercent: number) {
    this.downloadPercent = downloadPercent;
  },

  updateGlobalProgress(progressPercent: number, sample?: string) {
    if (sample) {
      this.lastWord = sample;
    }
    this.progressPercent = progressPercent;
    if (progressPercent === 100) {
      this.end();
    }
  },
});

export const hasStarted = computed(
  () => store.startTime !== null && !store.isDone,
);

interface HistoryShard {
  token: string;
  secret: string;
  method: Method;
  date: string;
}

const addToHistory = (historyShard: HistoryShard) => {
  const history = JSON.parse(localStorage.getItem("history") || "[]");
  history.push(historyShard);
  localStorage.setItem("history", JSON.stringify(history));
};
