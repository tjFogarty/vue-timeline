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
import { computed } from 'vue';
import { useTimelineStore } from '../store/useTimelineStore';

const props = defineProps({
  resourceId: {
    type: [Number, String],
    required: true,
  },
});

const timelineStore = useTimelineStore();
const resource = computed(() => {
  return timelineStore.resources.find((resource) => parseInt(resource.id, 10) === parseInt(props.resourceId, 10));
});

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

const resourceColour = computed(() => {
  return resource.value.colour;
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
  background-color: v-bind(resourceColour);
  width: 100%;
  height: 100%;
  border-radius: 20px;
}
</style>
