
export function formatSessionType(sessionType: string): string {
  return sessionType.charAt(0).toUpperCase() + sessionType.slice(1);
}

export function formatStartTime(startedAt: string): string {
  return new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
