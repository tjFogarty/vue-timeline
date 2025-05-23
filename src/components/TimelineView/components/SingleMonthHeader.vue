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
          :title="date.toFormat('EEEE, MMMM dd, yyyy')"
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

defineProps({ month: { type: String, required: true } });

const store = useTimelineStore();
</script>

<style scoped>
.month {
  background: #ffffff;
  border-inline-end: 1px solid #f3f4f6;
}

.month-name {
  position: sticky;
  inset-inline-start: var(--resource-width);
  display: inline-block;
  padding: 2px 16px;
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
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
  padding: 12px 0 8px 0;
  width: var(--column-width);
  position: relative;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.date-item:hover {
  background: #f9fafb;
}

.date-day-letter {
  display: block;
  margin-bottom: 6px;
  font-size: 10px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-day-number {
  display: inline-block;
  padding: 6px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 13px;
  color: #374151;
  min-width: 28px;
  transition: all 0.15s ease;
  background: transparent;
}

.date-item:hover .date-day-number {
  background: #e5e7eb;
  color: #1f2937;
}

.today {
  background: #000851 !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.25);
}
</style>
