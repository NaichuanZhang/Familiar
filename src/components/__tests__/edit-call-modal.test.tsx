import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditCallModal } from "@/components/dashboard/edit-call-modal";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const mockSchedule = {
  id: "sched-001",
  title: "Morning Medicine Reminder",
  callType: "medicine",
  purpose: "Remind to take blood pressure medication",
  cadence: "daily",
  scheduledTime: "09:00",
  assignedUserId: "user-001",
  isActive: true,
};

const mockUsers = [
  { id: "user-001", name: "Sarah Chen" },
  { id: "user-002", name: "David Chen" },
];

describe("EditCallModal", () => {
  it("renders with pre-populated schedule data", () => {
    render(
      <EditCallModal
        open={true}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        schedule={mockSchedule}
        users={mockUsers}
      />,
    );

    expect(screen.getByText("Edit Call Task")).toBeDefined();
    expect(screen.getByDisplayValue("Morning Medicine Reminder")).toBeDefined();
    expect(
      screen.getByDisplayValue("Remind to take blood pressure medication"),
    ).toBeDefined();
    expect(screen.getByDisplayValue("09:00")).toBeDefined();
  });

  it("renders Save Changes and Delete buttons", () => {
    render(
      <EditCallModal
        open={true}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        schedule={mockSchedule}
        users={mockUsers}
      />,
    );

    expect(screen.getByText("Save Changes")).toBeDefined();
    expect(screen.getByText("Delete")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("is hidden when closed (pointer-events-none)", () => {
    const { container } = render(
      <EditCallModal
        open={false}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        schedule={mockSchedule}
        users={mockUsers}
      />,
    );

    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain("pointer-events-none");
  });

  it("renders user options in assigned dropdown", () => {
    render(
      <EditCallModal
        open={true}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        schedule={mockSchedule}
        users={mockUsers}
      />,
    );

    expect(screen.getByText("Sarah Chen")).toBeDefined();
    expect(screen.getByText("David Chen")).toBeDefined();
  });
});
