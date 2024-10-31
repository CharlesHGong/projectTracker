import { getStartOfWeek } from "./dateUtils.mjs";
import { getLogsBetweenDates } from "./db.mjs";
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export const exportLogs = async () => {
  const logs = await getLogsBetweenDates({ startDate: getStartOfWeek(Date.now()), endDate: Date.now() });
  const groups = groupDatesByDay(logs);
  groups.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start.localeCompare(b.start);
    }
    return a.projectName.localeCompare(b.projectName);
  });

  const csvData = convertToCSV(groups);
  const filePath = path.join(`${app.getPath('downloads')}/logs.csv`);
  fs.writeFileSync(filePath, csvData);

  return { success: true };
}

function convertToCSV(groups) {
  const headers = ['Date', 'Project Name', 'Time'];
  const rows = groups.map(group => [group.start, group.projectName, group.time]);
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  return csvContent;
}

const hoursInMs = 1000 * 60 * 60;
export function groupDatesByDay(logs) {
  const lmap = logs.reduce((acc, log) => {
    const day = new Date(log.startTime).toISOString().split("T")[0]; // Extract the date part in 'YYYY-MM-DD' format
    const key = day + ':' + log.projectName;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += log.endTime - log.startTime;
    return acc;
  }, {});
  return Object.keys(lmap).map((key) => ({
    start: key.split(':')[0],
    projectName: key.split(':')[1],
    time: (lmap[key] / hoursInMs).toFixed(2),
  }));
}