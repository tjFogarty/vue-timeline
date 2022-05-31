<template>
  <div>
    <TimelineView :resources="resources" :events="events">
      <template #resource="{ item }">
        <div>ID {{ item.id }}: {{ item.name }}</div>
      </template>
    </TimelineView>
  </div>
</template>

<script setup>
/**
 * The concept of this timeline component is to have everything positioned
 * based on the provided dimensions.
 * 
 * It's possible, then, to place anything anywhere on the grid. 
 */
import TimelineView from './components/TimelineView/TimelineView.vue';

const resources = Array.from({ length: 10 }).map((_, i) => {
  return {
    id: i + 1,
    name: 'Resource ' + (i + 1),
  }
});

const events = [
  { id: 1, name: 'Meeting', type: 'task', startDate: '2022-04-05', endDate: '2022-04-08', resourceId: 1 }
];
</script>
