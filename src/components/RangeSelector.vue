<script setup lang="ts">
defineProps(['modelValue', 'min', 'max', 'label', 'disabled'])
defineEmits(['update:modelValue'])

const id = 'range-' + Math.random().toString(36).substring(2, 11)
</script>

<template>
  <div class="range-input-group">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as any)?.value)"
      type="range"
      :id="id"
      :name="id"
      :min="min || 1"
      :max="max"
      :disabled="disabled"
      step="1"
    />
    <label :for="id"><slot></slot></label>
  </div>
</template>

<style scoped>
.range-input-group {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
}

/********** Range Input Styles **********/
/*Range Reset*/
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 15rem;
}

/* Removes default focus */
input[type='range']:focus {
  outline: none;
}

input[type='range']:disabled {
  cursor: not-allowed;
}

/* slider track */
input[type='range']::-webkit-slider-runnable-track,
input[type='range']::-moz-range-track {
  background-color: #115e5e;
  border-radius: 0.5rem;
  height: 0.1rem;
}

/* slider thumb */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  margin-top: -12px; /* Centers thumb on the track */
}
input[type='range']::-moz-range-thumb {
  border: none; /*Removes extra border that FF applies*/
  border-radius: 0; /*Removes default border-radius that FF applies*/
}
input[type='range']::-moz-range-thumb,
input[type='range']::-webkit-slider-thumb {
  /*custom styles*/
  background-color: var(--color-accent);
  height: 1rem;
  width: 0.1rem;
}

input[type='range']:focus::-webkit-slider-thumb,
input[type='range']:focus::-moz-range-thumb {
  border: 1px solid var(--color-accent);
  border-radius: 1rem;
  /*outline: 1px solid var(--color-accent);
  outline-offset: 0.125rem;*/
}
</style>
