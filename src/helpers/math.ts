import { ParameterValidationException } from "../exceptions/ParameterValidationException"

/**
 * Round the given number of minutes up to the nearest 15
 * for billing predictability
 */
export function roundToNearestFifteenMinutes(hours: number){
    const fraction = hours - Math.floor(hours)
    return Math.floor(hours) + round(fraction)
}

/**
 * Round the given value up to the closest interval.
 * @param value Value to round
 * @param intervals Array of numbers to "snap" to. Defaults to [0,0.25,0.5,0.75,1]
 * @returns The rounded number.
 * @throws ParameterValidationException if the value is outside the range, or if intervals is an empty array.
 */
function round(value: number, intervals: number[] = [0,0.25,0.5,0.75,1]): number{
    intervals = intervals.sort()
    var rounded = value
    if(intervals.length === 0) { 
        throw new ParameterValidationException("Intervals cannot be empty.", "intervals")
    }
    if(value < intervals.at(0)! || value > intervals.at(intervals.length)!) { 
        throw new ParameterValidationException("Value not in range", "value")
    }

    for(var i = 0; i < intervals.length - 1; i++){
        if(value > intervals[i] && value < intervals[i+1]){
            if(value - intervals[i] < intervals[i+1] - value){
                rounded = intervals[i]
            }
            else{
                rounded = intervals[i+1]
            }
        }
    }
    return rounded
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