<template>
  <div class="month">
      <span class="month-name">
        {{ month }}
      </span>
      <ul class="date-list">
        <li
          v-for="date in timelineStore.groupedDatesByMonth[month]"
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
</template>

<script setup>
import { computed } from 'vue';
import { useTimelineStore } from '../store/useTimelineStore';

const props = defineProps({
  month: {
    type: String,
    required: true,
  },
});

const timelineStore = useTimelineStore();

const columnWidthPx = computed(() => {
  return `${timelineStore.columnWidth}px`;
});

const resourceWidthPx = computed(() => {
  return `${timelineStore.resourceWidth}px`;
});
</script>

<style scoped>
.month {
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
}
.month-name {
  position: sticky;
  inset-inline-start: v-bind(resourceWidthPx);
  display: inline-block;
  padding: 4px;
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
  font-size: 12px;
  color: #575757;
  font-weight: 600;
}
</style>