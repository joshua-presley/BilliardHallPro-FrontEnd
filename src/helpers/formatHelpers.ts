
export function formatSessionType(sessionType: string): string {
  return sessionType.charAt(0).toUpperCase() + sessionType.slice(1);
}

export function formatStartTime(startedAt: string): string {
  return new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * format a string in the format "HH:mm:ss" to a Date object.
 * Uses Today as the date.
 * @param timeString Time value in "HH:mm:ss"
 */
export function timeStringToDate(timeString: string): Date { 
      const todayString: string = new Date().toISOString().split('T')[0];
      const fullDateTimeString: string = `${todayString}T${timeString}`;
      return new Date(fullDateTimeString)
}