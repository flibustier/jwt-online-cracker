<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps(["start"]);

const timeBegan = ref();
const timeStopped = ref();
const running = ref(false);
const clockInterval = ref();
const timeElapsed = ref();

watch(
  () => props.start,
  () => {
    if (props.start === true) {
      reset();
      onStart();
    } else {
      onStop();
    }
  },
);

function onStart() {
  if (running.value) {
    return;
  }

  if (!timeBegan.value) {
    reset();
    timeBegan.value = new Date();
  }

  clockInterval.value = setInterval(clockRunning, 10);
  running.value = true;
}

function onStop() {
  running.value = false;
  timeStopped.value = new Date();
  clearInterval(clockInterval.value);
}

function reset() {
  running.value = false;
  clearInterval(clockInterval.value);
  timeBegan.value = null;
  timeStopped.value = null;
}

const formattedTime = computed(() => {
  const hour = timeElapsed.value.getUTCHours();
  const min = timeElapsed.value.getUTCMinutes();
  const sec = timeElapsed.value.getUTCSeconds();
  const ms = timeElapsed.value.getUTCMilliseconds();

  return (
    zeroPad(hour) +
    ":" +
    zeroPad(min) +
    ":" +
    zeroPad(sec) +
    "." +
    zeroPad(ms, 3)
  );
});

const zeroPad = (x: number, padding: number = 2) =>
  x.toString().padStart(padding, "0");

function clockRunning() {
  timeElapsed.value = new Date((new Date() as any) - timeBegan.value);
}
</script>

<template>
  <div v-if="timeElapsed" class="clock">{{ formattedTime }}</div>
</template>

<style scoped>
@font-face {
  src: url("/fonts/The Led Display St.ttf");
  font-family: "Led Display";
}

.clock {
  font-family: "Led Display";
  font-size: 2rem;
  color: var(--color-accent);
}

/*
  position: absolute;
  bottom: 0;
  border: 1px solid var(--color-accent);
  border-radius: 5rem 5rem 0 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.6rem 2.3rem 0 2.3rem;
  border-bottom: none;
*/
</style>
