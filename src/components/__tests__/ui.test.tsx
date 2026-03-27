import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GreetingBanner } from "@/components/dashboard/greeting-banner";

describe("Avatar", () => {
  it("renders initials from name", () => {
    render(<Avatar name="Sarah Chen" color="#D4714E" />);
    expect(screen.getByText("SC")).toBeDefined();
  });

  it("renders with correct size class", () => {
    const { container } = render(
      <Avatar name="David Chen" color="#7A9BB5" size="lg" />
    );
    expect(container.firstChild).toHaveClass("w-16");
  });
});

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge variant="completed">Completed</Badge>);
    expect(screen.getByText("Completed")).toBeDefined();
  });

  it("applies variant classes", () => {
    const { container } = render(<Badge variant="missed">Missed</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-gentle-red-subtle");
  });
});

describe("Button", () => {
  it("renders with primary variant by default", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByText("Click me");
    expect(btn.className).toContain("bg-primary");
  });

  it("renders secondary variant", () => {
    render(<Button variant="secondary">Cancel</Button>);
    const btn = screen.getByText("Cancel");
    expect(btn.className).toContain("border-border");
  });
});

describe("GreetingBanner", () => {
  it("renders user name and stats", () => {
    render(
      <GreetingBanner
        userName="Sarah Chen"
        patientNickname="Mom"
        callsToday={2}
        pendingItems={4}
      />
    );
    expect(screen.getByText(/Sarah/)).toBeDefined();
    expect(screen.getByText("2 calls")).toBeDefined();
    expect(screen.getByText("4 action items")).toBeDefined();
  });
});
