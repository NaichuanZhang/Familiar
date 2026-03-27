"use client";

import { LayoutGrid, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type FamilyMember = {
  name: string;
  displayColor: string;
};

type SidebarProps = {
  family: FamilyMember[];
  callsThisWeek: number;
  itemsPending: number;
  dayStreak: number;
  open: boolean;
  onClose: () => void;
};

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, href: "/" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar({
  family,
  callsThisWeek,
  itemsPending,
  dayStreak,
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "w-60 bg-bg-warm border-r border-border-light p-7 px-5 flex flex-col fixed top-0 left-0 bottom-0 z-50 transition-transform duration-400",
          "max-md:-translate-x-full max-md:shadow-lg",
          open && "max-md:translate-x-0",
        )}
      >
        <div className="font-display italic font-medium text-2xl text-primary mb-1.5 -tracking-wide">
          Familiar
        </div>
        <div className="text-[11px] text-text-muted font-medium tracking-widest uppercase mb-9">
          Care, connected
        </div>

        <ul className="list-none mb-9">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium cursor-pointer transition-all duration-250 mb-0.5",
                    isActive
                      ? "bg-primary-subtle text-primary-dark font-semibold"
                      : "text-text-secondary hover:bg-primary/6 hover:text-text",
                  )}
                >
                  <item.icon
                    size={18}
                    className={cn(
                      "shrink-0",
                      isActive ? "opacity-100" : "opacity-70",
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto pt-5 border-t border-border-light">
          <div className="flex justify-between items-center py-1.5 text-[12.5px] text-text-secondary">
            <span>Calls this week</span>
            <span className="font-bold text-sm text-text">{callsThisWeek}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 text-[12.5px] text-text-secondary">
            <span>Items pending</span>
            <span className="font-bold text-sm text-text">{itemsPending}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 text-[12.5px] text-text-secondary">
            <span>Day streak</span>
            <span className="font-bold text-sm text-primary">{dayStreak}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
