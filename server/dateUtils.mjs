export function getStartOfWeek(date) {
  const day = new Date(date); // Create a new Date object to avoid modifying the original date
  const dayOfWeek = day.getDay(); // Get day of the week (0 = Sunday, 1 = Monday, etc.)
  const diff = day.getDate() - dayOfWeek;
  day.setDate(diff); // Set date to the start of the week
  day.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
  return day.getTime(); // Return 'YYYY-MM-DD' format of the week's start date
}

export function getStartOfDay(date) {
  const day = new Date(date); // Create a new Date object to avoid modifying the original date
  day.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
  return day.getTime();
}

export function getStartOfRange(date, range) {
  if (range === 'week') {
    return getStartOfWeek(date);
  } else if (range === 'day') {
    return getStartOfDay(date);
  }
  return 0;
}