export type Log = {
  startTime: number;
  endTime: number;
};

export type Project = {
  name: string;
  code: string;
  logs: Log[];
};

export type MinimizeVariant = "minimize" | "compact";

export const rangeLabelMap = {
  day: "Today",
  week: "This Week",
  all: "All",
};
export type TimeRangeOption = keyof typeof rangeLabelMap;
