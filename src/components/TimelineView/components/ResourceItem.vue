<template>
  <li class="resource-item" role="listitem">
    <button
      type="button"
      class="resource"
      :class="{ 'is-open': isOpen }"
      :aria-expanded="isOpen"
      :aria-controls="`event-list-${resource.id}`"
      :aria-label="`${resource.name} - ${isOpen ? 'Collapse' : 'Expand'} to ${isOpen ? 'hide' : 'show'} events`"
      @click="toggleEvents"
      @keydown="handleKeyDown"
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

    <EventList 
      v-if="isOpen" 
      :resourceId="resource.id"
      :id="`event-list-${resource.id}`"
      role="region"
      :aria-label="`Events for ${resource.name}`"
    />
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

function handleKeyDown(event) {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      toggleEvents();
      break;
  }
}
</script>

<style scoped>
.resource-item {
  position: relative;
  inset-inline-start: 0;
  height: var(--resource-height);
  content-visibility: auto;
  contain-intrinsic-size: var(--resource-width) v-bind(elementHeight);
  border-bottom: 1px solid #f1f5f9;
}

.resource-item:after {
  content: '';
  width: 100%;
  position: absolute;
  top: var(--row-height);
  height: 1px;
  width: var(--timeline-width);
  background: #f3f4f6;
  pointer-events: none;
}

.resource {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  height: var(--row-height);
  cursor: pointer;
  width: 100%;
  background: transparent;
  border: none;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
  transition: all 0.15s ease;
  position: relative;
}

.resource::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #3b82f6;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.resource:hover,
.resource:focus {
  background: #f8fafc;
  color: #1f2937;
  outline: none;
}

.resource:hover::before,
.resource:focus::before {
  opacity: 1;
}

.resource.is-open {
  background: #f1f5f9;
  color: #1f2937;
  font-weight: 600;
}

.resource.is-open::before {
  opacity: 1;
}

.chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.15s ease;
  opacity: 0.5;
}

.resource:hover .chevron {
  opacity: 0.8;
}

.is-open .chevron {
  transform: rotate(90deg);
  opacity: 0.8;
}

.chevron path {
  stroke: currentColor;
  stroke-width: 2.5;
}
</style>
