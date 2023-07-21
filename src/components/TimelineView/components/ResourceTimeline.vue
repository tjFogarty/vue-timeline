<template>
  <div tabindex="-1" class="resource-timeline" :style="positionStyles">
    <div class="timeline-fill"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import useTimelineStore from '../store';

const props = defineProps({
  resourceId: {
    type: [Number, String],
    required: true,
  },
});

const store = useTimelineStore();

const position = computed(() => {
  if (!store.resourceTimelines[props.resourceId]) return '';

  const pos = store.resourceTimelines[props.resourceId];
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
  height: var(--row-height);
  transform: var(--transform);
  width: var(--width);
  padding: 8px;
}

.timeline-fill {
  background-color: #007be0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
}
</style>
