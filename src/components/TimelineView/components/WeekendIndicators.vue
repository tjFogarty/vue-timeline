<template>
  <div
    v-for="weekend in store.weekendOccurences"
    :key="weekend.date.valueOf()"
    :style="`--transform: translateX(${weekend.leftPos}px);`"
    class="weekend-indicator"
    aria-hidden="true"
  ></div>
</template>

<script setup>
import useTimelineStore from '../store';

const store = useTimelineStore();
</script>

<style scoped>
.weekend-indicator {
  position: absolute;
  pointer-events: none;
  transform: var(--transform);
  z-index: -1;
  top: 0;
  opacity: 0.2;
  height: 100%;
  background-color: #ccc;
  width: calc(var(--column-width) * 2);
}
</style>
