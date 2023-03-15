<template>
  <div
    ref="target"
    tabindex="-1"
    class="resource-timeline"
    :style="positionStyles"
  >
    <div class="timeline-fill"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { useCurrentMousePosition } from '../composables/useMousePosition';
import { useTimelineStore } from '../store/useTimelineStore';
import { DATE_FORMAT } from '../constants';

const props = defineProps({
  resourceId: {
    type: [Number, String],
    required: true,
  },
});

const timelineStore = useTimelineStore();

const resourceHeightPx = computed(() => {
  return `${timelineStore.rowHeight}px`;
});

const position = computed(() => {
  if (!timelineStore.resourceTimelines[props.resourceId]) return '';

  const pos = timelineStore.resourceTimelines[props.resourceId];
  const x = pos.left;
  const y = pos.top;

  return { x, y, w: pos.width };
});
const positionStyles = computed(() => {
  if (!position.value) return '';

  const { w, x, y } = position.value;
  return `--transform: translate(${x}px, ${y}px); --width: ${w}px`;
});
</script>

<style scoped>
.resource-timeline {
  position: absolute;
  padding: 5px;
  height: v-bind(resourceHeightPx);
  transform: var(--transform);
  width: var(--width);
  padding: 10px;
}

.timeline-fill {
  background-color: #5c9dff;
  width: 100%;
  height: 100%;
  border-radius: 20px;
}
</style>
