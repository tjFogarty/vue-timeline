<template>
  <div class="date-list-container">
    <SingleMonthHeader
      v-for="month in Object.keys(store.groupedDatesByMonth)"
      :month="month"
      :key="month"
    />
  </div>
</template>

<script setup>
import SingleMonthHeader from './SingleMonthHeader.vue';
import useTimelineStore from '../store';

const store = useTimelineStore();
</script>

<style scoped>
.date-list-container {
  display: flex;
  position: sticky;
  z-index: 1;
  top: 0;
  height: var(--header-height);
}
</style>
