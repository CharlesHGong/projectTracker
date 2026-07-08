import { getLogsBetweenDates } from "./db.mjs";
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const hoursInMs = 1000 * 60 * 60;
const detailedLogHeaders = [
  'Project',
  'Project ID',
  'Start Time',
  'End Time',
  'Length (h)',
  'Description',
];

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? '');
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
};

export const exportLogs = async ({ type, startTime, endTime }) => {
  const logs = await getLogsBetweenDates({ startDate: startTime, endDate: endTime });
  if (type === 'raw') {
    return exportRawLogs({ logs, startTime, endTime });
  } else if (type === 'report') {
    return exportReport({ logs, startTime, endTime });
  }
}

const exportReport = async ({ logs, startTime, endTime }) => {
  const projectDetails = logs.reduce((acc, log) => {
    if (!acc.has(log.projectName)) {
      acc.set(log.projectName, log.projectCode ?? '');
    }
    return acc;
  }, new Map());
  const daysBetween = [];
  let currentDate = new Date(startTime);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate <= new Date(endTime)) {
    daysBetween.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  const projectDateMap = getProjectDateMap(logs);
  const headers = ['Project Name', 'Project ID', ...daysBetween.map(date => date.toLocaleDateString("en-US")), 'Total'];
  const rows = Array.from(projectDetails.entries()).map(([projectName, projectCode]) => {
    const row = [projectName, projectCode];
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
  const csvContent = [
    headers,
    ...rows,
    [],
    [],
    [],
    detailedLogHeaders,
    ...getDetailedLogRows(logs),
  ]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');
  const filePath = path.join(`${app.getPath('downloads')}/report-${getFileName(startTime, endTime)}.csv`);
  fs.writeFileSync(filePath, csvContent);
  return { success: true };
}

const exportRawLogs = async ({ logs, startTime, endTime }) => {
  const csvContent = [detailedLogHeaders, ...getDetailedLogRows(logs)]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');
  const filePath = path.join(`${app.getPath('downloads')}/rawLogs-${getFileName(startTime, endTime)}.csv`);
  fs.writeFileSync(filePath, csvContent);
  return { success: true };
};

const getDetailedLogRows = (logs) => {
  const sortedLogs = [...logs];
  sortedLogs.sort((a, b) => a.startTime - b.startTime);
  return sortedLogs.map(log => [
    log.projectName,
    log.projectCode ?? '',
    new Date(log.startTime).toLocaleString(),
    new Date(log.endTime).toLocaleString(),
    ((log.endTime - log.startTime) / hoursInMs).toFixed(2),
    log.description ?? '',
  ]);
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
