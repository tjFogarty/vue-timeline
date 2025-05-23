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
  top: var(--header-height);
  opacity: 0.2;
  height: calc(var(--timeline-height) - var(--header-height));
  background-color: #f3f4f6;
  width: calc(var(--column-width) * 2);
}
</style>
