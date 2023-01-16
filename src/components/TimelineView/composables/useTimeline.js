import {
  onMounted,
  onUnmounted,
  nextTick,
  provide,
  shallowRef,
  inject,
} from 'vue';
import { useThrottleFn } from '@vueuse/core';
import { useTimelineStore } from '../store/useTimelineStore';

function useTimeline() {
  const timelineStore = useTimelineStore();
  const container = shallowRef(null);
  const scrollLeft = shallowRef(0);
  const isMovingForwards = shallowRef(false);
  const isMovingBackwards = shallowRef(false);

  function handleScroll(event) {
    const scrollLeftVal = event.target.scrollLeft;
    const triggerArea = timelineStore.timelineWidth * 0.1;
    isMovingForwards.value = scrollLeftVal > scrollLeft.value;
    isMovingBackwards.value = scrollLeftVal < scrollLeft.value;
    scrollLeft.value = scrollLeftVal;

    // need to swap months in and out while preserving the scroll position
    if (isMovingForwards.value) {
      if (
        scrollLeftVal + event.target.offsetWidth >=
        timelineStore.timelineWidth - triggerArea
      ) {
        const previousStartMonthDayCount =
          timelineStore.startDate.endOf('month').c.day;

        timelineStore.nextStartDate();
        timelineStore.nextEndDate();

        const newScrollPosition =
          scrollLeft.value -
          previousStartMonthDayCount * timelineStore.columnWidth;

        nextTick(() => {
          container.value.scrollLeft = newScrollPosition;
        });
      }
    } else if (isMovingBackwards.value) {
      if (scrollLeftVal < triggerArea) {
        const previousEndMonthDayCount =
          timelineStore.endDate.endOf('month').c.day;

        timelineStore.prevStartDate();
        timelineStore.prevEndDate();

        const diff =
          previousEndMonthDayCount -
          timelineStore.startDate.endOf('month').c.day;
        const newScrollPosition =
          scrollLeft.value +
          (previousEndMonthDayCount - diff) * timelineStore.columnWidth;

        nextTick(() => {
          container.value.scrollLeft = newScrollPosition;
        });
      }
    }
  }

  function goToToday(useSmoothScroll = true) {
    timelineStore.resetDates();

    container.value.scrollTo({
      top: 0,
      left: timelineStore.todayPosition * timelineStore.columnWidth,
      behavior: useSmoothScroll ? 'smooth' : 'instant',
    });
  }

  const throttledHandleScroll = useThrottleFn(handleScroll, 100);

  // this will make the `dragend` listener fire immediately
  function handleDragOver(e) {
    e.preventDefault();
  }

  onMounted(() => {
    container.value.addEventListener('scroll', throttledHandleScroll, {
      passive: true,
    });
    container.value.addEventListener('dragover', handleDragOver);
    goToToday(false);
  });

  onUnmounted(() => {
    container.value.removeEventListener('scroll', throttledHandleScroll);
    container.value.removeEventListener('dragover', handleDragOver);
  });

  return {
    container,
    goToToday,
  };
}

let currentTimeline = null;
const symbol = Symbol('useTimeline');

export function provideTimeline(opts) {
  currentTimeline = useTimeline(opts);
  provide(symbol, currentTimeline);
  return currentTimeline;
}

export function useCurrentTimeline() {
  return inject(symbol);
}
