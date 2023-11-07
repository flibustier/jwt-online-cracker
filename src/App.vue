<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

import TextInput from './components/TextInput.vue'
import StepNumber from './components/StepNumber.vue'
import ListSelector from './components/ListSelector.vue'
import MainAnimation from './components/MainAnimation.vue'
import AnimatedButton from './components/AnimatedButton.vue'

import { validateJWT, getAlgorithm } from './services/jwtValidator'
import { listDictionaries } from './services/dictionaryFetcher'

enum Method {
  dictionary = 'dictionary',
  alphabet = 'alphabet'
}

const DEFAULT_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const DEFAULT_DICTIONARY = 'scraped-JWT-secrets.txt'

const token = ref('')
const tokenLocked = ref(false)
const method = ref()
const alphabet = ref(DEFAULT_ALPHABET)
const alphabetLocked = ref(false)
const dictionaryList = ref([] as any[])
const dictionarySelected = ref()
const dictionaryLocked = ref(false)
const start = ref(false)

const isTokenValid = computed(() => validateJWT(token.value)[0])
const errorOutput = computed(() => validateJWT(token.value)[1])
const tokenAlgorithm = computed(() => getAlgorithm(token.value))
const step = computed(() => (token.value.length > 0 ? 1 : 0))

onMounted(async () => {
  dictionaryList.value = await listDictionaries()
  dictionarySelected.value = dictionaryList.value.find((list) => list.name === DEFAULT_DICTIONARY)
})

watch([tokenLocked, method, alphabetLocked, dictionaryLocked], () => {
  start.value = false
  if (method.value === Method.dictionary) {
    alphabetLocked.value = false
  }
  if (method.value === Method.alphabet) {
    dictionaryLocked.value = false
  }
})
</script>

<template>
  <header>
    <MainAnimation :step="step" />
    <div class="title">
      <template v-if="token.length === 0">
        <h1 class="accent">JWT Online Cracker</h1>
        <h3>
          Brute-force <b>HS256</b>, <b>HS384</b> or <b>HS512</b> JWT Token from your browser.<br />
          No installation needed.
        </h3>
      </template>
      <template v-else-if="isTokenValid">
        <h1 class="accent">Valid Token</h1>
        <h3>
          <b>{{ tokenAlgorithm }}</b> algorithm supported.<br />
          <span v-if="dictionaryLocked"
            >Dictionary <b>{{ dictionarySelected.name }}</b> selected.</span
          >
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
      <div class="row" :key="1">
        <StepNumber step="1" />
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
        <StepNumber step="2" />
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
      <div class="row" v-if="tokenLocked && method === Method.alphabet" :key="3">
        <StepNumber step="3" />
        <div class="container">
          <h4>Confirm or Modify Alphabet</h4>
          <TextInput
            v-model="alphabet"
            :disabled="alphabetLocked"
            @submit="alphabetLocked = true"
          />
        </div>
        <AnimatedButton
          content="Confirm"
          @clicked="alphabetLocked = true"
          @clicked-cancel="alphabetLocked = false"
          :canceled="alphabetLocked"
        />
      </div>
      <div class="row" v-if="tokenLocked && method === Method.dictionary" :key="3.5">
        <StepNumber step="3" />
        <div class="container">
          <h4>Select a Dictionary</h4>
          <ListSelector
            :items="dictionaryList"
            v-model="dictionarySelected"
            :disabled="dictionaryLocked"
          />
        </div>
        <AnimatedButton
          @clicked="dictionaryLocked = true"
          @clicked-cancel="dictionaryLocked = false"
          content="Confirm"
          :canceled="dictionaryLocked"
        />
      </div>
      <div class="row" v-if="dictionaryLocked || alphabetLocked" :key="4">
        <StepNumber step="4" />
        <div class="container">
          <AnimatedButton
            @clicked="start = true"
            @clicked-cancel="start = false"
            content="Start Brute-force"
            :canceled="start"
            :pulsate="true"
          />
        </div>
        <div class="fake-button" />
      </div>
    </TransitionGroup>
  </main>
</template>

<style scoped>
header {
  display: flex;
  justify-content: center;
  margin-right: 1rem;
}

main {
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
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
  font-size: 2.6rem;
}

h3 {
  font-size: 1.2rem;
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
  width: 9.4rem;;
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

@media (min-width: 1024px) {
  /*
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
  */
}
</style>
