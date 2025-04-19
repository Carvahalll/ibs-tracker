/**
 * Checks if a given timestamp (in milliseconds) represents today's date.
 * @param timestamp - The timestamp in milliseconds.
 * @returns True if the timestamp is from today, false otherwise.
 */
export const isToday = (timestamp: number): boolean => {
  const today = new Date();
  const dateFromTimestamp = new Date(timestamp);
  return (
    dateFromTimestamp.getDate() === today.getDate() &&
    dateFromTimestamp.getMonth() === today.getMonth() &&
    dateFromTimestamp.getFullYear() === today.getFullYear()
  );
};

/**
 * Formats a timestamp (in milliseconds) into a YYYY-MM-DD string.
 * @param timestamp - The timestamp in milliseconds.
 * @returns The formatted date string.
 */
export const formatTimestampToDateString = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Formats a date string (YYYY-MM-DD) into a shorter representation (e.g., MM/DD).
 * @param dateString - The date string in YYYY-MM-DD format.
 * @returns The formatted short date string.
 */
export const formatShortDate = (dateString: string): string => {
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}`; // MM/DD
    }
    return dateString; // Fallback
};

/**
 * Formats a timestamp (in milliseconds) into a string suitable for datetime-local input (YYYY-MM-DDTHH:mm).
 * Handles timezone offset correctly.
 * @param timestamp - The timestamp in milliseconds.
 * @returns The formatted date-time string.
 */
export const formatTimestampForInput = (timestamp: number): string => {
  const date = new Date(timestamp);
  // Adjust for timezone offset to display local time in the input
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  // Check if the date is valid before slicing
  if (isNaN(localDate.getTime())) {
      console.error("Invalid timestamp provided to formatTimestampForInput:", timestamp);
      // Return a default value or handle the error appropriately
      // Returning current time as a fallback, but ideally the source timestamp should be valid
      const now = new Date();
      const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      return localNow.toISOString().slice(0, 16);
  }
  return localDate.toISOString().slice(0, 16); // Get YYYY-MM-DDTHH:mm
};

/**
 * Parses a datetime-local input string (YYYY-MM-DDTHH:mm) into a Unix timestamp (milliseconds).
 * Assumes the input string represents local time.
 * @param dateTimeString - The date-time string from the input.
 * @returns The Unix timestamp in milliseconds, or NaN if parsing fails.
 */
export const parseInputTimestamp = (dateTimeString: string): number => {
  // new Date() parsing of YYYY-MM-DDTHH:mm assumes local time
  const date = new Date(dateTimeString);
  return date.getTime(); // Returns milliseconds since epoch
};
