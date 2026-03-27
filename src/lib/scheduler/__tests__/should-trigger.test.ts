import { describe, it, expect } from "vitest";
import {
  shouldTriggerSchedule,
  type ScheduleInput,
  type TriggerOptions,
} from "../should-trigger";

function makeSchedule(overrides: Partial<ScheduleInput> = {}): ScheduleInput {
  return {
    scheduledTime: "09:00",
    cadence: "daily",
    daysOfWeek: null,
    isActive: true,
    ...overrides,
  };
}

function makeOptions(
  hour: number,
  minute: number,
  day: number = 1,
): TriggerOptions {
  // day: 0=Sun..6=Sat. Default Monday.
  // March 22, 2026 is a Sunday (day=0), so +day gives the correct getDay() value
  const date = new Date(2026, 2, 22 + day, hour, minute, 0);
  return { nowInPatientTz: date, windowMinutes: 5 };
}

describe("shouldTriggerSchedule", () => {
  it("returns true for daily schedule at matching time", () => {
    const schedule = makeSchedule({ scheduledTime: "09:00", cadence: "daily" });
    expect(shouldTriggerSchedule(schedule, makeOptions(9, 0))).toBe(true);
  });

  it("returns true within the window (e.g., 09:03 for 09:00 with 5-min window)", () => {
    const schedule = makeSchedule({ scheduledTime: "09:00", cadence: "daily" });
    expect(shouldTriggerSchedule(schedule, makeOptions(9, 3))).toBe(true);
  });

  it("returns false outside the window (e.g., 09:05 for 09:00 with 5-min window)", () => {
    const schedule = makeSchedule({ scheduledTime: "09:00", cadence: "daily" });
    expect(shouldTriggerSchedule(schedule, makeOptions(9, 5))).toBe(false);
  });

  it("returns false before the scheduled time", () => {
    const schedule = makeSchedule({ scheduledTime: "09:00", cadence: "daily" });
    expect(shouldTriggerSchedule(schedule, makeOptions(8, 58))).toBe(false);
  });

  it("returns false for inactive schedule", () => {
    const schedule = makeSchedule({ isActive: false });
    expect(shouldTriggerSchedule(schedule, makeOptions(9, 0))).toBe(false);
  });

  it("returns true for weekly schedule on matching day", () => {
    // Monday = 1
    const schedule = makeSchedule({
      cadence: "weekly",
      scheduledTime: "10:00",
      daysOfWeek: [1], // Monday
    });
    expect(shouldTriggerSchedule(schedule, makeOptions(10, 0, 1))).toBe(true);
  });

  it("returns false for weekly schedule on non-matching day", () => {
    const schedule = makeSchedule({
      cadence: "weekly",
      scheduledTime: "10:00",
      daysOfWeek: [1], // Monday
    });
    // day=3 = Wednesday, doesn't match daysOfWeek=[1]
    expect(shouldTriggerSchedule(schedule, makeOptions(10, 0, 3))).toBe(false);
  });

  it("returns true for custom schedule on matching day", () => {
    const schedule = makeSchedule({
      cadence: "custom",
      scheduledTime: "14:30",
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    });
    expect(shouldTriggerSchedule(schedule, makeOptions(14, 30, 1))).toBe(true);
  });

  it("returns false for custom schedule on non-matching day", () => {
    const schedule = makeSchedule({
      cadence: "custom",
      scheduledTime: "14:30",
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    });
    // day=1 is Monday (matches), day=2 is Tuesday (doesn't match)
    expect(shouldTriggerSchedule(schedule, makeOptions(14, 30, 2))).toBe(false);
  });

  it("returns false for custom schedule with no daysOfWeek", () => {
    const schedule = makeSchedule({
      cadence: "custom",
      scheduledTime: "14:30",
      daysOfWeek: null,
    });
    expect(shouldTriggerSchedule(schedule, makeOptions(14, 30))).toBe(false);
  });

  it("handles scheduledTime with seconds (HH:MM:SS)", () => {
    const schedule = makeSchedule({
      scheduledTime: "09:00:00",
      cadence: "daily",
    });
    expect(shouldTriggerSchedule(schedule, makeOptions(9, 2))).toBe(true);
  });

  it("returns false for unknown cadence", () => {
    const schedule = makeSchedule({ cadence: "unknown" });
    expect(shouldTriggerSchedule(schedule, makeOptions(9, 0))).toBe(false);
  });

  it("returns true for monthly schedule on 1st of month at matching time", () => {
    const schedule = makeSchedule({
      cadence: "monthly",
      scheduledTime: "08:00",
    });
    // Create a date on the 1st
    const date = new Date(2026, 3, 1, 8, 0, 0); // April 1, 2026
    expect(
      shouldTriggerSchedule(schedule, {
        nowInPatientTz: date,
        windowMinutes: 5,
      }),
    ).toBe(true);
  });

  it("returns false for monthly schedule on non-1st day", () => {
    const schedule = makeSchedule({
      cadence: "monthly",
      scheduledTime: "08:00",
    });
    const date = new Date(2026, 3, 15, 8, 0, 0); // April 15, 2026
    expect(
      shouldTriggerSchedule(schedule, {
        nowInPatientTz: date,
        windowMinutes: 5,
      }),
    ).toBe(false);
  });
});
