export const ALL_PERMISSIONS = [
  // Event lifecycle
  "event:read:public",
  "event:read:any",
  "event:create",
  "event:update:own",
  "event:submit:own",
  "event:cancel:own",
  "event:cancel:any",
  "event:approve:dept",
  "event:approve:budget",
  "event:reject",

  // Proposals
  "proposal:read:own",
  "proposal:read:dept",
  "proposal:read:any",

  // Venues & Resources
  "venue:request",
  "venue:manage",
  "resource:request",

  // Registrations & Attendees
  "registration:create",
  "registration:cancel:own",
  "registration:read:own",
  "registration:manage:own-event",
  "registration:export:own-event",

  // Check-in & Volunteers
  "checkin:scan:own-event",
  "checkin:manage:own-event",
  "volunteer:assign:own-event",
  "broadcast:send:own-event",

  // Budgets & Reports
  "budget:read:own-event",
  "budget:submit-receipt:own-event",
  "budget:approve",
  "report:submit:own-event",

  // Analytics
  "analytics:view:own-event",
  "analytics:view:campus",

  // Gallery
  "gallery:read",
  "gallery:manage",

  // Sponsors
  "sponsor:profile:manage:own",
  "sponsor:campaign:manage:own",
  "sponsor:analytics:view:own",

  // Lucky Draw
  "luckydraw:enter",
  "luckydraw:run",
  "luckydraw:audit",

  // Notifications & Gamification
  "notification:read:own",
  "gamification:read:own",

  // System Administration
  "rbac:manage",
  "user:manage",
  "audit:read",
  "ops:view",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export interface ScopeContext {
  userId?: string;
  department?: string;
  eventOwnerId?: string;
  eventDept?: string;
}

export function checkPermission(
  userPermissions: string[],
  requiredPermission: string,
  ctx?: ScopeContext,
): boolean {
  if (
    userPermissions.includes("admin:*") ||
    userPermissions.includes("rbac:manage")
  ) {
    return true;
  }

  if (userPermissions.includes(requiredPermission)) {
    // If permission has scope, check resource context
    if (requiredPermission.endsWith(":own") && ctx) {
      return ctx.userId === ctx.eventOwnerId;
    }
    if (requiredPermission.endsWith(":own-event") && ctx) {
      return ctx.userId === ctx.eventOwnerId;
    }
    if (requiredPermission.endsWith(":dept") && ctx) {
      return ctx.department === ctx.eventDept;
    }
    return true;
  }

  // Check wildcard or broad scope fallback
  const base = requiredPermission.substring(
    0,
    requiredPermission.lastIndexOf(":"),
  );
  if (base && userPermissions.includes(`${base}:any`)) {
    return true;
  }

  return false;
}
