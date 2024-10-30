export function getStartOfWeek(date) {
  const day = new Date(date); // Create a new Date object to avoid modifying the original date
  const dayOfWeek = day.getUTCDay(); // Get day of the week (0 = Sunday, 1 = Monday, etc.)
  const diff = day.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Calculate start of the week (Monday as start of the week)
  day.setUTCDate(diff);
  return day.toISOString().split('T')[0]; // Return 'YYYY-MM-DD' format of the week's start date
}