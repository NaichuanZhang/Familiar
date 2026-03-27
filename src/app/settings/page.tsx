import { db } from "@/db";
import { patientProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PatientProfileForm } from "@/components/settings/patient-profile-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PATIENT_ID = "b1000000-0000-0000-0000-000000000001";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [patient] = await db
    .select()
    .from(patientProfiles)
    .where(eq(patientProfiles.id, PATIENT_ID));

  if (!patient) {
    return (
      <div className="ml-60 p-8 max-md:ml-0">
        <p className="text-text-secondary">Patient not found.</p>
      </div>
    );
  }

  return (
    <div className="ml-60 p-8 px-9 max-md:ml-0 max-md:p-5 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <h1 className="font-display text-[28px] font-bold text-text mb-2">
        Settings
      </h1>
      <p className="text-sm text-text-secondary mb-8">
        Manage patient profile and preferences
      </p>

      <div className="bg-bg-white rounded-2xl p-6 shadow-sm border border-border-light">
        <h2 className="font-display text-lg font-medium text-text mb-5">
          Patient Profile
        </h2>
        <PatientProfileForm
          patient={{
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            nickname: patient.nickname,
            phoneNumber: patient.phoneNumber,
            dateOfBirth: patient.dateOfBirth,
            location: patient.location,
            timezone: patient.timezone,
            healthStatus: patient.healthStatus,
            medicalNotes: patient.medicalNotes,
          }}
        />
      </div>
    </div>
  );
}
