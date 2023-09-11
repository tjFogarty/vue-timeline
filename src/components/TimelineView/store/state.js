import { startOfLastMonth, endOfNextMonth } from './constants';

export default () => ({
  events: [],
  resources: [],
  columnWidth: 120,
  resourceWidth: 200,
  rowHeight: 50,
  headerHeight: 80,
  startDate: startOfLastMonth,
  endDate: endOfNextMonth,
  textDir: 'ltr',
  openResources: [],
  visibleStartDate: null,
  visibleEndDate: null,
});
