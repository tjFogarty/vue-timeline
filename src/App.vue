<template>
  <div>
    <TimelineView :resources="resources" :events="events">
      <template #resource="{ item }">
        <div>ID {{ item.id }}: {{ item.name }}</div>
      </template>

      <template #event="{ item }">
        <div class="custom-event" :class="item.type">
          {{ item.type }}: {{ item.name }}
        </div>
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
  { id: 1, name: 'Meeting', type: 'event', startDate: '2022-05-05', endDate: '2022-05-08', resourceId: 5 },
  { id: 4, name: 'Design Spec', type: 'task', startDate: '2022-05-03', endDate: '2022-05-05', resourceId: 2 },
];
</script>

<style scoped>
.custom-event {
  width: 100%;
  height: 100%;
  padding: 10px;
  border-radius: 5px;
}

.custom-event.task {
  background-color: burlywood;
  color: white;
}

.custom-event.event {
  background-color: gray;
  color: white;
}
</style>
