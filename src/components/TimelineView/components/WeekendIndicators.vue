<template>
<div v-for="weekend in weekendOccurences" :key="weekend.date.valueOf()" :style="`left: ${weekend.leftPos}px;`" class="weekend-indicator">
      </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCurrentTimeline } from '../composables/useTimeline';

const { weekendOccurences, columnWidth } = useCurrentTimeline();

const weekendIndicatorWidth = computed(() => {
  return `${columnWidth * 2}px`;
});
</script>

<style scoped>
.weekend-indicator {
  position: absolute;
  pointer-events: none;
  z-index: -1;
  top: 0;
  opacity: 0.2;
  height: 100%;
  background-color: #ccc;
  width: v-bind(weekendIndicatorWidth);
}
</style>