<script setup lang="ts">
import { computed } from "vue";

const props = defineProps(["firstPercent", "secondPercent"]);
const maxPercent = computed(() =>
  Math.max(props.firstPercent, props.secondPercent),
);
</script>

<template>
  <div
    class="progress-bar"
    role="progressbar"
    :aria-valuenow="maxPercent"
    aria-valuemin="0"
    aria-valuemax="100"
    :style="{ '--p1': secondPercent + '%', '--p2': firstPercent + '%' }"
  ></div>
</template>

<style scoped>
@property --p1 {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

@property --p2 {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

.progress-bar {
  width: 195px;
  height: 195px;
  border-radius: 50%;

  background: radial-gradient(
      closest-side,
      var(--color-background) 90%,
      transparent 90% 100%
    ),
    conic-gradient(
      var(--color-accent) 0 var(--p1),
      var(--color-warning) var(--p1) var(--p2),
      transparent 0
    );

  position: absolute;
  z-index: -1;
  transition:
    --p1 2s,
    --p2 2s;
}
</style>
