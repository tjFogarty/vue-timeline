import { ref, computed, onMounted, onUnmounted, inject, provide } from 'vue';
import { useThrottleFn } from '@vueuse/core';

function useMousePosition({
  container,
  resourceHeight,
  headerHeight,
  resourceWidth,
  columnWidth,
  resources,
  dates,
}) {
  const hoveredResourceId = ref(null);
  const hoveredDate = ref(null);

  function handleMouseMove(e) {
    const rect = container?.value.getBoundingClientRect();
    const x = e.pageX + container.value.scrollLeft - rect.left;
    const y = e.pageY + container.value.scrollTop - rect.top - headerHeight;
    const topPos = y - (y % resourceHeight);
    const resourceIndex = topPos / resourceHeight;
    const dateIndex = Math.floor((x - resourceWidth) / columnWidth);

    hoveredResourceId.value = resources[resourceIndex]?.id;
    hoveredDate.value = dates.value[dateIndex];
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
