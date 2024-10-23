<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import TextInput from "./components/TextInput.vue";
import StepNumber from "./components/StepNumber.vue";
import ListSelector from "./components/ListSelector.vue";
import MainAnimation from "./components/MainAnimation.vue";
import AnimatedButton from "./components/AnimatedButton.vue";
import ProgressCircle from "./components/ProgressCircle.vue";
import RangeSelector from "./components/RangeSelector.vue";
/* import StopWatch from './components/StopWatch.vue' */

import BruteForce from "./services/bruteforce";
import { validateJWT, getAlgorithm } from "./services/jwtValidator";
import { listDictionaries } from "./services/dictionaryFetcher";
import { dispatchSuccessEvent } from "./services/statistics";
import { store, Method, hasStarted } from "./services/store";

const DEFAULT_DICTIONARY = "scraped-JWT-secrets.txt";
const ALPHABET_WARNING_COMPLEXITY_THRESHOLD = 10_000_000;

const dictionaryList = ref([] as any[]);
const startButtonRef = ref();

const isTokenValid = computed(() => validateJWT(store.token)[0]);
const errorOutput = computed(() => validateJWT(store.token)[1]);
const tokenAlgorithm = computed(() => getAlgorithm(store.token));
const alphabetLength = computed(
  () => new Set(store.alphabetSelected.split("")).size,
);
const alphabetComplexity = computed(() =>
  Math.pow(alphabetLength.value, store.alphabetMaxLength),
);
const logoAnimationStep = computed(() => {
  if (store.token.length === 0 || store.secret) {
    return 0;
  }
  if (hasStarted.value) {
    return 2;
  }
  return 1;
});

onMounted(async () => {
  dictionaryList.value = await listDictionaries();
  store.dictionarySelected = dictionaryList.value.find(
    (list) => list.name === DEFAULT_DICTIONARY,
  );
});

/*
watch([tokenLocked, method, alphabetLocked, dictionaryLocked], () => {
  start.value = false;
  if (!store.isTokenLocked) {
    store.method = undefined;
  }
  if (store.method === Method.dictionary || !store.isTokenLocked) {
    store.isAlphabetLocked = false;
  }
  if (store.method === Method.alphabet || !store.isTokenLocked) {
    store.isDictionaryLocked = false;
  }
  downloadProgress.value = 0;
  progress.value = 0;
});
*/

let bruteForceService: BruteForce;

const onStart = async () => {
  store.start();

  bruteForceService = new BruteForce(
    tokenAlgorithm.value,
    store.token,
    (progress: number) => store.updateGlobalProgress(progress),
    (secret: string) => {
      store.onSuccess(secret);
      dispatchSuccessEvent();
    },
  );

  if (store.method === Method.dictionary) {
    bruteForceService.startDictionary(
      store.dictionarySelected?.dictionaryURL || "",
      store.dictionarySelected?.rawSize || 0,
      (percent: number) => store.updateDownloadProgress(percent),
    );
  } else if (store.method === Method.alphabet) {
    bruteForceService.startAlphabet(
      store.alphabetSelected,
      undefined,
      store.alphabetMaxLength,
    );
    store.updateDownloadProgress(100);
  }
};

const onStop = () => {
  bruteForceService.cancel();
  store.end();

  const seconds = store.timeElapsed();
  console.debug(seconds + " seconds elapsed");
};

const activeStep = computed(() => {
  if (!store.isTokenLocked) {
    return 1;
  }
  if (!store.method) {
    return 2;
  }
  if (!store.isDictionaryLocked && !store.isAlphabetLocked) {
    return 3;
  }
  return 4;
});

const demo = () => {
  store.token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsds";
  store.isTokenLocked = true;
  setTimeout(() => store.setMethod(Method.dictionary), 750);
  setTimeout(() => {
    store.isDictionaryLocked = true;
    //scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    scrollToStartButton();
  }, 1500);
};

