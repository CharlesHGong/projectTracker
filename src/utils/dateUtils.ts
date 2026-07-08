import { Log } from "../types";

export const formatTime = (totalTime: number) => {
  const hours = Math.floor(totalTime / 3600000);
  const minutes = Math.floor((totalTime % 3600000) / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const formatTimeMinutes = (totalTime: number) => {
  const hours = Math.floor(totalTime / 3600000);
  const minutes = Math.floor((totalTime % 3600000) / 60000);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}m`;
};

const formatDateDisplay = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${month.toString().padStart(2, "0")}/${day
    .toString()
    .padStart(2, "0")}/${year}`;
};

const formatTimeDisplay = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const isValidLog = ({ startTime, endTime }: Log) =>
  Number.isFinite(startTime) && Number.isFinite(endTime) && endTime > startTime;

const getStartOfDay = (date: Date) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
};

const getStartOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const mapBucketsToGroups = (
  lmap: Map<number, number>,
  formatBucket: (bucketStart: number) => string
) =>
  Array.from(lmap.entries())
    .sort(([a], [b]) => a - b)
    .map(([bucketStart, totalTime]) => ({
      start: formatBucket(bucketStart),
      time: formatTimeMinutes(totalTime),
    }));

export function groupDatesByDay(logs: Log[]) {
  const lmap = logs.reduce((acc: Map<number, number>, log) => {
    if (!isValidLog(log)) {
      return acc;
    }

    const dayStart = getStartOfDay(new Date(log.startTime)).getTime();
    acc.set(dayStart, (acc.get(dayStart) ?? 0) + log.endTime - log.startTime);

    return acc;
  }, new Map<number, number>());

  return mapBucketsToGroups(lmap, (bucketStart) =>
    formatDateDisplay(new Date(bucketStart))
  );
}

export function groupDatesByWeek(logs: Log[]) {
  const lmap = logs.reduce((acc: Map<number, number>, log) => {
    if (!isValidLog(log)) {
      return acc;
    }

    const startOfWeek = getStartOfWeek(new Date(log.startTime)).getTime();
    acc.set(
      startOfWeek,
      (acc.get(startOfWeek) ?? 0) + log.endTime - log.startTime
    );
    return acc;
  }, new Map<number, number>());

  return mapBucketsToGroups(lmap, (bucketStart) =>
    formatDateDisplay(new Date(bucketStart))
  );
}

export function getStartOfWeek(date: Date) {
  const day = new Date(date); // Create a new Date object to avoid modifying the original date
  const dayOfWeek = day.getDay(); // Get day of the week (0 = Sunday, 1 = Monday, etc.)
  const diff = day.getDate() - dayOfWeek;
  day.setDate(diff);
  day.setHours(0, 0, 0, 0);
  return day;
}

export function groupDatesByMonth(logs: Log[]) {
  const lmap = logs.reduce((acc: Map<number, number>, log) => {
    if (!isValidLog(log)) {
      return acc;
    }

    const monthStart = getStartOfMonth(new Date(log.startTime)).getTime();
    acc.set(
      monthStart,
      (acc.get(monthStart) ?? 0) + log.endTime - log.startTime
    );
    return acc;
  }, new Map<number, number>());

  return mapBucketsToGroups(lmap, (bucketStart) => {
    const mDate = new Date(bucketStart);
    return `${(mDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${mDate.getFullYear()}`;
  });
}

export function groupByNone(logs: Log[]) {
  return logs.map(({ startTime, endTime, description }) => ({
    start: `${formatDateDisplay(new Date(startTime))}-${formatTimeDisplay(
      new Date(startTime)
    )}`,
    time: formatTimeMinutes(endTime - startTime),
    startTime,
    endTime,
    description,
  }));
}
