<template>
  <div
    ref="target"
    tabindex="-1"
    class="event"
    :style="positionStyles"
    :class="{
      'is-dragging': isDragging,
      'is-visible': targetIsVisible,
    }"
    @mousedown.prevent="handleStartDrag"
    @mouseup="handleStopDrag"
  >
    <div class="event-timeline-fill"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { useCurrentMousePosition } from '../composables/useMousePosition';
import useTimelineStore from '../store';
import { DATE_FORMAT } from '../constants';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const target = ref(null);
const isDragging = ref(false);
const targetIsVisible = ref(false);
const { hoveredDate } = useCurrentMousePosition();
const store = useTimelineStore();
const dragOffset = ref(0);
const draggingPos = computed(() => {
  if (!isDragging.value) return null;

  return {
    x: store.datePositions[hoveredDate.value.toFormat(DATE_FORMAT)],
  };
});
const position = computed(() => {
  if (!store.eventPositions[props.data.id]) return '';

  const pos = store.eventPositions[props.data.id];
  const x = draggingPos.value
    ? draggingPos.value.x - dragOffset.value
    : pos.left;
  const y = pos.top;

  return { x, y, w: pos.width };
});
const positionStyles = computed(() => {
  if (!position.value) return '';

  const { w, x, y } = position.value;
  return `--transform: translate(${x}px, ${y}px); --width: ${w}px`;
});
const resourceColour = computed(() => {
  return store.resources[props.data.resourceId].colour;
});

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});

function handleStartDrag(e) {
  const colOffsetPos =
    parseInt(e.offsetX / store.columnWidth, 10) * store.columnWidth;
  dragOffset.value = colOffsetPos;
  isDragging.value = true;
}

function handleStopDrag() {
  // console.log(draggingPos.value.x - dragOffset.value);
  isDragging.value = false;
}
</script>

<style scoped>
.event {
  position: absolute;
  padding: 10px;
  height: var(--row-height);
  transform: var(--transform);
  width: var(--width);
  cursor: grab;
  opacity: 0;
  transition:
    transform ease 0.1s,
    opacity ease 0.2s;
}

.event.is-visible {
  opacity: 1;
}

.event.is-dragging {
  cursor: grabbing;
}

.event-timeline-fill {
  width: 100%;
  height: 100%;
  background-color: #ccc;
  border-radius: 20px;
}
</style>
