import { ref, computed, onMounted, onUnmounted, inject, provide } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import { useTimelineStore } from '../store/useTimelineStore';

function useMousePosition({ container }) {
  const timelineStore = useTimelineStore();
  const hoveredResourceId = ref(null);
  const hoveredDate = ref(null);

  function handleMouseMove(e) {
    const rect = container?.value.getBoundingClientRect();
    const x = e.pageX + container.value.scrollLeft - rect.left;
    const y =
      e.pageY +
      container.value.scrollTop -
      rect.top -
      timelineStore.headerHeight;
    const topPos = y - (y % timelineStore.resourceHeight);
    const resourceIndex = topPos / timelineStore.resourceHeight;
    const dateIndex = Math.floor(
      (x - timelineStore.resourceWidth) / timelineStore.columnWidth,
    );

    hoveredResourceId.value = timelineStore.resources[resourceIndex]?.id;
    hoveredDate.value = timelineStore.dates[dateIndex];
  }

  const throttledHandleMouseMove = useThrottleFn(handleMouseMove, 100);

  onMounted(() => {
    container.value.addEventListener('mousemove', throttledHandleMouseMove, {
      passive: true,
    });
  });

  onUnmounted(() => {
    container.value.removeEventListener('mousemove', throttledHandleMouseMove);
  });

  return {
    hoveredDate: computed(() => hoveredDate.value),
    hoveredResourceId: computed(() => hoveredResourceId.value),
  };
}

let currentMousePosition;
const symbol = Symbol('useMousePosition');

export function provideMousePosition(opts) {
  currentMousePosition = useMousePosition(opts);
  provide(symbol, currentMousePosition);
  return currentMousePosition;
}

export function useCurrentMousePosition() {
  return inject(symbol);
}
