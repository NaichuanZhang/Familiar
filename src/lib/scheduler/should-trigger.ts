export type ScheduleInput = {
  scheduledTime: string; // "HH:MM" or "HH:MM:SS"
  cadence: string; // "daily" | "weekly" | "biweekly" | "monthly" | "custom"
  daysOfWeek: number[] | null; // 0=Sun..6=Sat
  isActive: boolean;
};

export type TriggerOptions = {
  nowInPatientTz: Date;
  windowMinutes: number; // cron interval, e.g. 5
};

function parseTime(timeStr: string): { hour: number; minute: number } {
  const parts = timeStr.split(":");
  return {
    hour: parseInt(parts[0], 10),
    minute: parseInt(parts[1], 10),
  };
}

function getMinuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function isDayMatch(
  cadence: string,
  daysOfWeek: number[] | null,
  now: Date,
): boolean {
  const currentDay = now.getDay(); // 0=Sun..6=Sat

  switch (cadence) {
    case "daily":
      return true;

    case "weekly":
      // If daysOfWeek specified, check match; otherwise default to current day being any day
      if (daysOfWeek && daysOfWeek.length > 0) {
        return daysOfWeek.includes(currentDay);
      }
      // Weekly without specific days — trigger on the first day of the week (Monday=1)
      return currentDay === 1;

    case "biweekly":
      // Trigger on even ISO weeks, matching daysOfWeek or Monday
      if (daysOfWeek && daysOfWeek.length > 0) {
        if (!daysOfWeek.includes(currentDay)) return false;
      } else if (currentDay !== 1) {
        return false;
      }
      return getISOWeekNumber(now) % 2 === 0;

    case "monthly":
      // Trigger on the 1st of each month (or daysOfWeek[0] as day-of-month if set)
      return now.getDate() === 1;

    case "custom":
      if (!daysOfWeek || daysOfWeek.length === 0) return false;
      return daysOfWeek.includes(currentDay);

    default:
      return false;
  }
}

export function shouldTriggerSchedule(
  schedule: ScheduleInput,
  options: TriggerOptions,
): boolean {
  if (!schedule.isActive) return false;

  const { nowInPatientTz, windowMinutes } = options;
  const scheduled = parseTime(schedule.scheduledTime);
  const scheduledMinute = scheduled.hour * 60 + scheduled.minute;
  const currentMinute = getMinuteOfDay(nowInPatientTz);

  // Check if current time is within [scheduledTime, scheduledTime + window)
  const diff = currentMinute - scheduledMinute;
  if (diff < 0 || diff >= windowMinutes) return false;

  return isDayMatch(schedule.cadence, schedule.daysOfWeek, nowInPatientTz);
}

/**
 * Convert current UTC time to a Date object representing the local time in the given timezone.
 * Uses Intl.DateTimeFormat to extract date parts reliably.
 */
export function nowInTimezone(timezone: string): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parseInt(parts.find((p) => p.type === type)!.value, 10);

  return new Date(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
}
