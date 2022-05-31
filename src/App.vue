<template>
<div>
  <TimelineView :resources="resources">
    <template #resource="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </TimelineView>
</div>
</template>

<script setup>
import TimelineView from './components/TimelineView/TimelineView.vue';

const resources = Array.from({ length: 10 }).map((_, i) => {
  return {
    id: i + 1,
    name: 'Resource ' + (i + 1),
  }
});
</script>
