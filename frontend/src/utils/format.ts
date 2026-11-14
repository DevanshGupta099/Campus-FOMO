const IST_DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const IST_TIME_FMT = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const IST_SHORT_FMT = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function formatIstDate(iso?: string): string {
  if (!iso) return "TBA";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBA";
  return IST_DATE_FMT.format(d);
}

export function formatIstTime(iso?: string): string {
  if (!iso) return "--:--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${IST_TIME_FMT.format(d).toUpperCase()} IST`;
}

export function formatIstDateTime(iso?: string): string {
  if (!iso) return "TBA";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBA";
  return `${IST_SHORT_FMT.format(d)} IST`;
}

export function formatInr(amount?: number): string {
  if (!amount || amount <= 0) return "Complimentary";
  return `INR ${amount.toLocaleString("en-IN")}`;
}

export function formatInrAmount(amount?: number): string {
  return `INR ${(amount ?? 0).toLocaleString("en-IN")}`;
}

export function computeSeatState(evt: {
  capacity: number;
  confirmedCount: number;
  waitlistCap: number;
  waitlistCount: number;
}) {
  const remaining = Math.max(0, evt.capacity - evt.confirmedCount);
  const waitlistRemaining = Math.max(0, evt.waitlistCap - evt.waitlistCount);
  const fillPercent =
    evt.capacity > 0
      ? Math.min(100, Math.round((evt.confirmedCount / evt.capacity) * 100))
      : 100;

  if (remaining > 0) {
    return {
      state: remaining <= 3 ? ("CRITICAL" as const) : ("AVAILABLE" as const),
      label:
        remaining === 1
          ? "Last 1 seat remaining"
          : `${remaining} of ${evt.capacity} seats open`,
      remaining,
      waitlistRemaining,
      fillPercent,
    };
  }

  if (waitlistRemaining > 0) {
    return {
      state: "WAITLIST" as const,
      label: `Waitlist active (${evt.waitlistCount}/${evt.waitlistCap} queued)`,
      remaining: 0,
      waitlistRemaining,
      fillPercent: 100,
    };
  }

  return {
    state: "FULL" as const,
    label: "Capacity & waitlist full",
    remaining: 0,
    waitlistRemaining: 0,
    fillPercent: 100,
  };
}

export function downloadIcsInvite(evt: {
  id: string;
  title: string;
  description: string;
  venueName: string;
  startsAt: string;
  endsAt: string;
}) {
  const toIcsStamp = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CHRIST University Central Campus//Concourse//EN",
    "BEGIN:VEVENT",
    `UID:${evt.id}@christuniversity.in`,
    `DTSTAMP:${toIcsStamp(new Date().toISOString())}`,
    `DTSTART:${toIcsStamp(evt.startsAt)}`,
    `DTEND:${toIcsStamp(evt.endsAt)}`,
    `SUMMARY:${evt.title.replace(/,/g, "\\,")}`,
    `LOCATION:${evt.venueName.replace(/,/g, "\\,")} - CHRIST Central Campus, Bengaluru`,
    `DESCRIPTION:${evt.description.replace(/\n/g, " ").slice(0, 240)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${evt.id}-christ-central.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
