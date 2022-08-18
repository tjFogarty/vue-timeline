<template>
  <div tabindex="-1" class="event" :style="positionStyles" ref="target" @mousedown.prevent="handleStartDrag" @mouseup="handleStopDrag">
    <slot v-if="targetIsVisible" name="event" v-bind="{ item: data }">{{ data.name }}</slot>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { useCurrentTimeline } from '../composables/useTimeline';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const target = ref(null);
const isDragging = ref(false);
const targetIsVisible = ref(false);
const { eventPositions, resourceHeight, hoveredResourceId, hoveredDate, datePositions, resourcePositions, columnWidth } = useCurrentTimeline();
const dragOffset = ref(0);
const resourceHeightPx = computed(() => {
  return `${resourceHeight}px`;
});
const draggingPos = computed(() => {
  if (!isDragging.value) return null;

  return {
    x: datePositions.value[hoveredDate.value.toFormat('y-MM-dd')],
    y: resourcePositions.value[hoveredResourceId.value],
  }
});
const position = computed(() => {
  if (!eventPositions.value[props.data.id]) return '';

  const pos = eventPositions.value[props.data.id];
  const x = draggingPos.value ? (draggingPos.value.x - dragOffset.value) : pos.left;
  const y = draggingPos.value ? draggingPos.value.y : pos.top;

  return { x, y, w: pos.width };
});
const positionStyles = computed(() => {
  if (!position.value) return '';

  const { w, x, y  } = position.value;
  return `--transform: translate(${x}px, ${y}px); --width: ${w}px`;
});

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});

function handleStartDrag(e) {
  const colOffsetPos = parseInt(e.offsetX / columnWidth, 10) * columnWidth;
  dragOffset.value = colOffsetPos;
  isDragging.value = true;
}

function handleStopDrag(e) {
  isDragging.value = false;
}
</script>

<style scoped>
.event {
  position: absolute;
  padding: 5px;
  height: v-bind(resourceHeightPx);
  transform: var(--transform);
  width: var(--width);
  transition: transform ease 0.1s;
}
</style>