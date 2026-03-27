"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { RightPanel } from "./right-panel";

type FamilyMember = {
  name: string;
  displayColor: string;
};

type Patient = {
  firstName: string;
  lastName: string;
  nickname: string | null;
  healthStatus: string | null;
  location: string | null;
  dateOfBirth: string | null;
};

type ActionItem = {
  id: string;
  title: string;
  priority: string;
  status: string;
  createdAt: Date;
};

type AppShellProps = {
  family: FamilyMember[];
  patient: Patient;
  actionItems: ActionItem[];
  callsThisWeek: number;
  itemsPending: number;
  dayStreak: number;
  onToggleItem: (id: string) => void;
  children: React.ReactNode;
};

export function AppShell({
  family,
  patient,
  actionItems,
  callsThisWeek,
  itemsPending,
  dayStreak,
  onToggleItem,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-bg-white shadow-md items-center justify-center text-xl text-text hidden max-md:flex cursor-pointer"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      <Sidebar
        family={family}
        callsThisWeek={callsThisWeek}
        itemsPending={itemsPending}
        dayStreak={dayStreak}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 ml-60 mr-[340px] p-8 px-9 min-h-screen max-lg:mr-0 max-md:ml-0 max-md:p-5 max-md:px-4">
        {children}
      </main>

      <RightPanel
        patient={patient}
        actionItems={actionItems}
        onToggleItem={onToggleItem}
      />
    </div>
  );
}
