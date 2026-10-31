import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { checkPermission, ALL_PERMISSIONS } from "./permissions.js";
import { PERSONA_ROLE_BUNDLES } from "./roles.js";
import { getAuthorizedScreens, SCREEN_CATALOG } from "./screens.js";
import { buildApp } from "../app.js";

describe("PBAC Access Control Engine", () => {
  describe("checkPermission Scope Resolution", () => {
    it("evaluates exact match permissions", () => {
      expect(
        checkPermission(["event:create", "event:read:public"], "event:create"),
      ).toBe(true);
      expect(checkPermission(["event:read:public"], "event:create")).toBe(
        false,
      );
    });

    it("evaluates :own scope context", () => {
      const userPerms = ["event:update:own"];
      expect(
        checkPermission(userPerms, "event:update:own", {
          userId: "user-1",
          eventOwnerId: "user-1",
        }),
      ).toBe(true);
      expect(
        checkPermission(userPerms, "event:update:own", {
          userId: "user-1",
          eventOwnerId: "user-2",
        }),
      ).toBe(false);
    });

    it("evaluates :own-event scope context", () => {
      const userPerms = ["checkin:scan:own-event"];
      expect(
        checkPermission(userPerms, "checkin:scan:own-event", {
          userId: "head-1",
          eventOwnerId: "head-1",
        }),
      ).toBe(true);
      expect(
        checkPermission(userPerms, "checkin:scan:own-event", {
          userId: "head-1",
          eventOwnerId: "head-2",
        }),
      ).toBe(false);
    });

    it("evaluates :dept scope context", () => {
      const userPerms = ["event:approve:dept"];
      expect(
        checkPermission(userPerms, "event:approve:dept", {
          department: "Computer Science",
          eventDept: "Computer Science",
        }),
      ).toBe(true);
      expect(
        checkPermission(userPerms, "event:approve:dept", {
          department: "Computer Science",
          eventDept: "Commerce",
        }),
      ).toBe(false);
    });

    it("allows :any wildcard fallback over scoped permissions", () => {
      const adminPerms = ["event:read:any"];
      expect(checkPermission(adminPerms, "event:read:public")).toBe(true);
    });

    it("grants admin full access", () => {
      expect(checkPermission(["admin:*"], "any:arbitrary:permission")).toBe(
        true,
      );
      expect(checkPermission(["rbac:manage"], "budget:approve")).toBe(true);
    });
  });

  describe("Screen Catalog Authorization", () => {
    it("returns only public/guest screens for GUEST persona", () => {
      const guestScreens = getAuthorizedScreens(PERSONA_ROLE_BUNDLES.GUEST);
      const keys = guestScreens.map((s) => s.key);
      expect(keys).toContain("feed");
      expect(keys).toContain("gallery");
      expect(keys).toContain("my-tickets");
      expect(keys).not.toContain("faculty-approvals");
      expect(keys).not.toContain("dean-governance");
      expect(keys).not.toContain("admin-rbac");
    });

    it("returns faculty approvals screen only for FACULTY and ADMIN", () => {
      const facultyScreens = getAuthorizedScreens(PERSONA_ROLE_BUNDLES.FACULTY);
      expect(facultyScreens.some((s) => s.key === "faculty-approvals")).toBe(
        true,
      );
      expect(facultyScreens.some((s) => s.key === "admin-rbac")).toBe(false);

      const studentScreens = getAuthorizedScreens(PERSONA_ROLE_BUNDLES.STUDENT);
      expect(studentScreens.some((s) => s.key === "faculty-approvals")).toBe(
        false,
      );
    });

    it("returns dean governance screen for DEAN", () => {
      const deanScreens = getAuthorizedScreens(PERSONA_ROLE_BUNDLES.DEAN);
      expect(deanScreens.some((s) => s.key === "dean-governance")).toBe(true);
      expect(deanScreens.some((s) => s.key === "event-head-dashboard")).toBe(
        false,
      );
    });

    it("returns all screens for ADMIN", () => {
      const adminScreens = getAuthorizedScreens(PERSONA_ROLE_BUNDLES.ADMIN);
      expect(adminScreens.length).toBe(SCREEN_CATALOG.length);
    });
  });

  describe("Zero-Trust Route Auth & Middleware Integration", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
      app = await buildApp();
      await app.ready();
    });

    afterAll(async () => {
      await app.close();
    });

    it("allows public access to /api/v1/healthz", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/healthz" });
      expect(res.statusCode).toBe(200);
    });

    it("rejects unauthenticated request to /api/v1/me with 401", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/me" });
      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.payload);
      expect(body.code).toBe("UNAUTHENTICATED");
    });

    it("returns authenticated profile and permissions with test token", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/me",
        headers: {
          authorization:
            "Bearer test-token:STUDENT:01927500-0001:Computer Science",
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.role).toBe("STUDENT");
      expect(body.permissions).toContain("luckydraw:enter");
      expect(body.department).toBe("Computer Science");
    });

    it("returns dynamic navigation screens tailored to student permissions", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/me/navigation",
        headers: { authorization: "Bearer test-token:STUDENT" },
      });

      expect(res.statusCode).toBe(200);
      const screens = JSON.parse(res.payload);
      const keys = screens.map((s: any) => s.key);
      expect(keys).toContain("feed");
      expect(keys).not.toContain("admin-rbac");
    });

    it("blocks STUDENT from accessing /api/v1/admin/rbac/roles with 403 Forbidden", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/admin/rbac/roles",
        headers: { authorization: "Bearer test-token:STUDENT" },
      });

      expect(res.statusCode).toBe(403);
      const body = JSON.parse(res.payload);
      expect(body.code).toBe("FORBIDDEN_INSUFFICIENT_PERMISSION");
    });

    it("permits ADMIN to access /api/v1/admin/rbac/roles with 200 OK", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/admin/rbac/roles",
        headers: { authorization: "Bearer test-token:ADMIN" },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.availablePermissions.length).toBe(ALL_PERMISSIONS.length);
      expect(body.roles.ADMIN).toBeDefined();
    });

    it("fails boot when a route lacks explicit config.auth declaration", async () => {
      const testApp = Fastify();
      const { authPlugin } = await import("../auth/middleware.js");
      await testApp.register(authPlugin);

      // Registering route without config.auth must throw
      expect(() => {
        testApp.get("/unprotected-test", async () => ({ ok: true }));
      }).toThrow(
        /Route GET \/unprotected-test lacks explicit config\.auth declaration/,
      );
    });
  });
});
