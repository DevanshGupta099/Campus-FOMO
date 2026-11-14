import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import {
  AuthProvider,
  resolveDefaultWorkspacePath,
  useAuth,
} from "./auth/AuthContext";
import { CommandPalette } from "./components/CommandPalette";
import { WorkspaceShell } from "./components/WorkspaceShell";
import { LandingPage } from "./pages/LandingPage";

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
  import("./pages/SignupPage").then((m) => ({ default: m.SignupPage })),
);
const DiscoverView = lazy(() =>
  import("./pages/workspace/DiscoverView").then((m) => ({
    default: m.DiscoverView,
  })),
);
const CampusMapView = lazy(() =>
  import("./pages/workspace/CampusMapView").then((m) => ({
    default: m.CampusMapView,
  })),
);
const MyTicketsView = lazy(() =>
  import("./pages/workspace/MyTicketsView").then((m) => ({
    default: m.MyTicketsView,
  })),
);
const LuckyDrawView = lazy(() =>
  import("./pages/workspace/LuckyDrawView").then((m) => ({
    default: m.LuckyDrawView,
  })),
);
const GalleryView = lazy(() =>
  import("./pages/workspace/GalleryView").then((m) => ({
    default: m.GalleryView,
  })),
);
const EventOpsView = lazy(() =>
  import("./pages/workspace/EventOpsView").then((m) => ({
    default: m.EventOpsView,
  })),
);
const ScannerView = lazy(() =>
  import("./pages/workspace/ScannerView").then((m) => ({
    default: m.ScannerView,
  })),
);
const ApprovalsView = lazy(() =>
  import("./pages/workspace/ApprovalsView").then((m) => ({
    default: m.ApprovalsView,
  })),
);
const SponsorView = lazy(() =>
  import("./pages/workspace/SponsorView").then((m) => ({
    default: m.SponsorView,
  })),
);
const AdminRbacView = lazy(() =>
  import("./pages/workspace/AdminRbacView").then((m) => ({
    default: m.AdminRbacView,
  })),
);
const AuditLogsView = lazy(() =>
  import("./pages/workspace/AuditLogsView").then((m) => ({
    default: m.AuditLogsView,
  })),
);

const RouteLoadingFallback: React.FC = () => (
  <div className="flex min-h-[40vh] items-center justify-center bg-void font-mono text-xs uppercase tracking-widest text-silver">
    Loading Concourse Surface...
  </div>
);

const RouteTitleSync: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const map: Record<string, string> = {
      "/": "CONCOURSE // CHRIST University Central Campus Event OS",
      "/login": "Sign In · CONCOURSE // CHRIST Central Campus",
      "/signup": "Dual-Track Enrollment · CONCOURSE // CHRIST Central Campus",
      "/app/discover": "Discover Events · CONCOURSE Workspace",
      "/app/map": "3D Precinct Radar · CONCOURSE Workspace",
      "/app/my-tickets": "My Passes & Tickets · CONCOURSE Workspace",
      "/app/gallery": "Fest Media Archive · CONCOURSE Workspace",
      "/app/lucky-draw": "Commit-Reveal Lucky Draws · CONCOURSE Workspace",
      "/app/manage-events": "Event Operations Studio · CONCOURSE Workspace",
      "/app/scanner": "Gate HMAC Scanner · CONCOURSE Workspace",
      "/app/approvals/department":
        "Department Endorsements · CONCOURSE Workspace",
      "/app/approvals/executive": "Executive Sanctions · CONCOURSE Workspace",
      "/app/sponsor": "Partner Showcase · CONCOURSE Workspace",
      "/app/admin/rbac": "PBAC Governance Matrix · CONCOURSE Workspace",
      "/app/admin/audit": "Security Audit Ledger · CONCOURSE Workspace",
    };
    document.title =
      map[pathname] || "CONCOURSE // CHRIST University Central Campus Event OS";
  }, [pathname]);

  return null;
};

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isHydrating } = useAuth();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper font-mono text-xs uppercase tracking-widest text-ink-secondary">
        Hydrating PBAC Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
};

const PermissionGate: React.FC<{
  anyOf: string[];
  children: React.ReactNode;
}> = ({ anyOf, children }) => {
  const { hasAnyPerm } = useAuth();
  if (!hasAnyPerm(anyOf)) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-lg rounded-xl border border-vermilion/45 bg-paper-elevated p-8 text-center shadow-editorial"
      >
        <Lock className="mx-auto h-8 w-8 text-vermilion" />
        <h2 className="mt-3 font-display text-2xl font-bold text-bone">
          Insufficient PBAC Scope
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
          This surface requires one of the following signed permission grants:{" "}
          <code className="font-mono text-bone">{anyOf.join(", ")}</code>.
        </p>
      </div>
    );
  }
  return <>{children}</>;
};

