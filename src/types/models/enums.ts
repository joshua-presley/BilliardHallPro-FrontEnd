// ---- Enums / literal unions, mirroring Django's TextChoices/IntegerChoices ----

export type TableType = 'bar_box' | 'nine_foot' | 'snooker' | 'carom';

export type SessionType = 'regular' | 'league' | 'tournament' | 'reserved';

/**
 * 0: flat rate
 * 
 * 1: flat rate per person
 * 
 * 2: flat rate per hour
 * 
 * 3: flat rate per person per hour
 */
export type RateType = 0 | 1 | 2 | 3
