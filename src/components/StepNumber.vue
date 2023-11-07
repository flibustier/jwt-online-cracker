<script setup lang="ts">
defineProps(['step'])
</script>

<template>
  <span class="step">{{ step }}</span>
</template>

<style scoped>
.step {
  padding: 0.5rem 1rem;
  color: var(--color-accent);
  border-radius: 5rem;
  border: 1px var(--color-accent) solid;
  height: 100%;
}
</style>
