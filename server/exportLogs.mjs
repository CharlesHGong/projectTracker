import { getLogsBetweenDates } from "./db.mjs";
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const hoursInMs = 1000 * 60 * 60;

export const exportLogs = async ({ type, startTime, endTime }) => {
  const logs = await getLogsBetweenDates({ startDate: startTime, endDate: endTime });
  if (type === 'raw') {
    return exportRawLogs({ logs, startTime, endTime });
  } else if (type === 'report') {
    return exportReport({ logs, startTime, endTime });
  }
}

const exportReport = async ({ logs, startTime, endTime }) => {
  const projectNames = logs.reduce((acc, log) => acc.add(log.projectName), new Set());
  const daysBetween = [];
  let currentDate = new Date(startTime);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate <= new Date(endTime)) {
    daysBetween.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  const projectDateMap = getProjectDateMap(logs);
  const headers = ['Project Name', ...daysBetween.map(date => date.toLocaleDateString("en-US")), 'Total'];
  const rows = Array.from(projectNames).map(projectName => {
    const row = [projectName];
    let sum = 0;
    daysBetween.forEach(date => {
      const key = date.toLocaleDateString("en-US") + ':' + projectName;
      const time = (projectDateMap[key] ?? 0) / hoursInMs;
      sum += time;
      row.push(time.toFixed(2));
    });
    row.push(sum.toFixed(2));
    return row;
  });
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const filePath = path.join(`${app.getPath('downloads')}/report-${getFileName(startTime, endTime)}.csv`);
  fs.writeFileSync(filePath, csvContent);
  return { success: true };
}

const exportRawLogs = async ({ logs, startTime, endTime }) => {
  const sortedLogs = [...logs];
  sortedLogs.sort((a, b) => a.startTime - b.startTime);
  const headers = ['Project Name', 'Start Time', 'End Time', 'Duration(h)'];
  const rows = sortedLogs.map(log => [
    log.projectName,
    new Date(log.startTime).toLocaleString(),
    new Date(log.endTime).toLocaleString(),
    ((log.endTime - log.startTime) / (1000 * 60 * 60)).toFixed(2)
  ]);
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const filePath = path.join(`${app.getPath('downloads')}/rawLogs-${getFileName(startTime, endTime)}.csv`);
  fs.writeFileSync(filePath, csvContent);
  return { success: true };
};

const getFileName = (startTime, endTime) => {
  const start = new Date(startTime).toLocaleDateString("en-US").replaceAll('/', '-');
  const end = new Date(endTime).toLocaleDateString("en-US").replaceAll('/', '-');
  return `${start}-${end}`;
}

export function getProjectDateMap(logs) {
  return logs.reduce((acc, log) => {
    const day = new Date(log.startTime).toLocaleDateString("en-US");
    const key = day + ':' + log.projectName;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += log.endTime - log.startTime;
    return acc;
  }, {});
}