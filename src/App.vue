<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

import TextInput from './components/TextInput.vue'
import StepNumber from './components/StepNumber.vue'
import ListSelector from './components/ListSelector.vue'
import MainAnimation from './components/MainAnimation.vue'
import AnimatedButton from './components/AnimatedButton.vue'
import ProgressCircle from './components/ProgressCircle.vue'
import RangeSelector from './components/RangeSelector.vue'

import { validateJWT, getAlgorithm } from './services/jwtValidator'
import { listDictionaries } from './services/dictionaryFetcher'
import BruteForce from './services/bruteforce'
/* import StopWatch from './components/StopWatch.vue' */

enum Method {
  dictionary = 'dictionary',
  alphabet = 'alphabet'
}

const DEFAULT_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const DEFAULT_DICTIONARY = 'scraped-JWT-secrets.txt'
const DEFAULT_ALPHABET_MAX_LENGTH = 6
const ALPHABET_WARNING_COMPLEXITY_THRESHOLD = 10_000_000

const token = ref('')
const tokenLocked = ref(false)
const method = ref()
const alphabet = ref(DEFAULT_ALPHABET)
const alphabetLocked = ref(false)
const alphabetMaxLength = ref(DEFAULT_ALPHABET_MAX_LENGTH)
const dictionaryList = ref([] as any[])
const dictionarySelected = ref()
const dictionaryLocked = ref(false)
const startButtonRef = ref()
const start = ref()
const done = ref(false)
const downloadProgress = ref(0)
const progress = ref(0)
const attempts = ref(0)
const secret = ref()

const isTokenValid = computed(() => validateJWT(token.value)[0])
const errorOutput = computed(() => validateJWT(token.value)[1])
const tokenAlgorithm = computed(() => getAlgorithm(token.value))
const alphabetLength = computed(() => new Set(alphabet.value.split('')).size)
const alphabetComplexity = computed(() => Math.pow(alphabetLength.value, alphabetMaxLength.value))
const step = computed(() => {
  if (token.value.length === 0 || secret.value) {
    return 0
  }
  if (start.value) {
    return 2
  }
  return 1
})

onMounted(async () => {
  dictionaryList.value = await listDictionaries()
  dictionarySelected.value = dictionaryList.value.find((list) => list.name === DEFAULT_DICTIONARY)
})

watch([tokenLocked, method, alphabetLocked, dictionaryLocked], () => {
  start.value = false
  if (!tokenLocked.value) {
    method.value = undefined
  }
  if (method.value === Method.dictionary || !tokenLocked.value) {
    alphabetLocked.value = false
  }
  if (method.value === Method.alphabet || !tokenLocked.value) {
    dictionaryLocked.value = false
  }
  downloadProgress.value = 0
  progress.value = 0
})

const onSuccess = (secretFound: string) => {
  done.value = true
  secret.value = secretFound
  onStop()
}

const updateDownloadProgress = (downloadPercent: number) =>
  (downloadProgress.value = downloadPercent)
const updateGlobalProgress = (progressPercent: number) => {
  progress.value = progressPercent
  if (progressPercent === 100) {
    done.value = true
    onStop()
  }
}

let bruteForceService: BruteForce

const onStart = async () => {
  start.value = new Date()
  downloadProgress.value = 0
  progress.value = 0

  bruteForceService = new BruteForce(
    tokenAlgorithm.value,
    token.value,
    updateGlobalProgress,
    onSuccess
  )

  if (method.value === Method.dictionary) {
    bruteForceService.startDictionary(
      dictionarySelected.value.dictionaryURL,
      dictionarySelected.value.rawSize,
      updateDownloadProgress
    )
  } else if (method.value === Method.alphabet) {
    bruteForceService.startAlphabet(alphabet.value, undefined, alphabetMaxLength.value)
    updateDownloadProgress(100)
  }
}

const onStop = () => {
  bruteForceService.cancel()

  const timeDiff = (new Date() as any) - start.value
  var seconds = Math.round(timeDiff / 1000)
  console.log(seconds + ' seconds')

  start.value = false
}

const fullReset = () => {
  tokenLocked.value = false
  token.value = ''
}

const reset = () => {
  secret.value = ''
  done.value = false
}

const demo = (x = 0) => {
  token.value =
    x === 0
      ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsds'
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.K7Vl1zizbqZsrKQCpvfs2yHJ8wg6vJufLYHbYHaiWPo'
  tokenLocked.value = true
  setTimeout(() => (method.value = Method.dictionary), 750)
  setTimeout(() => {
    dictionaryLocked.value = true
    //scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    scrollToStartButton()
  }, 1500)
}

