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
import { useCurrentTimeline } from '../composables/useTimeline';
const { dates, columnWidth } = useCurrentTimeline();
</script>

<style scoped>
.date-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.date-item {
  text-align: center;
  width: v-bind(`${columnWidth}px`);
}

.date-day-letter {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
}
</style>