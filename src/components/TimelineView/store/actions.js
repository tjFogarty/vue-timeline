import { DateTime } from 'luxon';
import { startOfLastMonth, endOfNextMonth } from './constants';
import { DATE_FORMAT } from '../constants';

export default {
  setConfig({ columnWidth, resourceWidth, rowHeight, headerHeight, textDir }) {
    this.columnWidth = columnWidth;
    this.resourceWidth = resourceWidth;
    this.rowHeight = rowHeight;
    this.headerHeight = headerHeight;
    this.textDir = textDir;
  },

  addEvents(events) {
    this.events = [...this.events, ...events];
  },

  addEvent(event) {
    this.events.push(event);
  },

  updateEventDate(eventId, date) {
    const event = this.events.find((e) => e.id === eventId);
    const eventIndex = this.events.findIndex((e) => e.id === eventId);

    const oldStartDate = DateTime.fromFormat(event.startDate, DATE_FORMAT);
    const newStartDate = DateTime.fromFormat(date, DATE_FORMAT);
    const { days } = newStartDate.diff(oldStartDate, 'days').toObject();

    event.startDate = date;
    event.endDate = DateTime.fromFormat(event.endDate, DATE_FORMAT).plus({ days }).toFormat(DATE_FORMAT);
    
    this.events.splice(eventIndex, 1, event);
  },

  updateEventDuration(eventId, newStartDate, newEndDate) {
    const eventIndex = this.events.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      const event = { ...this.events[eventIndex] };
      event.startDate = newStartDate;
      event.endDate = newEndDate;
      this.events.splice(eventIndex, 1, event);
    }
  },

  addResources(resources) {
    this.resources = [...this.resources, ...resources];
  },

  addResource(resource) {
    this.resources.push(resource);
  },

  moveDatesForward() {
    this.startDate = this.startDate.plus({ month: 1 }).startOf('month');
    this.endDate = this.endDate.plus({ month: 1 }).endOf('month');
  },

  moveDatesBack() {
    this.startDate = this.startDate.minus({ month: 1 }).startOf('month');
    this.endDate = this.endDate.minus({ month: 1 }).endOf('month');
  },

  resetDates() {
    this.startDate = startOfLastMonth;
    this.endDate = endOfNextMonth;
  },

  toggleOpenResource(resourceId) {
    const index = this.openResources.indexOf(resourceId);

    if (index === -1) {
      this.openResources.push(resourceId);
    } else {
      this.openResources.splice(index, 1);
    }
  },
};
