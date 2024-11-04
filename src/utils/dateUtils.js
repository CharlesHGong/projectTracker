export const formatTime = (totalTime) => {
  const hours = Math.floor(totalTime / 3600000);
  const minutes = Math.floor((totalTime % 3600000) / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const formatDateDisplay = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}/${year}`;
}

const formatTimeDisplay = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function groupDatesByDay(logs) {
  const lmap = logs.reduce((acc, log) => {
    const day = formatDateDisplay(new Date(log.startTime));
    if (!acc[day]) {
      acc[day] = 0;
    }
    acc[day] += log.endTime - log.startTime;
    return acc;
  }, {});
  return Object.keys(lmap).map((key) => ({ start: key, time: formatTime(lmap[key]) }));
}

export function groupDatesByWeek(logs) {
  const lmap = logs.reduce((acc, log) => {
    const startOfWeek = getStartOfWeek(new Date(log.startTime)); // Get the start of the week in 'YYYY-MM-DD' format
    if (!acc[startOfWeek]) {
      acc[startOfWeek] = 0;
    }
    acc[startOfWeek] += log.endTime - log.startTime;
    return acc;
  }, {});
  return Object.keys(lmap).map((key) => ({ start: key, time: formatTime(lmap[key]) }));
}

export function getStartOfWeek(date) {
  const day = new Date(date); // Create a new Date object to avoid modifying the original date
  const dayOfWeek = day.getDay(); // Get day of the week (0 = Sunday, 1 = Monday, etc.)
  const diff = day.getDate() - dayOfWeek;
  day.setDate(diff);
  return formatDateDisplay(day);
}

export function groupDatesByMonth(logs) {
  const lmap = logs.reduce((acc, log) => {
    const mDate = new Date(log.startTime);
    const month = `${(mDate.getMonth() + 1).toString().padStart(2, "0")}/${mDate.getFullYear()}`; // Extract 'YYYY-MM' part
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += log.endTime - log.startTime;
    return acc;
  }, {});
  return Object.keys(lmap).map((key) => ({ start: key, time: formatTime(lmap[key]) }));
}

export function groupByNone(logs) {
  return logs.map(({ startTime, endTime }) => ({
    start: `${formatDateDisplay(new Date(startTime))}-${formatTimeDisplay(new Date(startTime))}`,
    time: formatTime(endTime - startTime),
    startTime,
    endTime,
  }));
}