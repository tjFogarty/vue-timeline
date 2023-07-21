<template>
  <div class="month">
    <span class="month-name">
      {{ month }}
    </span>
    <ul class="date-list">
      <li
        v-for="date in store.groupedDatesByMonth[month]"
        :key="date.valueOf()"
        class="date-item"
      >
        <span class="date-day-letter">{{ date.toFormat('ccccc') }}</span>
        <span
          class="date-day-number"
          :class="{ today: date.hasSame(DateTime.local(), 'day') }"
        >
          {{ date.toFormat('dd') }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { DateTime } from 'luxon';
import useTimelineStore from '../store';

defineProps({
  month: {
    type: String,
    required: true,
  },
});

const store = useTimelineStore();
</script>

<style scoped>
.month {
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
}
.month-name {
  position: sticky;
  inset-inline-start: var(--resource-width);
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
  width: var(--column-width);
}

.date-day-letter {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #575757;
  font-weight: 600;
}

.date-day-number {
  display: inline-block;
  padding: 5px;
  border-radius: 50%;
}

.today {
  background: #ff7500;
  color: white;
}
</style>
