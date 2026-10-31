export interface ScreenDefinition {
  key: string;
  path: string;
  title: string;
  section: "events" | "management" | "approvals" | "sponsors" | "admin";
  icon: string;
  requiredPermissions: string[];
  matchMode: "any" | "all";
}

export const SCREEN_CATALOG: ScreenDefinition[] = [
  {
    key: "feed",
    path: "/",
    title: "Discover Events",
    section: "events",
    icon: "compass",
    requiredPermissions: ["event:read:public"],
    matchMode: "any",
  },
  {
    key: "my-tickets",
    path: "/my-tickets",
    title: "My Passes & Tickets",
    section: "events",
    icon: "ticket",
    requiredPermissions: ["registration:read:own"],
    matchMode: "any",
  },
  {
    key: "gallery",
    path: "/gallery",
    title: "Campus Fest Gallery",
    section: "events",
    icon: "image",
    requiredPermissions: ["gallery:read"],
    matchMode: "any",
  },
  {
    key: "lucky-draw",
    path: "/lucky-draw",
    title: "Fest Lucky Draws",
    section: "events",
    icon: "gift",
    requiredPermissions: [
      "luckydraw:enter",
      "luckydraw:run",
      "luckydraw:audit",
    ],
    matchMode: "any",
  },
  {
    key: "event-head-dashboard",
    path: "/manage-events",
    title: "Event Operations",
    section: "management",
    icon: "calendar-cog",
    requiredPermissions: [
      "event:create",
      "event:update:own",
      "event:submit:own",
    ],
    matchMode: "any",
  },
  {
    key: "door-scanner",
    path: "/scanner",
    title: "Ticket Scanner",
    section: "management",
    icon: "qr-code",
    requiredPermissions: ["checkin:scan:own-event"],
    matchMode: "any",
  },
  {
    key: "faculty-approvals",
    path: "/approvals/department",
    title: "Faculty Endorsements",
    section: "approvals",
    icon: "check-circle-2",
    requiredPermissions: ["event:approve:dept"],
    matchMode: "any",
  },
  {
    key: "dean-governance",
    path: "/approvals/executive",
    title: "Deanery Approvals",
    section: "approvals",
    icon: "shield-check",
    requiredPermissions: ["event:approve:budget"],
    matchMode: "any",
  },
  {
    key: "sponsor-portal",
    path: "/sponsor",
    title: "Sponsor Brand Hub",
    section: "sponsors",
    icon: "coffee",
    requiredPermissions: ["sponsor:profile:manage:own"],
    matchMode: "any",
  },
  {
    key: "admin-rbac",
    path: "/admin/rbac",
    title: "Access & Roles (PBAC)",
    section: "admin",
    icon: "shield-alert",
    requiredPermissions: ["rbac:manage"],
    matchMode: "any",
  },
  {
    key: "admin-audit",
    path: "/admin/audit",
    title: "Security Audit Logs",
    section: "admin",
    icon: "file-lock-2",
    requiredPermissions: ["audit:read"],
    matchMode: "any",
  },
];

export function getAuthorizedScreens(
  userPermissions: string[],
): ScreenDefinition[] {
  if (
    userPermissions.includes("admin:*") ||
    userPermissions.includes("rbac:manage")
  ) {
    return SCREEN_CATALOG;
  }

  return SCREEN_CATALOG.filter((screen) => {
    if (screen.matchMode === "all") {
      return screen.requiredPermissions.every((p) =>
        userPermissions.includes(p),
      );
    }
    return screen.requiredPermissions.some((p) => userPermissions.includes(p));
  });
}