const scrollToStartButton = () =>
  setTimeout(() => {
    if (startButtonRef.value) {
      startButtonRef.value.$el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, 1000);
</script>

<template>
  <header>
    <div class="animation">
      <MainAnimation :step="logoAnimationStep" />
      <ProgressCircle
        v-if="hasStarted || store.secret"
        :first-percent="store.downloadPercent"
        :second-percent="store.progressPercent"
      />
    </div>
    <!--StopWatch :start="!!start" /-->

    <div class="title" v-if="!hasStarted && !store.isDone">
      <template v-if="store.token.length === 0">
        <h1 class="accent">JWT Online Cracker</h1>
        <h2>
          Brute-force <b>HS256</b>, <b>HS384</b> or <b>HS512</b> JWT Token from
          your browser.<br />
          No installation needed.<br />
          <a href="#" @click="demo()">Demo</a>,
          <a
            href="https://github.com/flibustier/jwt-online-cracker"
            title="View source code on GitHub"
          >
            Code
          </a>
        </h2>
      </template>
      <template v-else-if="isTokenValid">
        <h1 class="accent">Valid Token</h1>
        <h2>
          <b>{{ tokenAlgorithm }}</b> algorithm supported.<br />
          <span v-if="store.isDictionaryLocked">
            <b>{{ store.dictionarySelected?.name }}</b> selected.<br />
          </span>
          <span v-if="store.method === Method.alphabet">
            <b>{{ alphabetLength }}</b> symbols selected.<br />
            <b
              :class="{
                warning:
                  alphabetComplexity > ALPHABET_WARNING_COMPLEXITY_THRESHOLD,
              }"
            >
              {{ alphabetComplexity.toLocaleString() }}
            </b>
            possible combinations.<br />
          </span>
          <br />
          <a @click="store.hardReset()">Reset</a>
        </h2>
      </template>
      <template v-else>
        <h1 class="warning">Invalid Token</h1>
        <h2 v-html="errorOutput"></h2>
      </template>
    </div>
  </header>

  <main style="position: relative">
    <TransitionGroup>
      <div class="column" v-if="store.isDone" :key="5">
        <div v-if="store.secret" class="container">
          <h1 class="title-small">Secret found!</h1>
          <h2>
            <b>{{ store.secret }}</b>
          </h2>
        </div>
        <div v-else class="container">
          <h1 class="warning title-small">Secret not found…</h1>
        </div>
        <AnimatedButton @clicked="store.reset()" content="Restart" />
      </div>
      <template v-else>
        <div class="row" :key="1">
          <StepNumber step="1" :active="activeStep === 1" />
          <TextInput
            v-model="store.token"
            placeholder="Paste your full JWT Token here"
            :disabled="store.isTokenLocked"
            @submit="store.isTokenLocked = isTokenValid"
          />
          <AnimatedButton
            @clicked="store.isTokenLocked = isTokenValid"
            @clicked-cancel="store.isTokenLocked = false"
            content="Confirm"
            :disabled="!isTokenValid"
            :canceled="store.isTokenLocked"
          />
        </div>
        <div class="row" v-if="store.isTokenLocked" :key="2">
          <StepNumber step="2" :active="activeStep === 2" />
          <div class="container">
            <h4>Select Brute-force method</h4>
            <div class="row">
              <AnimatedButton
                content="Dictionary (faster)"
                @clicked="store.setMethod(Method.dictionary)"
                :is-selected="store.method === Method.dictionary"
              />
              <AnimatedButton
                content="Alphabet"
                @clicked="store.setMethod(Method.alphabet)"
                :is-selected="store.method === Method.alphabet"
              />
            </div>
          </div>
          <div class="fake-button" />
        </div>
        <div
          class="row"
          v-if="store.isTokenLocked && store.method === Method.dictionary"
          :key="3.1"
        >
          <StepNumber step="3" :active="activeStep === 3" />
          <div class="container">
            <h4>
              Select a
              <a
                href="https://github.com/danielmiessler/SecLists"
                target="_blank"
                >Dictionary</a
              >
            </h4>
            <ListSelector
              :items="dictionaryList"
              v-model="store.dictionarySelected"
              :disabled="hasStarted"
            />
          </div>
          <AnimatedButton
            @clicked="
              () => {
                store.isDictionaryLocked = true;
                scrollToStartButton();
              }
            "
            @clicked-cancel="store.isDictionaryLocked = false"
            content="Confirm"
            :canceled="store.isDictionaryLocked"
          />
        </div>
        <div
          class="row"
          v-if="store.isTokenLocked && store.method === Method.alphabet"
          :key="3.2"
        >
          <StepNumber step="3" :active="activeStep === 3" />
          <div class="container">
            <h4>Confirm or Modify Alphabet</h4>
            <TextInput
              v-model="store.alphabetSelected"
              :disabled="store.isAlphabetLocked"
              @submit="store.isAlphabetLocked = true"
            />
            <RangeSelector
              v-model="store.alphabetMaxLength"
              :min="1"
              max="12"
              :disabled="store.isAlphabetLocked"
            >
              MAXIMUM LENGTH:
              <b class="accent">{{ store.alphabetMaxLength }}</b>
            </RangeSelector>
          </div>
          <AnimatedButton
            content="Confirm"
            @clicked="store.isAlphabetLocked = true"
            @clicked-cancel="store.isAlphabetLocked = false"
            :canceled="store.isAlphabetLocked"
          />
        </div>

        <div class="row" v-if="activeStep === 4" :key="4">
          <StepNumber step="4" :active="true" />
          <div class="container">
            <AnimatedButton
              ref="startButtonRef"
              @clicked="onStart"
              @clicked-cancel="onStop"
              content="Start Brute-force"
              :canceled="hasStarted"
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

h2 {
  font-size: 1.2rem;
  line-height: 1.5;
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
.v-enter-from {
  opacity: 0;
  transform: translateY(-2rem);
}
.v-leave-to {
  opacity: 0;
}
.v-leave-active {
  position: absolute;
  bottom: 0;
  width: 100%;
}

@media (max-width: 1280px) {
  main {
    margin-top: 2rem;
  }
}
</style>
