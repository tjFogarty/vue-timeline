<template>
  <div class="date-list-container">
    <div
      v-for="month in Object.keys(groupedDatesByMonth)"
      :key="month"
      class="month"
    >
      <span class="month-name">
        {{ month }}
      </span>
      <ul class="date-list">
        <li
          v-for="date in groupedDatesByMonth[month]"
          :key="date.valueOf()"
          class="date-item"
        >
          <span class="date-day-letter">{{ date.toFormat('ccccc') }}</span>
          <span class="date-day-number">
            {{ date.toFormat('dd') }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCurrentTimeline } from '../composables/useTimeline';
const { columnWidth, headerHeight, groupedDatesByMonth } = useCurrentTimeline();

const columnWidthPx = computed(() => {
  return `${columnWidth}px`;
});
const headerHeightPx = computed(() => {
  return `${headerHeight}px`;
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
.month {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
}
.month-name {
  position: sticky;
  display: inline-block;
  padding: 4px;
  left: 50%;
  font-weight: 600;
}
.date-list {
  display: flex;
  list-style: none;
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
