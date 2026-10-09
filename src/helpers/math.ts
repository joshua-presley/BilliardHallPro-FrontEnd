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