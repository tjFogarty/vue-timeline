<template>
  <div>
    <TimelineView :resources="resources" :events="events" @create-event="handleCreateEvent" @date-change="handleDateChange">
      <template #resource="{ item }">
        <div class="custom-resource">ID {{ item.id }}: {{ item.name }}</div>
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
import { DateTime } from 'luxon';
import { ref } from 'vue';
import TimelineView from './components/TimelineView/TimelineView.vue';

const today = new Date();

const resources = Array.from({ length: 30 }).map((_, i) => {
  return {
    id: i + 1,
    name: 'Resource ' + (i + 1),
  }
});

const events = ref([
  { id: 1, name: 'Meeting', type: 'event', startDate: new DateTime(today).plus({ days: 1 }).toFormat('y-MM-dd'), endDate: new DateTime(today).plus({ days: 2 }).toFormat('y-MM-dd'), resourceId: 5 },
  { id: 2, name: 'Design Spec', type: 'task', startDate: new DateTime(today).toFormat('y-MM-dd'), endDate: new DateTime(today).plus({ days: 5 }).toFormat('y-MM-dd'), resourceId: 2 },
  { id: 3, name: 'Something else', type: 'task', startDate: new DateTime(today).plus({ days: 2 }).toFormat('y-MM-dd'), endDate: new DateTime(today).plus({ days: 4 }).toFormat('y-MM-dd'), resourceId: 6 },
]);

function handleCreateEvent(newEvent) {
  events.value.push({
    id: events.value.length + 1,
    name: 'New Event',
    type: 'event',
    startDate: newEvent.startDate.toFormat('y-MM-dd'),
    endDate: newEvent.endDate.toFormat('y-MM-dd'),
    resourceId: newEvent.resourceId,
  });
}

function handleDateChange({ startDate, endDate }) {
  console.log({ startDate, endDate })
}
</script>

<style scoped>
.custom-event {
  display: flex;
  align-items: center;
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

.custom-resource {
  display: flex;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid #ccc;
  height: 100%;
}
</style>
