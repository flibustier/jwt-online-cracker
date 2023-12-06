<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps(['items', 'modelValue', 'disabled'])

const suggestionsRefs = ref([] as (HTMLElement | null)[])

const selectedIndex = computed(() =>
  props.items.findIndex((item: any) => item.name === props.modelValue?.name)
)
const selectedRef = computed(() => suggestionsRefs.value[selectedIndex.value])

const scrollToSelected = () => {
  selectedRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}

const handleKeyup = (event: KeyboardEvent) => {
  if (props.disabled) {
    return
  }

  if (event.code === 'ArrowUp') {
    navigate('up')
  } else if (event.code === 'ArrowDown') {
    navigate('down')
  }
}

const navigate = (direction: 'up' | 'down') => {
  if (props.items.length === 0) {
    return
  }

  let newIndex
  if (props.modelValue == null) {
    newIndex = 0
  } else if (direction === 'up') {
    if (selectedIndex.value === 0) {
      newIndex = props.items.length - 1
    } else {
      newIndex = selectedIndex.value - 1
    }
  } else {
    newIndex = (selectedIndex.value + 1) % props.items.length
  }

  emit('update:modelValue', props.items[newIndex])
}

const updateSelected = (list: any) => {
  if (!props.disabled) {
    emit('update:modelValue', list)
  }
}

watch(() => props.modelValue, scrollToSelected)

onMounted(() => {
  scrollToSelected()
  window.addEventListener('keydown', handleKeyup)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyup)
})
</script>

<template>
  <ul>
    <li
      v-for="(list, index) in items"
      :key="index"
      :class="{
        disabled: disabled,
        selected: selectedIndex === index,
        previous: selectedIndex - 1 === index
      }"
      ref="suggestionsRefs"
      @click="updateSelected(list)"
    >
      {{ list.name }} ({{ list.size }})
    </li>
  </ul>
</template>

<style scoped>
ul {
  height: 10rem;
  width: 30rem;
  overflow-y: scroll;
  list-style: none;
  text-align: center;
  padding: 0;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

ul::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

li {
  color: hsla(180, 100%, 50%, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
  text-transform: none;
}

li.disabled {
  cursor: not-allowed;
}

li.selected + li,
li.previous {
  color: hsla(180, 100%, 50%, 0.5);
  font-size: 0.95rem;
}

li.selected {
  color: var(--color-accent);
  font-size: 1rem;
  padding: 0.1rem;
}
</style>
