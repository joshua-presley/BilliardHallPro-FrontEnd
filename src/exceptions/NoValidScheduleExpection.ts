
/**
 * Throw this exception when a table does not have a valid schedule
 * attached to it. 
 * 
 * A table without a valid schedule is impossible to bill.
 */
export class NoValidScheduleException extends Error { 
    constructor(tableName: string) {
        super(`${tableName} does not have a valid schedule for now!`)
    }
}