const scrollToStartButton = () =>
  setTimeout(() => {
    if (startButtonRef.value) {
      startButtonRef.value.$el.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, 1000)
</script>

<template>
  <header>
    <div class="animation">
      <MainAnimation :step="step" />
      <ProgressCircle
        v-if="start || secret"
        :first-percent="downloadProgress"
        :second-percent="progress"
      />
    </div>
    <!--StopWatch :start="!!start" /-->

    <div class="title" v-if="!start && !done">
      <template v-if="token.length === 0">
        <h1 class="accent">JWT Online Cracker</h1>
        <h3>
          Brute-force <b>HS256</b>, <b>HS384</b> or <b>HS512</b> JWT Token from your browser.<br />
          No installation needed.<br />
          <a @click="demo()">Demo</a>,
          <a
            href="https://github.com/flibustier/jwt-online-cracker"
            title="View source code on GitHub"
            >Code</a
          >
        </h3>
      </template>
      <template v-else-if="isTokenValid">
        <h1 class="accent">Valid Token</h1>
        <h3>
          <b>{{ tokenAlgorithm }}</b> algorithm supported.<br />
          <span v-if="dictionaryLocked">
            Dictionary <b>{{ dictionarySelected.name }}</b> selected.<br />
          </span>
          <span v-if="method === Method.alphabet">
            <b>{{ alphabetLength }}</b> symbols selected.<br />
            <b
              :class="{
                warning: alphabetComplexity > ALPHABET_WARNING_COMPLEXITY_THRESHOLD
              }"
            >
              {{ alphabetComplexity.toLocaleString() }}
            </b>
            possible combinations.<br />
          </span>
          <a @click="fullReset">Reset</a>
        </h3>
      </template>
      <template v-else>
        <h1 class="warning">Invalid Token</h1>
        <h3 v-html="errorOutput"></h3>
      </template>
    </div>
  </header>

  <main>
    <TransitionGroup>
      <div class="column" v-if="done" :key="5">
        <div v-if="secret" class="container">
          <h1 class="title-small">Secret found!</h1>
          <h2>
            <b>{{ secret }}</b>
          </h2>
        </div>
        <div v-else class="container">
          <h1 class="warning title-small">Secret not found…</h1>
        </div>
        <AnimatedButton @clicked="reset" content="Restart" />
      </div>
      <template v-else>
        <div class="row" :key="1">
          <StepNumber step="1" :active="!tokenLocked" />
          <TextInput
            v-model="token"
            placeholder="Paste your full JWT Token here"
            :disabled="tokenLocked"
            @submit="tokenLocked = isTokenValid"
          />
          <AnimatedButton
            @clicked="tokenLocked = isTokenValid"
            @clicked-cancel="tokenLocked = false"
            content="Confirm"
            :disabled="!isTokenValid"
            :canceled="tokenLocked"
          />
        </div>
        <div class="row" v-if="tokenLocked" :key="2">
          <StepNumber step="2" :active="!method" />
          <div class="container">
            <h4>Select Brute-force method</h4>
            <div class="row">
              <AnimatedButton
                content="Dictionary (faster)"
                @clicked="method = Method.dictionary"
                :is-selected="method === Method.dictionary"
              />
              <AnimatedButton
                content="Alphabet"
                @clicked="method = Method.alphabet"
                :is-selected="method === Method.alphabet"
              />
            </div>
          </div>
          <div class="fake-button" />
        </div>
        <div class="row" v-if="tokenLocked && method === Method.dictionary" :key="3">
          <StepNumber step="3" :active="!dictionaryLocked && !alphabetLocked" />
          <div class="container">
            <h4>
              Select a
              <a href="https://github.com/danielmiessler/SecLists" target="_blank">Dictionary</a>
            </h4>
            <ListSelector
              :items="dictionaryList"
              v-model="dictionarySelected"
              :disabled="dictionaryLocked"
            />
          </div>
          <AnimatedButton
            @clicked="
              () => {
                dictionaryLocked = true
                scrollToStartButton()
              }
            "
            @clicked-cancel="dictionaryLocked = false"
            content="Confirm"
            :canceled="dictionaryLocked"
          />
        </div>
        <div class="row" v-if="tokenLocked && method === Method.alphabet" :key="3">
          <StepNumber step="3" :active="!dictionaryLocked && !alphabetLocked" />
          <div class="container">
            <h4>Confirm or Modify Alphabet</h4>
            <TextInput
              v-model="alphabet"
              :disabled="alphabetLocked"
              @submit="alphabetLocked = true"
            />
            <RangeSelector v-model="alphabetMaxLength" :min="1" max="12" :disabled="alphabetLocked">
              MAXIMUM LENGTH: <b class="accent">{{ alphabetMaxLength }}</b>
            </RangeSelector>
          </div>
          <AnimatedButton
            content="Confirm"
            @clicked="alphabetLocked = true"
            @clicked-cancel="alphabetLocked = false"
            :canceled="alphabetLocked"
          />
        </div>

        <div class="row" v-if="dictionaryLocked || alphabetLocked" :key="4">
          <StepNumber step="4" :active="true" />
          <div class="container">
            <AnimatedButton
              ref="startButtonRef"
              @clicked="onStart"
              @clicked-cancel="onStop"
              content="Start Brute-force"
              :canceled="start"
              :pulsate="true"
            />
          </div>
          <div class="fake-button" />
        </div>
      </template>
    </TransitionGroup>
  </main>
</template>

<style scoped>
header {
  display: flex;
  justify-content: center;
  margin-right: 3rem;
}

main {
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.animation {
  display: flex;
  justify-content: center;
  align-items: center;
}

.row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

h1 {
  font-weight: 500;
  font-size: 5rem;
  margin-bottom: 1rem;
  line-height: 1.1;
}

.title-small {
  font-size: 4rem;
}

h3 {
  font-size: 1.2rem;
  line-height: 1.5;
  /*
  overflow: hidden;  
  animation: typing 2s linear;
   */
}

/* The typing effect */
@keyframes typing {
  from {
    height: 0;
    border-color: orange;
  }
  to {
    height: 100%;
    border-color: transparent;
  }
}

h4 {
  font-size: 1.1rem;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

h4,
b {
  color: var(--color-accent);
}

:deep(b.warning) {
  color: var(--color-warning);
}

.fake-button {
  width: 9.4rem;
}

.v-move,
.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-2rem);
}
.v-leave-active {
  position: absolute;
}

@media (max-width: 1280px) {
  main {
    margin-top: 2rem;
  }
}
</style>
