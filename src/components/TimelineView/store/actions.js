import { startOfLastMonth, endOfNextMonth } from './constants';

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
