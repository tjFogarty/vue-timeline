<template>
  <li class="resource-item">
    <button
      type="button"
      class="resource"
      :class="{ 'is-open': isOpen }"
      @click="toggleEvents"
    >
      {{ resource.name }}

      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        class="chevron"
      >
        <path
          d="M9 6L15 12L9 18"
          stroke="#000000"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <EventList v-if="isOpen" :resourceId="resource.id" />
  </li>
</template>

<script setup>
import { computed } from 'vue';
import useTimelineStore from '../store';
import EventList from './EventList.vue';

const props = defineProps({
  resource: {
    type: Object,
    required: true,
  },
});

const store = useTimelineStore();

const isOpen = computed(() => {
  return store.openResources.includes(props.resource.id);
});

const elementHeight = computed(() => {
  if (!isOpen.value) {
    return `${store.rowHeight}px`;
  }

  let height =
    store.rowHeight +
    store.eventsGroupedByResource[props.resource.id].length * store.rowHeight;

  return `${height}px`;
});

function toggleEvents() {
  store.toggleOpenResource(props.resource.id);
}
</script>

<style scoped>
.resource-item {
  position: relative;
  inset-inline-start: 0;
  height: var(--resource-height);
  content-visibility: auto;
  contain-intrinsic-size: var(--resource-width) v-bind(elementHeight);
}

.resource-item:after {
  content: '';
  width: 100%;
  position: absolute;
  top: var(--row-height);
  height: 1px;
  width: var(--timeline-width);
  background-color: rgba(0, 0, 0, 0.05);
  pointer-events: none;
}

.resource {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  border-bottom: 1px solid #ccc;
  height: 100%;
  cursor: pointer;
  width: 100%;
  height: var(--row-height);
  background-color: transparent;
  border: none;
}

.resource:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.chevron {
  width: 20px;
  height: 20px;
}

.is-open .chevron {
  transform: rotate(90deg);
}
</style>
