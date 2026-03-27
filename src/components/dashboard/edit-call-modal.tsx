"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScheduleData = {
  id: string;
  title: string;
  callType: string;
  purpose: string | null;
  cadence: string;
  scheduledTime: string;
  assignedUserId: string | null;
  isActive: boolean;
};

type EditCallModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  schedule: ScheduleData;
  users: { id: string; name: string }[];
};

export function EditCallModal({
  open,
  onClose,
  onSaved,
  schedule,
  users,
}: EditCallModalProps) {
  const [callType, setCallType] = useState<"medicine" | "checkin">(
    schedule.callType as "medicine" | "checkin",
  );
  const [title, setTitle] = useState(schedule.title);
  const [cadence, setCadence] = useState(schedule.cadence);
  const [time, setTime] = useState(schedule.scheduledTime);
  const [assignedUserId, setAssignedUserId] = useState(
    schedule.assignedUserId ?? users[0]?.id ?? "",
  );
  const [purpose, setPurpose] = useState(schedule.purpose ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/schedules/${schedule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          callType,
          cadence,
          scheduledTime: time,
          assignedUserId: assignedUserId || undefined,
          purpose: purpose || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        alert(`Save failed: ${data.error}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this call schedule? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/schedules/${schedule.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        alert(`Delete failed: ${data.error}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-xl font-[var(--font-body)] text-sm text-text bg-bg-white outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(212,113,78,0.1)] transition-colors";
  const selectClass = `${inputClass} appearance-none pr-9 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2712%27%20height%3D%278%27%20viewBox%3D%270%200%2012%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201.5L6%206.5L11%201.5%27%20stroke%3D%27%237A6B5D%27%20stroke-width%3D%271.5%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]`;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-[22px]">Edit Call Task</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted text-lg hover:bg-bg-warm hover:text-text cursor-pointer transition-all duration-150"
        >
          &times;
        </button>
      </div>

      {/* Call Type */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">
          Call Type
        </div>
        <div className="flex gap-2.5">
          {(["medicine", "checkin"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setCallType(type)}
              className={cn(
                "flex-1 p-3.5 border-2 rounded-xl text-center cursor-pointer transition-all duration-250",
                callType === type
                  ? "border-primary bg-primary-subtle"
                  : "border-border hover:border-primary-light",
              )}
            >
              <div className="text-2xl mb-1.5">
                {type === "medicine" ? "\u{1F48A}" : "\u{1F49B}"}
              </div>
              <div className="text-[13px] font-semibold">
                {type === "medicine" ? "Medicine Reminder" : "Daily Check-in"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
          Task Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Morning Medicine Reminder"
          className={inputClass}
        />
      </div>

      {/* Cadence & Time */}
      <div className="grid grid-cols-2 gap-3.5 mb-5">
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
            Cadence
          </label>
          <select
            value={cadence}
            onChange={(e) => setCadence(e.target.value)}
            className={selectClass}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every other day</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Assigned To */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
          Assigned To
        </label>
        <select
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
          className={selectClass}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Purpose */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
          Purpose & Notes
        </label>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="What should be discussed or reminded during this call?"
          className={`${inputClass} resize-y min-h-20 leading-relaxed`}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-7 pt-5 border-t border-border-light">
        <Button
          variant="secondary"
          onClick={handleDelete}
          disabled={deleting || submitting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || deleting || !title.trim()}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
