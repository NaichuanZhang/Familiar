import { relations } from "drizzle-orm";
import { users } from "./users";
import { patientProfiles } from "./patient-profiles";
import { userPatients } from "./user-patients";
import { callSchedules } from "./call-schedules";
import { callLogs } from "./call-logs";
import { actionItems } from "./action-items";

export const usersRelations = relations(users, ({ many }) => ({
  userPatients: many(userPatients),
  createdSchedules: many(callSchedules, { relationName: "createdBy" }),
  assignedSchedules: many(callSchedules, { relationName: "assignedTo" }),
  createdActionItems: many(actionItems, { relationName: "createdBy" }),
  assignedActionItems: many(actionItems, { relationName: "assignedTo" }),
}));

export const patientProfilesRelations = relations(
  patientProfiles,
  ({ many }) => ({
    userPatients: many(userPatients),
    callSchedules: many(callSchedules),
    callLogs: many(callLogs),
    actionItems: many(actionItems),
  })
);

export const userPatientsRelations = relations(userPatients, ({ one }) => ({
  user: one(users, {
    fields: [userPatients.userId],
    references: [users.id],
  }),
  patient: one(patientProfiles, {
    fields: [userPatients.patientId],
    references: [patientProfiles.id],
  }),
}));

export const callSchedulesRelations = relations(
  callSchedules,
  ({ one, many }) => ({
    patient: one(patientProfiles, {
      fields: [callSchedules.patientId],
      references: [patientProfiles.id],
    }),
    createdBy: one(users, {
      fields: [callSchedules.createdByUserId],
      references: [users.id],
      relationName: "createdBy",
    }),
    assignedTo: one(users, {
      fields: [callSchedules.assignedUserId],
      references: [users.id],
      relationName: "assignedTo",
    }),
    callLogs: many(callLogs),
  })
);

export const callLogsRelations = relations(callLogs, ({ one, many }) => ({
  patient: one(patientProfiles, {
    fields: [callLogs.patientId],
    references: [patientProfiles.id],
  }),
  schedule: one(callSchedules, {
    fields: [callLogs.scheduleId],
    references: [callSchedules.id],
  }),
  actionItems: many(actionItems),
}));

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  patient: one(patientProfiles, {
    fields: [actionItems.patientId],
    references: [patientProfiles.id],
  }),
  call: one(callLogs, {
    fields: [actionItems.callId],
    references: [callLogs.id],
  }),
  createdBy: one(users, {
    fields: [actionItems.createdByUserId],
    references: [users.id],
    relationName: "createdBy",
  }),
  assignedTo: one(users, {
    fields: [actionItems.assignedUserId],
    references: [users.id],
    relationName: "assignedTo",
  }),
  completedBy: one(users, {
    fields: [actionItems.completedByUserId],
    references: [users.id],
    relationName: "completedBy",
  }),
}));
