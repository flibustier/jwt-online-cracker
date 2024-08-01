<script setup lang="ts">
defineProps(["step", "active"]);
</script>

<template>
  <span class="step" :class="{ active }">{{ step }}</span>
</template>

<style scoped>
.step {
  height: 100%;
  padding: 0.5rem 1rem;
  border-radius: 5rem;
  border: 1px solid hsla(180, 100%, 50%, 0.3);
  color: hsla(180, 100%, 50%, 0.5);
}

.step.active {
  color: var(--color-accent);
  border: 1px var(--color-accent) solid;
}
</style>
