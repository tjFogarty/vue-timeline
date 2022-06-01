<template>
  <div v-for="event in events" :key="event.id" class="event" :style="getEventPositionStyles(event)" draggable="true">
    <slot name="event" v-bind="{ item: event }">{{ event.name }}</slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCurrentTimeline } from '../composables/useTimeline';

const { events, eventPositions, resourceHeight } = useCurrentTimeline();

const resourceHeightPx = computed(() => {
  return `${resourceHeight}px`;
});

function getEventPositionStyles(event) {
  const position = eventPositions.value[event.id];
  return `--transform: translate(${position.left}px, ${position.top}px); --width: ${position.width}px`;
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