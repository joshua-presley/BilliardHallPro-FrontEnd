// ---- Enums / literal unions, mirroring Django's TextChoices/IntegerChoices ----

export type TableType = 'bar_box' | 'nine_foot' | 'snooker' | 'carom';

export type SessionType = 'regular' | 'league' | 'tournament' | 'reserved';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Monday = 0 ... Sunday = 6
