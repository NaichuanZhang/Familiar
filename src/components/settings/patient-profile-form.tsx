"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type PatientData = {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phoneNumber: string;
  dateOfBirth: string | null;
  location: string | null;
  timezone: string;
  healthStatus: string | null;
  medicalNotes: string | null;
};

type PatientProfileFormProps = {
  patient: PatientData;
};

const inputClass =
  "w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-xl text-sm text-text bg-bg-white outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(212,113,78,0.1)] transition-colors";
const labelClass =
  "text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block";

export function PatientProfileForm({ patient }: PatientProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: patient.firstName,
    lastName: patient.lastName,
    nickname: patient.nickname ?? "",
    phoneNumber: patient.phoneNumber,
    dateOfBirth: patient.dateOfBirth ?? "",
    location: patient.location ?? "",
    timezone: patient.timezone,
    healthStatus: patient.healthStatus ?? "stable",
    medicalNotes: patient.medicalNotes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          nickname: form.nickname || undefined,
          phoneNumber: form.phoneNumber,
          dateOfBirth: form.dateOfBirth || undefined,
          location: form.location || undefined,
          timezone: form.timezone,
          healthStatus: form.healthStatus,
          medicalNotes: form.medicalNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        router.refresh();
      } else {
        alert(`Save failed: ${data.error}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 mb-5 max-md:grid-cols-1">
        <div>
          <label className={labelClass}>First Name</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 max-md:grid-cols-1">
        <div>
          <label className={labelClass}>Nickname</label>
          <input
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            placeholder='e.g., "Mom", "Grandpa"'
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="+1234567890"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 max-md:grid-cols-1">
        <div>
          <label className={labelClass}>Date of Birth</label>
          <input
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="San Francisco, CA"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 max-md:grid-cols-1">
        <div>
          <label className={labelClass}>Timezone</label>
          <select
            name="timezone"
            value={form.timezone}
            onChange={handleChange}
            className={`${inputClass} appearance-none`}
          >
            <option value="America/New_York">Eastern</option>
            <option value="America/Chicago">Central</option>
            <option value="America/Denver">Mountain</option>
            <option value="America/Los_Angeles">Pacific</option>
            <option value="Pacific/Honolulu">Hawaii</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Health Status</label>
          <select
            name="healthStatus"
            value={form.healthStatus}
            onChange={handleChange}
            className={`${inputClass} appearance-none`}
          >
            <option value="stable">Stable</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="mb-5">
        <label className={labelClass}>Medical Notes</label>
        <textarea
          name="medicalNotes"
          value={form.medicalNotes}
          onChange={handleChange}
          placeholder="Any medical conditions, medications, or notes..."
          className={`${inputClass} resize-y min-h-24 leading-relaxed`}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {saved && (
          <span className="text-sm text-success font-medium">Saved!</span>
        )}
      </div>
    </form>
  );
}
