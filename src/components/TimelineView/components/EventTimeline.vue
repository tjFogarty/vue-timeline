<template>
    <div ref="target" tabindex="-1" class="event" :draggable="isDragging ? 'true' : 'false'" :style="positionStyles" :class="{
        'is-dragging': isDragging,
    }" @mousedown.prevent="handleStartDrag">
        <div class="event-timeline-fill"></div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCurrentMousePosition } from '../composables/useMousePosition';
import useTimelineStore from '../store';
import { DATE_FORMAT } from '../constants';

const emit = defineEmits(['event-change']);

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const target = ref(null);
const isDragging = ref(false);
const { hoveredDate, isDraggingEvent } = useCurrentMousePosition();
const store = useTimelineStore();
const dragOffset = ref(0);
const draggingPos = computed(() => {
    if (!isDragging.value) return null;

    return {
        x: store.datePositions[hoveredDate.value.toFormat(DATE_FORMAT)],
    };
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

function handleStartDrag(e) {
    const colOffsetPos =
        parseInt(e.offsetX / store.columnWidth, 10) * store.columnWidth;
    dragOffset.value = colOffsetPos;
    isDragging.value = true;
    isDraggingEvent.value = props.data.id;

    // adding event listener here instead of on the element
    // because if you move the mouse off the event
    // and then let go, nothing happens as the event can't be triggered
    document.addEventListener('mouseup', handleStopDrag, { once: true });
}

function handleStopDrag() {
    const colOffsetPos = draggingPos.value.x - dragOffset.value;

    const date = Object.keys(store.datePositions).find(
        (key) => store.datePositions[key] === colOffsetPos,
    );

    store.updateEventDate(props.data.id, date);
    emit('event-change', store.events[props.data.id]);

    isDragging.value = false;
    isDraggingEvent.value = null;
}
</script>

<style scoped>
.event {
    position: absolute;
    padding: 12px;
    height: var(--row-height);
    transform: var(--transform);
    width: var(--width);
    content-visibility: auto;
    cursor: grab;
    contain-intrinsic-size: var(--width) var(--row-height);
}

.event.is-dragging {
    cursor: grabbing;
    transition: transform ease 0.1s;
}

.event-timeline-fill {
    width: 100%;
    height: 100%;
    background-color: #fe7104;
    border-radius: 20px;
}
</style>
