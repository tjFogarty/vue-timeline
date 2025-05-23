<template>
  <div
    ref="target"
    role="button"
    tabindex="0"
    class="event"
    :aria-label="`Event: ${data.name}, from ${data.startDate} to ${data.endDate}. Press Enter to edit, arrow keys to move.`"
    :aria-describedby="`event-${data.id}-description`"
    :style="positionStyles"
    :class="{
      'is-dragging': isDragging,
      'is-resizing': isResizing,
      'is-focused': isFocused,
    }"
    @mousedown="handleMainMouseDown"
    @keydown="handleKeyDown"
    @focus="isFocused = true"
    @blur="isFocused = false"
  >
    <div class="event-timeline-fill">
      <span class="event-name">{{ data.name }}</span>
    </div>
    <div
      class="resize-handle resize-handle-left"
      role="button"
      tabindex="-1"
      :aria-label="`Resize ${data.name} start date`"
      @mousedown.stop="handleResizeStart('left', $event)"
    ></div>
    <div
      class="resize-handle resize-handle-right"
      role="button"
      tabindex="-1"
      :aria-label="`Resize ${data.name} end date`"
      @mousedown.stop="handleResizeStart('right', $event)"
    ></div>
    <div :id="`event-${data.id}-description`" class="sr-only">
      Draggable event from {{ data.startDate }} to {{ data.endDate }}. Use mouse
      or keyboard to move or resize.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { DateTime } from 'luxon';
import { useCurrentMousePosition } from '../composables/useMousePosition';
import { useCurrentTimeline } from '../composables/useTimeline';
import useTimelineStore from '../store';
import { DATE_FORMAT } from '../constants';

const emit = defineEmits(['event-change']);

const props = defineProps({ data: { type: Object, required: true } });

const target = ref(null);
const isDragging = ref(false);
const isResizing = ref(false);
const isFocused = ref(false);
const resizeDirection = ref(null);
const initialMousePosition = ref({ x: 0, y: 0 });
const initialEventData = ref(null);
const { hoveredDate, isDraggingEvent } = useCurrentMousePosition();
const { ensurePositionVisible } = useCurrentTimeline();
const store = useTimelineStore();
const dragOffset = ref(0);
const draggingPos = computed(() => {
  if (!isDragging.value) return null;

  return { x: store.datePositions[hoveredDate.value.toFormat(DATE_FORMAT)] };
});
const position = computed(() => {
  if (!store.eventPositions[props.data.id]) return '';

  const pos = store.eventPositions[props.data.id];
  const x = draggingPos.value
    ? draggingPos.value.x - dragOffset.value
    : pos.left;
  const y = pos.top;

  return { x, y, w: pos.width };
});
const positionStyles = computed(() => {
  if (!position.value) return '';

  const { w, x, y } = position.value;
  return `--transform: translate(${x}px, ${y}px); --width: ${w}px`;
});

const handleResizeStart = (direction, event) => {
  event.preventDefault();
  event.stopPropagation();

  isResizing.value = true;
  resizeDirection.value = direction;
  initialMousePosition.value = { x: event.clientX, y: event.clientY };
  initialEventData.value = {
    startDate: props.data.startDate,
    endDate: props.data.endDate,
  };

  document.addEventListener('mousemove', handleResizeMove);
  document.addEventListener('mouseup', handleResizeEnd);

  // Prevent any other mouse events during resize
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'ew-resize';
};

const handleResizeMove = (event) => {
  if (!isResizing.value) return;

  const deltaX = event.clientX - initialMousePosition.value.x;
  const deltaColumns = Math.round(deltaX / store.columnWidth);

  const startDate = DateTime.fromFormat(
    initialEventData.value.startDate,
    DATE_FORMAT,
  );
  const endDate = DateTime.fromFormat(
    initialEventData.value.endDate,
    DATE_FORMAT,
  );

  let newStartDate = startDate;
  let newEndDate = endDate;
  let targetPosition = null;

  if (resizeDirection.value === 'left') {
    newStartDate = startDate.plus({ days: deltaColumns });
    // Ensure start date doesn't go past end date
    if (newStartDate >= endDate) {
      newStartDate = endDate.minus({ days: 1 });
    }
    // Track the left edge position for auto-scroll
    targetPosition = store.datePositions[newStartDate.toFormat(DATE_FORMAT)];
  } else if (resizeDirection.value === 'right') {
    newEndDate = endDate.plus({ days: deltaColumns });
    // Ensure end date doesn't go before start date
    if (newEndDate <= startDate) {
      newEndDate = startDate.plus({ days: 1 });
    }
    // Track the right edge position for auto-scroll
    targetPosition = store.datePositions[newEndDate.toFormat(DATE_FORMAT)];
  }

  store.updateEventDuration(
    props.data.id,
    newStartDate.toFormat(DATE_FORMAT),
    newEndDate.toFormat(DATE_FORMAT),
  );

  // Auto-scroll to keep the resize handle visible
  if (targetPosition !== null) {
    ensurePositionVisible(targetPosition);
  }
};

const handleResizeEnd = () => {
  if (isResizing.value) {
    emit(
      'event-change',
      store.events.find((e) => e.id === props.data.id),
    );
  }

  isResizing.value = false;
  resizeDirection.value = null;
  initialEventData.value = null;

  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);

  // Restore normal cursor and selection
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
};

function handleMainMouseDown(event) {
  // Don't start drag if clicking on resize handles
  if (
    event.target.classList.contains('resize-handle') ||
    event.target.closest('.resize-handle')
  ) {
    return;
  }
  handleStartDrag(event);
}

