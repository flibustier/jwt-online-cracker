<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps(['modelValue', 'placeholder', 'disabled'])
defineEmits(['update:modelValue', 'submit'])

const rows = computed(() => (props.modelValue ? 5 : 5))
</script>

<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as any)?.value)"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    @keypress.enter="$emit('submit')"
  />
</template>

<style scoped>
textarea {
  resize: none;
  outline: none;
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-accent);
  width: 100%;
  padding: 1rem;
  border-radius: 1rem;
  font-family: inherit;
  text-transform: none;
  caret-color: var(--color-accent);
}

textarea:disabled {
  border: 1px solid hsla(180, 100%, 50%, 0.3);
}
</style>
