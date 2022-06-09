<template>
  <div class="date-list-container">
    <ul class="date-list">
      <li v-for="date in dates" :key="date.valueOf()" class="date-item">
        <span class="date-day-letter">{{ date.toFormat('ccccc') }}</span>
        <span class="date-day-number">
          {{ date.toFormat('dd') }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCurrentTimeline } from '../composables/useTimeline';
const { dates, columnWidth, headerHeight } = useCurrentTimeline();

const columnWidthPx = computed(() => {
  return `${columnWidth}px`;
});
const headerHeightPx = computed(() => {
  return `${headerHeight}px`;
});
</script>

<style scoped>
.date-list {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  list-style: none;
  height: v-bind(headerHeightPx);
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.date-item {
  text-align: center;
  padding: 5px 0;
  width: v-bind(columnWidthPx);
}

.date-day-letter {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
}
</style>