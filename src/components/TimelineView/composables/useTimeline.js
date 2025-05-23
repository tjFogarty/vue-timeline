import { useEventListener } from '@vueuse/core';
import { provide, shallowRef, inject } from 'vue';
import useTimelineStore from '../store';

function useTimeline() {
  const timelineStore = useTimelineStore();
  const container = shallowRef(null);
  const scrollLeft = shallowRef(0);
  const isMovingForwards = shallowRef(false);
  const isMovingBackwards = shallowRef(false);
  const isRTL = timelineStore.isRTL;

  /**
    * @param {Event} event
  */
  function handleScroll(event) {
    const eventTarget = event.target;
    const scrollLeftVal = isRTL
      ? -eventTarget.scrollLeft
      : eventTarget.scrollLeft;
    const triggerArea = timelineStore.timelineWidth * 0.1;
    isMovingForwards.value = scrollLeftVal > scrollLeft.value;
    isMovingBackwards.value = scrollLeftVal < scrollLeft.value;
    scrollLeft.value = scrollLeftVal;

    // need to swap months in and out while preserving the scroll position
    if (isMovingForwards.value) {
      if (
        scrollLeftVal + eventTarget.offsetWidth >=
        timelineStore.timelineWidth - triggerArea
      ) {
        const previousStartMonthDayCount =
          timelineStore.startDate.endOf('month').c.day;

        timelineStore.moveDatesForward();

        const newScrollPosition =
          scrollLeft.value -
          previousStartMonthDayCount * timelineStore.columnWidth;

        if (container.value) {
          container.value.scrollLeft = isRTL
            ? -newScrollPosition
            : newScrollPosition;
        }
      }
    } else if (isMovingBackwards.value) {
      if (scrollLeftVal < triggerArea) {
        const previousEndMonthDayCount =
          timelineStore.endDate.endOf('month').c.day;

        timelineStore.moveDatesBack();

        const diff =
          previousEndMonthDayCount -
          timelineStore.startDate.endOf('month').c.day;
        const newScrollPosition =
          scrollLeft.value +
          (previousEndMonthDayCount - diff) * timelineStore.columnWidth;

        if (container.value) {
          container.value.scrollLeft = isRTL
            ? -newScrollPosition
            : newScrollPosition;
        }
      }
    }

    const startIndex = Math.floor(scrollLeft.value / timelineStore.columnWidth);
    const endIndex = Math.floor((container.value.offsetWidth - timelineStore.resourceWidth) / timelineStore.columnWidth);
    timelineStore.visibleStartDate = timelineStore.dates[startIndex];
    timelineStore.visibleEndDate = timelineStore.dates[startIndex + endIndex];
  }

  function goToToday() {
    timelineStore.resetDates();

    if (container.value) {
      const position = timelineStore.todayPosition * timelineStore.columnWidth;
      container.value.scrollTo({
        top: 0,
        left: isRTL ? -position : position,
      });
    }
  }

  // this will make the `dragend` listener fire immediately
  function handleDragOver(e) {
    e.preventDefault();
  }

  useEventListener(container, 'scroll', handleScroll, { passive: true });
  useEventListener(container, 'dragover', handleDragOver);

  function scrollToPosition(x, smooth = false) {
    if (container.value) {
      const scrollOptions = {
        left: isRTL ? -x : x,
        behavior: smooth ? 'smooth' : 'auto'
      };
      container.value.scrollTo(scrollOptions);
    }
  }

  function ensurePositionVisible(x, margin = 100) {
    if (!container.value) return;
    
    const containerRect = container.value.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const currentScroll = isRTL ? -container.value.scrollLeft : container.value.scrollLeft;
    const resourceWidth = timelineStore.resourceWidth;
    const visibleStart = currentScroll + resourceWidth;
    const visibleEnd = currentScroll + containerWidth;
    
    // Check if position is outside visible area
    if (x < visibleStart + margin) {
      // Scroll left to show position
      const newScroll = Math.max(0, x - resourceWidth - margin);
      scrollToPosition(newScroll, true);
    } else if (x > visibleEnd - margin) {
      // Scroll right to show position
      const newScroll = x - containerWidth + margin;
      scrollToPosition(newScroll, true);
    }
  }

  return {
    container,
    goToToday,
    scrollLeft,
    scrollToPosition,
    ensurePositionVisible,
  };
}

let currentTimeline = null;
const symbol = Symbol('useTimeline');

export function provideTimeline() {
  currentTimeline = useTimeline();
  provide(symbol, currentTimeline);
  return currentTimeline;
}

export function useCurrentTimeline() {
  return inject(symbol);
}
