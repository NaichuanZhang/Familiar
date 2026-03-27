import { getGreeting } from "@/lib/utils";

type GreetingBannerProps = {
  userName: string;
  patientNickname: string;
  callsToday: number;
  pendingItems: number;
};

export function GreetingBanner({
  userName,
  patientNickname,
  callsToday,
  pendingItems,
}: GreetingBannerProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mb-8 p-7 px-8 rounded-3xl relative overflow-hidden bg-gradient-to-br from-primary-subtle via-[#FBE8D8] to-bg-alt">
      <div className="absolute -top-8 -right-5 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(212,113,78,0.12)_0%,transparent_70%)]" />
      <div className="relative">
        <div className="text-xs text-text-muted font-medium mb-1">
          {dateStr}
        </div>
        <h1 className="font-display text-[28px] font-bold text-text mb-1.5">
          {getGreeting()}, {userName.split(" ")[0]}
        </h1>
        <p className="text-sm text-text-secondary">
          {patientNickname} has{" "}
          <strong>{callsToday} call{callsToday !== 1 ? "s" : ""}</strong>{" "}
          scheduled today and{" "}
          <strong>
            {pendingItems} action item{pendingItems !== 1 ? "s" : ""}
          </strong>{" "}
          pending
        </p>
      </div>
    </div>
  );
}
