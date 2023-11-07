<script setup lang="ts">
defineProps(['content', 'disabled', 'canceled', 'isSelected', 'pulsate'])
defineEmits(['clicked', 'clicked-cancel'])
</script>

<template>
  <button
    @click="canceled ? $emit('clicked-cancel') : $emit('clicked')"
    class="kave-btn"
    :class="{ canceled, selected: isSelected, pulsate }"
    :disabled="disabled"
  >
    <span class="kave-line" :class="{ canceled }"></span>
    {{ canceled ? 'cancel' : content }}
  </button>
</template>

<style scoped>
.kave-btn {
  position: relative;
  background: none;
  border: solid 1px hsla(180, 100%, 50%, 0.3);
  color: hsla(180, 100%, 50%, 0.5);
  border-radius: 0 1rem 0;

  text-transform: uppercase;
  font-weight: normal;
  letter-spacing: 2px;
  padding: 1rem 1.5rem;
  transition: all 0.25s ease;
  outline: none;
}
.kave-btn.canceled {
  border-color: hsla(33, 100%, 50%, 0.5);
  color: hsla(33, 100%, 50%, 0.5);
}
.kave-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  width: 60px;
  height: 1px;
  transform: translateY(-1px);
  background: hsla(180, 100%, 50%, 1);
  transition: all 0.25s ease;
}
.kave-btn:after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 10%;
  width: 60px;
  height: 1px;
  transform: translateY(1px);
  background: hsla(180, 100%, 50%, 1);
  transition: all 0.25s ease;
}

.kave-btn:hover:disabled {
  cursor: not-allowed;
}

.kave-btn.selected,
.kave-btn:hover:enabled {
  box-shadow: 1px 1px 8px hsla(180, 100%, 50%, 0.3);
  color: hsla(180, 100%, 50%, 1);
  text-shadow: 0 0 8px hsla(180, 100%, 50%, 0.4);
}

.kave-btn:hover.canceled {
  box-shadow: 1px 1px 8px hsla(33, 100%, 50%, 0.3);
  color: hsla(33, 100%, 50%, 1);
  text-shadow: 0 0 8px hsla(33, 100%, 50%, 0.4);
}
.kave-btn.selected:before,
.kave-btn:enabled:hover:before {
  left: 0;
  width: 20px;
}
.kave-btn.selected:after,
.kave-btn:enabled:hover:after {
  right: 0;
  width: 20px;
}
.kave-btn.selected .kave-line:before,
.kave-btn:hover:enabled .kave-line:before {
  bottom: 0;
}
.kave-btn.selected .kave-line:after,
.kave-btn:hover:enabled .kave-line:after {
  top: 0;
}
.kave-line:before {
  content: '';
  position: absolute;
  bottom: 30%;
  right: 0;
  width: 1px;
  height: 20px;
  transform: translateX(1px);
  background: hsla(180, 100%, 50%, 1);
  transition: all 0.25s ease;
}
.kave-line:after {
  content: '';
  position: absolute;
  top: 30%;
  left: 0;
  width: 1px;
  height: 20px;
  transform: translateX(-1px);
  background: hsla(180, 100%, 50%, 1);
  transition: all 0.25s ease;
}

.kave-line.canceled:before,
.kave-line.canceled:after,
.kave-btn.canceled:before,
.kave-btn.canceled:after {
  background: hsla(33, 100%, 50%, 1);
}

.kave-btn.pulsate {
  animation: pulsate 3s linear infinite alternate;
}

@keyframes pulsate {
  0% {
    box-shadow: 1px 1px 4px hsla(180, 100%, 50%, 0.1);
    color: hsla(180, 100%, 50%, 0.5);
    text-shadow: 0 0 2px hsla(180, 100%, 50%, 0.1);
  }
  66% {
    box-shadow: 1px 1px 6px hsla(180, 100%, 50%, 0.3);
    color: hsla(180, 100%, 50%, 0.7);
    text-shadow: 0 0 5px hsla(180, 100%, 50%, 0.2);
  }
  100% {
    box-shadow: 1px 1px 10px hsla(180, 100%, 50%, 0.6);
    color: hsla(180, 100%, 50%, 1);
    text-shadow: 0 0 8px hsla(180, 100%, 50%, 0.4);
  }
}
</style>
