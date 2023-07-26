# Vue Timeline

[Demo](https://timeline.tj.ie/)

An infinite scroll timeline component written in Vue.

Just something I'm hacking on in my spare time for a bit of fun, as it's difficult to find a component like this in the wild.

## Install/Setup

`npm install @teej/vue-timeline`

```
import { Timeline } from "@teej/vue-timeline";
import "@teej/vue-timeline/dist/style.css";

...

<Timeline :resources="projects" :events="tasks" />
```

## Props

| Name             | Type   | Default | Required |
|------------------|--------|---------|----------|
| resources        | Array  |         | Yes      |
| visibleResources | Number | 10      | No       |
| events           | Array  | []      | No       |
| columnWidth      | Number | 120     | No       |
| resourceWidth    | Number | 200     | No       |
| rowHeight        | Number | 50      | No       |
| headerHeight     | Number | 80      | No       |

### Resources

- id String/Number
- name String

### Events

Dates are provided as strings, e.g. in the format y-MM-dd (2023/06/01)

- id String/Number
- resourceId String/Number
- name String
- startDate String
- endDate String 