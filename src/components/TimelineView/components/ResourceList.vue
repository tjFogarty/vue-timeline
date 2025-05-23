<template>
  <div class="resources" role="rowgroup">
    <div class="resource-header" role="columnheader" aria-label="Project resources">Projects</div>
    <ul class="resource-list" role="list" aria-label="List of project resources">
      <ResourceItem
        v-for="resource in store.resources"
        :resource="resource"
        :key="resource.id"
      />
    </ul>
  </div>
</template>

<script setup>
import ResourceItem from './ResourceItem.vue';
import useTimelineStore from '../store';

const store = useTimelineStore();
</script>

<style scoped>
.resources {
  position: sticky;
  inset-inline-start: 0;
  top: 0;
  z-index: 2;
  width: var(--resource-width);
  background: #ffffff;
  border-inline-end: 1px solid #e5e7eb;
}

.resource-header {
  position: sticky;
  display: flex;
  align-items: center;
  background: #f9fafb;
  color: #1f2937;
  width: 100%;
  top: 0;
  z-index: 1;
  padding: 16px;
  height: var(--header-height);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.resource-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #ffffff;
}
</style>
