<template>
  <div tabindex="-1" class="event" :style="positionStyles" ref="target">
    <slot v-if="targetIsVisible" name="event" v-bind="{ item: data }">{{ data.name }}</slot>
  </div>
</template>

<script setup>
// TODO: Drag and drop events
import { ref, computed } from 'vue';
import { useIntersectionObserver, useDraggable } from '@vueuse/core';
import { useCurrentTimeline } from '../composables/useTimeline';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const target = ref(null);
const isDragging = ref(false);
const draggingPos = ref({ x: 0, y: 0 });
const targetIsVisible = ref(false);
const { eventPositions, resourceHeight, hoveredResourceId, hoveredDate, datePositions, resourcePositions } = useCurrentTimeline();
const resourceHeightPx = computed(() => {
  return `${resourceHeight}px`;
});
const position = computed(() => {
  if (!eventPositions.value[props.data.id]) return '';

  const pos = eventPositions.value[props.data.id];
  const x = isDragging.value ? draggingPos.value.x : pos.left;
  const y = isDragging.value ? draggingPos.value.y : pos.top;

  return { x, y, w: pos.width };
});
const positionStyles = computed(() => {
  if (!position.value) return '';

  return `--transform: translate(${position.value.x}px, ${position.value.y}px); --width: ${position.value.w}px`;
});

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});

useDraggable(target, {
  onStart: () => {
    isDragging.value = true;
    const x = datePositions.value[hoveredDate.value.toFormat('y-MM-dd')];
    const y = resourcePositions.value[hoveredResourceId.value];
    draggingPos.value.x = x;
    draggingPos.value.y = y;
  },
  onEnd: () => {
    isDragging.value = false;
  },
  onMove: () => {
    const x = datePositions.value[hoveredDate.value.toFormat('y-MM-dd')];
    const y = resourcePositions.value[hoveredResourceId.value];
    draggingPos.value.x = x;
    draggingPos.value.y = y;
  }
});
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