function handleStartDrag(event) {
  if (isResizing.value) return;
  event.preventDefault();
  const colOffsetPos =
    parseInt(event.offsetX / store.columnWidth, 10) * store.columnWidth;
  dragOffset.value = colOffsetPos;
  isDragging.value = true;
  isDraggingEvent.value = props.data.id;

  // adding event listener here instead of on the element
  // because if you move the mouse off the event
  // and then let go, nothing happens as the event can't be triggered
  document.addEventListener('mouseup', handleStopDrag, { once: true });
  document.addEventListener('mousemove', handleDragMove);
}

function handleDragMove() {
  if (!isDragging.value || !draggingPos.value) return;

  // Auto-scroll to keep the dragged event visible
  const eventPosition = draggingPos.value.x - dragOffset.value;
  ensurePositionVisible(eventPosition);
}

function handleStopDrag() {
  const colOffsetPos = draggingPos.value.x - dragOffset.value;

  const date = Object.keys(store.datePositions).find(
    (key) => store.datePositions[key] === colOffsetPos,
  );

  store.updateEventDate(props.data.id, date);
  emit(
    'event-change',
    store.events.find((e) => e.id === props.data.id),
  );

  isDragging.value = false;
  isDraggingEvent.value = null;

  document.removeEventListener('mousemove', handleDragMove);
}

function handleKeyDown(event) {
  const currentEvent = store.events.find((e) => e.id === props.data.id);
  if (!currentEvent) return;

  const startDate = DateTime.fromFormat(currentEvent.startDate, DATE_FORMAT);
  const endDate = DateTime.fromFormat(currentEvent.endDate, DATE_FORMAT);

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      if (event.shiftKey) {
        // Resize: shrink duration from end
        const newEndDate = endDate.minus({ days: 1 });
        if (newEndDate > startDate) {
          store.updateEventDuration(
            props.data.id,
            currentEvent.startDate,
            newEndDate.toFormat(DATE_FORMAT),
          );
          emit(
            'event-change',
            store.events.find((e) => e.id === props.data.id),
          );
          // Auto-scroll to keep start visible
          const startPos = store.datePositions[currentEvent.startDate];
          if (startPos !== undefined) ensurePositionVisible(startPos);
        }
      } else {
        // Move: shift entire event left
        const newStartDate = startDate.minus({ days: 1 });
        const newStartDateStr = newStartDate.toFormat(DATE_FORMAT);
        store.updateEventDate(props.data.id, newStartDateStr);
        emit(
          'event-change',
          store.events.find((e) => e.id === props.data.id),
        );
        // Auto-scroll to keep event visible
        const newStartPos = store.datePositions[newStartDateStr];
        if (newStartPos !== undefined) ensurePositionVisible(newStartPos);
      }
      break;

    case 'ArrowRight':
      event.preventDefault();
      if (event.shiftKey) {
        // Resize: extend duration to end
        const newEndDate = endDate.plus({ days: 1 });
        const newEndDateStr = newEndDate.toFormat(DATE_FORMAT);
        store.updateEventDuration(
          props.data.id,
          currentEvent.startDate,
          newEndDateStr,
        );
        emit(
          'event-change',
          store.events.find((e) => e.id === props.data.id),
        );
        // Auto-scroll to keep end visible
        const endPos = store.datePositions[newEndDateStr];
        if (endPos !== undefined) ensurePositionVisible(endPos);
      } else {
        // Move: shift entire event right
        const newStartDate = startDate.plus({ days: 1 });
        const newStartDateStr = newStartDate.toFormat(DATE_FORMAT);
        store.updateEventDate(props.data.id, newStartDateStr);
        emit(
          'event-change',
          store.events.find((e) => e.id === props.data.id),
        );
        // Auto-scroll to keep event visible
        const newStartPos = store.datePositions[newStartDateStr];
        if (newStartPos !== undefined) ensurePositionVisible(newStartPos);
      }
      break;

    case 'Enter':
    case ' ':
      event.preventDefault();
      // Could emit an edit event here for external handling
      emit('event-change', currentEvent);
      break;
  }
}
</script>

<style scoped>
.event {
  position: absolute;
  padding: 6px;
  height: var(--row-height);
  transform: var(--transform);
  width: var(--width);
  content-visibility: auto;
  cursor: grab;
  contain-intrinsic-size: var(--width) var(--row-height);
  border: 1px solid transparent;
  border-radius: 4px;
}

.event:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.event.is-focused {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.event:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 0, 0, 0.1);
}

.event.is-dragging {
  cursor: grabbing;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
}

.event.is-resizing {
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.event-timeline-fill {
  width: 100%;
  height: 100%;
  background: #020024;
  background: linear-gradient(90deg, #4b6cb7 0%, #182848 100%);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}

.event-name {
  position: absolute;
  top: 50%;
  left: 10px;
  right: 10px;
  transform: translateY(-50%);
  color: white;
  font-weight: 500;
  font-size: 12px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.01em;
}

.resize-handle {
  position: absolute;
  width: 6px;
  height: calc(100% - 2px);
  top: 1px;
  cursor: ew-resize;
  background: rgba(255, 255, 255, 0.3);
  opacity: 0;
  transition: all 0.15s ease;
  z-index: 5;
  pointer-events: auto;
  border-radius: 2px;
}

.event:hover .resize-handle,
.event.is-focused .resize-handle {
  opacity: 1;
}

.resize-handle:hover {
  background: rgba(255, 255, 255, 0.5);
  width: 8px;
}

.resize-handle-left {
  left: 1px;
}

.resize-handle-right {
  right: 1px;
}

.resize-handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .event {
    transition: none;
  }

  .resize-handle {
    transition: none;
  }
}
</style>
