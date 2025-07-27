<script setup lang="ts">
const model = defineModel()

defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <label class="form-control">
    <input v-model="model" type="checkbox" name="checkbox" :disabled="disabled" />
    <slot>{{ label }}</slot>
  </label>
</template>

<style scoped>
*,
*:before,
*:after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.form-control {
  display: flex;
  align-items: center;
  gap: 1rem;

  text-transform: uppercase;
  color: var(--color-accent);
}

.form-control:has(> input[type='checkbox']:disabled) {
  cursor: not-allowed;
}

.form-control + .form-control {
  margin-top: 1em;
}

.form-control:hover,
input[type='checkbox'] {
  cursor: pointer;
}

input[type='checkbox'] {
  /* Add if not using autoprefixer */
  -webkit-appearance: none;
  /* Remove most all native input styles */
  appearance: none;
  /* Not removed via appearance */
  margin: 0;

  font: inherit;
  color: currentColor;
  width: 2rem;
  height: 2rem;
  transform: translateY(-0.075em);

  display: grid;
  place-content: center;

  border: transparent 2px solid;
  border-radius: 100%;
  animation: rotating-border 2s ease-in-out infinite alternate;

  --border-color: var(--color-accent);
}

@keyframes rotating-border {
  0% {
    border-left-color: var(--border-color);
    border-right-color: var(--border-color);
  }
  100% {
    border-top-color: var(--border-color);
    border-bottom-color: var(--border-color);
  }
}

input[type='checkbox']::before {
  content: '';
  width: 1rem;
  height: 1rem;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  border: 4px solid var(--color-accent);
  border-radius: 100%;
}

input[type='checkbox']:checked::before {
  transform: scale(1);
}

input[type='checkbox']:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

input[type='checkbox']:disabled {
  --border-color: hsla(180, 100%, 50%, 0.3);
  border-left-color: var(--border-color);
  border-right-color: var(--border-color);
  animation: none;
  cursor: not-allowed;
}
</style>
