<template>
  <div class="date-list-container">
    <SingleMonthHeader
      v-for="month in Object.keys(timelineStore.groupedDatesByMonth)"
      :month="month"
      :key="month"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SingleMonthHeader from './SingleMonthHeader.vue';
import { useTimelineStore } from '../store/useTimelineStore';

const timelineStore = useTimelineStore();

const headerHeightPx = computed(() => {
  return `${timelineStore.headerHeight}px`;
});
</script>

<style scoped>
.date-list-container {
  display: flex;
  position: sticky;
  z-index: 1;
  top: 0;
  height: v-bind(headerHeightPx);
}
</style>
