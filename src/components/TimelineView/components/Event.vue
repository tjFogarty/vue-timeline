<template>
  <div class="event" :style="positionStyles" ref="target">
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
const positionStyles = computed(() => {
  if (!eventPositions.value[props.data.id]) return '';

  const position = eventPositions.value[props.data.id];
  return `--transform: translate(${position.left}px, ${position.top}px); --width: ${position.width}px`;
});

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  targetIsVisible.value = isIntersecting;
});
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