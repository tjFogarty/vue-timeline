<template>
  <div
    tabindex="-1"
    class="resource-timeline"
    :style="positionStyles"
  >
    <div class="timeline-fill" :style="{ background: resourceColour }"></div>
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
const resource = computed(() => {
  return store.resources.find((resource) => parseInt(resource.id, 10) === parseInt(props.resourceId, 10));
});

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

const resourceColour = computed(() => {
  return resource.value.colour;
});
</script>

<style scoped>
.resource-timeline {
  position: absolute;
  height: var(--row-height);
  transform: var(--transform);
  width: var(--width);
  padding: 10px;
}

.timeline-fill {
  background-color: v-bind(resourceColour);
  width: 100%;
  height: 100%;
  border-radius: 20px;
}
</style>
