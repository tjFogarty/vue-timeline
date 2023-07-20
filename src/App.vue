<template>
  <div class="timeline-preview">
    <ProjectTimeline />

    <div class="gh-link">
      <a href="https://github.com/tjFogarty/vue-timeline" target="_blank"
        >View on GitHub</a
      >
    </div>
  </div>
</template>

<script setup>
import ProjectTimeline from './components/ProjectTimeline.vue';
</script>

<style scoped>
.timeline-preview {
  font-family: sans-serif;
}

.gh-link {
  font-family: sans-serif;
  text-align: center;
  margin: 1rem 0;
}
</style>
