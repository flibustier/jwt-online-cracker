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

textarea:not(:disabled) {
  animation: pulsate 2s ease-in-out infinite alternate;
}

textarea:disabled {
  border: 1px solid hsla(180, 100%, 50%, 0.3);
}

@keyframes pulsate {
  0% {
    box-shadow: 1px 1px 7px hsla(180, 100%, 50%, 0.6);
    color: hsla(180, 100%, 50%, 0.6);
    text-shadow: 0 0 2px hsla(180, 100%, 50%, 0.6);
  }
  66% {
    box-shadow: 1px 1px 10px hsla(180, 100%, 50%, 0.7);
    color: hsla(180, 100%, 50%, 0.7);
    text-shadow: 0 0 5px hsla(180, 100%, 50%, 0.7);
  }
  100% {
    box-shadow: 1px 1px 15px hsla(180, 100%, 50%, 1);
    color: hsla(180, 100%, 50%, 1);
    text-shadow: 0 0 8px hsla(180, 100%, 50%, 1);
  }
}
</style>
