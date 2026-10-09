import { NoValidScheduleException } from "../exceptions/NoValidScheduleExpection";
import type { Table } from "../types/models/Table";
import { intervalIsValidToday, type TableInterval } from "../types/models/TableInterval";
import { compareTimeToNow } from "./math";

/**
 * Get the active pricing interval for this table.
 * @param table The table we will read the schedule for.
 * @returns The proper interval for today at the time of reading.
 * @throws {NoValidScheduleException} if no valid TableInterval can be found.
 */
export function getActiveInterval(table: Table): TableInterval {
    const now = new Date()
    const interval = table.schedule?.intervals.find(i => {
        return intervalIsValidToday(i)
            && compareTimeToNow(i.start_time, now, "lt")
            && compareTimeToNow(i.end_time, now, "gt")

    })

    if (!interval) {
        throw new NoValidScheduleException(table.name)
    }

    return interval
}