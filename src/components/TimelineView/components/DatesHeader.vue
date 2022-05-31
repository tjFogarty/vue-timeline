<template>
  <div>
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
  display: flex;
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