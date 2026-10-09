import type { Table } from "../types/models/Table";
import { getActiveInterval } from "./tableHelpers";

export function formatSessionType(sessionType: string): string {
  return sessionType.charAt(0).toUpperCase() + sessionType.slice(1);
}

export function formatStartTime(startedAt: string): string {
  return new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}



/**
 * Returns a string display of rate information for this table based on the active schedule.
 * @param table The table to get rate information for. Will read this table's schedule. 
 * @param t Translation function
 */
export function getRateDisplay(table: Table, t: any): string { 
  //The below is generally not acceptable. Hooks are only supposed to be used on screens. 
  const interval = getActiveInterval(table)
  const rate = interval.rate
  const rate_type = interval.rate_type
  switch (rate_type) { 
    case 0: return "$" + rate.toString()
    case 1: return "$" + rate.toString() + t("RateTypes.perPerson")
    case 2: return "$" + rate.toString() + t("RateTypes.perHour")
    case 3: return "$" + rate.toString() + t("RateTypes.perPersonPerHour")
  }
}