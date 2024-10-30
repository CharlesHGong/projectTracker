export const formatTime = (totalTime) => {
  const hours = Math.floor(totalTime / 3600000);
  const minutes = Math.floor((totalTime % 3600000) / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export function groupDatesByDay(logs) {
  const lmap = logs.reduce((acc, log) => {
    const day = new Date(log.startTime).toISOString().split("T")[0]; // Extract the date part in 'YYYY-MM-DD' format
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
  const dayOfWeek = day.getUTCDay(); // Get day of the week (0 = Sunday, 1 = Monday, etc.)
  const diff = day.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Calculate start of the week (Monday as start of the week)
  day.setUTCDate(diff);
  return day.toISOString().split('T')[0]; // Return 'YYYY-MM-DD' format of the week's start date
}

export function groupDatesByMonth(logs) {
  const lmap = logs.reduce((acc, log) => {
    const month = new Date(log.startTime).toISOString().slice(0, 7); // Extract 'YYYY-MM' part
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
    start: `${new Date(startTime).toLocaleDateString("en-US")}-${new Date(startTime).toLocaleTimeString("en-US")}`,
    time: formatTime(endTime - startTime)
  }));
}