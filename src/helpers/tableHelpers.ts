import { NoValidScheduleException } from "../exceptions/NoValidScheduleExpection";
import type { Table } from "../types/models/Table";
import { intervalIsValidToday, type TableInterval } from "../types/models/TableInterval";
import { compareTimeToNow } from "./math";

export function getActiveInterval(table: Table): TableInterval {
    const interval = table.schedule?.intervals.find(i => {
        const now = new Date()
        return intervalIsValidToday(i)
            && compareTimeToNow(i.start_time, now, "lt")
            && compareTimeToNow(i.end_time, now, "gt")

    })

    if (!interval) {
        throw new NoValidScheduleException(table.name)
    }

    return interval
}