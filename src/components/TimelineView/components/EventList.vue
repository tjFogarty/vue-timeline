<template>
  <ul class="event-list">
    <li
      v-for="event in store.eventsGroupedByResource[resourceId]"
      :key="event.id"
      class="event-item"
    >
      {{ event.name }}
    </li>
  </ul>
</template>

<script setup>
import useTimelineStore from '../store';

const props = defineProps({
  resourceId: {
    type: Number,
    required: true,
  },
});

const store = useTimelineStore();
</script>

<style scoped>
.event-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.event-item {
  display: flex;
  align-items: center;
  position: relative;
  font-size: 13px;
  height: var(--row-height);
  padding: 6px;
}

.event-item:after {
  content: '';
  width: 100%;
  position: absolute;
  top: var(--row-height);
  height: 1px;
  width: var(--timeline-width);
  background-color: rgba(0, 0, 0, 0.05);
  pointer-events: none;
}
</style>
