<template>
  <div v-for="event in events" :key="event.id" class="event" :style="getEventPositionStyles(event)">
    <slot name="event" v-bind="{ item: event }">{{ event.name }}</slot>
  </div>
</template>

<script setup>
import { useCurrentTimeline } from '../composables/useTimeline';

const { events, eventPositions } = useCurrentTimeline();

function getEventPositionStyles(event) {
  const position = eventPositions.value[event.id];
  return `top: ${position.top}px; left: ${position.left}px; width: ${position.width}px`;
}
</script>

<style scoped>
.event {
  position: absolute;
}
</style>