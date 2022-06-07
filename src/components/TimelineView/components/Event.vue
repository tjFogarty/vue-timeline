<template>
  <div class="event" :style="positionStyles" ref="target" draggable="true" @dragstart="handleDragStart"
    @dragend="handleDragEnd">
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
const targetIsVisible = ref(false);
const { eventPositions, resourceHeight } = useCurrentTimeline();
const resourceHeightPx = computed(() => {
  return `${resourceHeight}px`;
});
const position = computed(() => {
  if (!eventPositions.value[props.data.id]) return '';
  const pos = eventPositions.value[props.data.id];
  return { x: pos.left, y: pos.top, w: pos.width };
});
const positionStyles = computed(() => {
  if (!position.value) return '';

  return `--transform: translate(${position.value.x}px, ${position.value.y}px); --width: ${position.value.w}px`;
});

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});

function handleDragStart(e) {
  console.log('drag start', { e })
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnd(e) {
  console.log('drag end', { e });
}
</script>

<style scoped>
.event {
  position: absolute;
  padding: 5px;
  height: v-bind(resourceHeightPx);
  transform: var(--transform);
  width: var(--width);
}
</style>