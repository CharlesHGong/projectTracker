export type Log = {
  startTime: number;
  endTime: number;
};

export type Project = {
  name: string;
  logs: Log[];
};

export const rangeLabelMap = {
  day: "Today",
  week: "This Week",
  all: "All",
};
export type TimeRangeOption = keyof typeof rangeLabelMap;
