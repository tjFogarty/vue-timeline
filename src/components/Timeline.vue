<template>
  <TimelineView
    v-bind="$attrs"
    @event-change="$emit('event-change', $event)"
    @date-change="$emit('date-change', $event)"
    @visible-date-change="$emit('visible-date-change', $event)"
  />
</template>

<script setup>
import { createPinia } from 'pinia';
import { getCurrentInstance } from 'vue';
import TimelineView from './TimelineView/TimelineView.vue';

// Props forwarding
defineOptions({
  inheritAttrs: false
});

// Events forwarding
defineEmits(['event-change', 'date-change', 'visible-date-change']);

// Ensure Pinia is available for this component
const instance = getCurrentInstance();
if (instance && !instance.appContext.app._context.provides.pinia) {
  const pinia = createPinia();
  instance.appContext.app.use(pinia);
}
</script>