const WorkspaceIndexRedirect: React.FC = () => {
  const { user } = useAuth();
  return (
    <Navigate
      to={resolveDefaultWorkspacePath(user?.permissions || [])}
      replace
    />
  );
};

export const AppRoutes: React.FC = () => (
  <Suspense fallback={<RouteLoadingFallback />}>
    <Routes>
      {/* Public Editorial Surfaces */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* PBAC Role-Adaptive Workspace */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <WorkspaceShell />
          </RequireAuth>
        }
      >
        <Route index element={<WorkspaceIndexRedirect />} />
        <Route
          path="discover"
          element={
            <PermissionGate anyOf={["event:read:public"]}>
              <DiscoverView />
            </PermissionGate>
          }
        />
        <Route
          path="map"
          element={
            <PermissionGate anyOf={["event:read:public"]}>
              <CampusMapView />
            </PermissionGate>
          }
        />
        <Route
          path="my-tickets"
          element={
            <PermissionGate anyOf={["registration:read:own"]}>
              <MyTicketsView />
            </PermissionGate>
          }
        />
        <Route
          path="gallery"
          element={
            <PermissionGate anyOf={["gallery:read"]}>
              <GalleryView />
            </PermissionGate>
          }
        />
        <Route
          path="lucky-draw"
          element={
            <PermissionGate
              anyOf={["luckydraw:enter", "luckydraw:run", "luckydraw:audit"]}
            >
              <LuckyDrawView />
            </PermissionGate>
          }
        />
        <Route
          path="manage-events"
          element={
            <PermissionGate
              anyOf={["event:create", "event:update:own", "event:submit:own"]}
            >
              <EventOpsView />
            </PermissionGate>
          }
        />
        <Route
          path="scanner"
          element={
            <PermissionGate anyOf={["checkin:scan:own-event"]}>
              <ScannerView />
            </PermissionGate>
          }
        />
        <Route
          path="approvals/department"
          element={
            <PermissionGate anyOf={["event:approve:dept"]}>
              <ApprovalsView stage="faculty" />
            </PermissionGate>
          }
        />
        <Route
          path="approvals/executive"
          element={
            <PermissionGate anyOf={["event:approve:budget"]}>
              <ApprovalsView stage="dean" />
            </PermissionGate>
          }
        />
        <Route
          path="sponsor"
          element={
            <PermissionGate anyOf={["sponsor:profile:manage:own"]}>
              <SponsorView />
            </PermissionGate>
          }
        />
        <Route
          path="admin/rbac"
          element={
            <PermissionGate anyOf={["rbac:manage"]}>
              <AdminRbacView />
            </PermissionGate>
          }
        />
        <Route
          path="admin/audit"
          element={
            <PermissionGate anyOf={["audit:read"]}>
              <AuditLogsView />
            </PermissionGate>
          }
        />
      </Route>

      {/* Direct Screen Path Aliases matching /api/v1/me/navigation */}
      <Route path="/map" element={<Navigate to="/app/map" replace />} />
      <Route
        path="/my-tickets"
        element={<Navigate to="/app/my-tickets" replace />}
      />
      <Route path="/gallery" element={<Navigate to="/app/gallery" replace />} />
      <Route
        path="/lucky-draw"
        element={<Navigate to="/app/lucky-draw" replace />}
      />
      <Route
        path="/manage-events"
        element={<Navigate to="/app/manage-events" replace />}
      />
      <Route path="/scanner" element={<Navigate to="/app/scanner" replace />} />
      <Route
        path="/approvals/department"
        element={<Navigate to="/app/approvals/department" replace />}
      />
      <Route
        path="/approvals/executive"
        element={<Navigate to="/app/approvals/executive" replace />}
      />
      <Route path="/sponsor" element={<Navigate to="/app/sponsor" replace />} />
      <Route
        path="/admin/rbac"
        element={<Navigate to="/app/admin/rbac" replace />}
      />
      <Route
        path="/admin/audit"
        element={<Navigate to="/app/admin/audit" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export const App: React.FC = () => (
  <AuthProvider>
    <RouteTitleSync />
    <CommandPalette />
    <AppRoutes />
  </AuthProvider>
);

export default App;
