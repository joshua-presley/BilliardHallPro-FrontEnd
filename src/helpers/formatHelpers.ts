import { ParameterValidationException } from "../exceptions/ParameterValidationException";

export function formatSessionType(sessionType: string): string {
  return sessionType.charAt(0).toUpperCase() + sessionType.slice(1);
}

export function formatStartTime(startedAt: string): string {
  return new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Compare the passed in time string to now. 
 * @param timeString Time string in the format "HH:mm:ss"
 * @param now Date object which represents current system time.
 * @param comparison "lt" or "gt". 
 * @remarks The comparison is of the form `timeString comparison now`. 
 * @example 12:01:00 (timestring) lt 17:01:00 (now) returns true
 * @returns True if the condition is satisfied, false otherwise.
 * @throws ParameterValidationException if the time string is not in the right form.
 */
export function compareTimeToNow(timeString: string, now: Date, comparison: "lt" | "gt") { 
  const timeArray = timeString.split(":")
  if(timeArray.length < 3) { 
    throw new ParameterValidationException("timeString must be in format \"HH:mm:ss\"", "timeString")
  }
  console.log(timeArray)
  console.log([now.getHours(), now.getMinutes(), now.getSeconds()])
  if(comparison === "gt") {
    return Number(timeArray[0]) > now.getHours() ||
      (Number(timeArray[0]) === now.getHours() && Number(timeArray[1]) > now.getMinutes()) || 
      (Number(timeArray[0]) === now.getHours() && Number(timeArray[1]) === now.getMinutes() && Number(timeArray[2]) > now.getSeconds())
  }
  else if (comparison === "lt") { 
   return Number(timeArray[0]) < now.getHours() ||
      (Number(timeArray[0]) === now.getHours() && Number(timeArray[1]) < now.getMinutes()) || 
      (Number(timeArray[0]) === now.getHours() && Number(timeArray[1]) === now.getMinutes() && Number(timeArray[2]) < now.getSeconds()) 
  }
}