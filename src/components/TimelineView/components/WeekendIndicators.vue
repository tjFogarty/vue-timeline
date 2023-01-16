<template>
  <div
    v-for="weekend in timelineStore.weekendOccurences"
    :key="weekend.date.valueOf()"
    :style="`--transform: translateX(${weekend.leftPos}px);`"
    class="weekend-indicator"
    aria-hidden="true"
  ></div>
</template>

<script setup>
import { computed } from 'vue';
import { useTimelineStore } from '../store/useTimelineStore';

const timelineStore = useTimelineStore();

const weekendIndicatorWidth = computed(() => {
  return `${timelineStore.columnWidth * 2}px`;
});
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
  width: v-bind(weekendIndicatorWidth);
}
</style>
