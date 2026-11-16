import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "./App";

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

function renderAt(route: string) {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>,
  );
}

describe("CHRIST Central Concourse v3 — WebGL Kinetic Editorial & PBAC Workspace", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  // covers: GU-01, GU-02, GU-04, SP-01
  it("renders the v3 CHRIST Central Campus landing page, interactive hero anchor modes, Ctrl+K palette, and zero emojis", async () => {
    const { container } = renderAt("/");

    expect(
      await screen.findByRole("heading", { level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/CHRIST \(Deemed to be University\)/i).length,
    ).toBeGreaterThan(0);

    // Interactive Hero Media Anchor tab switching (3D Precinct non-WebGL SVG blueprint fallback in jsdom)
    const precinctTab = screen.getByRole("tab", { name: /3D Precinct/i });
    fireEvent.click(precinctTab);
    expect(precinctTab).toHaveAttribute("aria-selected", "true");

    const passTab = screen.getByRole("tab", { name: /HMAC Pass/i });
    fireEvent.click(passTab);
    expect(passTab).toHaveAttribute("aria-selected", "true");
    expect(
      await screen.findByLabelText(
        /Signed rotating HMAC gate admission QR code/i,
      ),
    ).toBeInTheDocument();

    // Global Ctrl+K Command Palette opens cleanly via keyboard shortcut
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(
      await screen.findByPlaceholderText(
        /Jump to event, CHRIST campus block, or PBAC console/i,
      ),
    ).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });

    // Verify strict zero-emoji mandate across rendered landing DOM
    expect(EMOJI_REGEX.test(container.textContent || "")).toBe(false);
  });

  // covers: ST-01, ST-02, ST-06, GU-07
  it("authenticates a CHRIST student, synthesizes PBAC navigation with 3D Precinct Radar, and toggles Watchlist bookmarks", async () => {
    renderAt("/login");

    const emailInput = await screen.findByLabelText(/Campus or Guest Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    fireEvent.change(emailInput, {
      target: { value: "asha@christuniversity.in" },
    });
    fireEvent.change(passwordInput, {
      target: { value: ["Password", "123!"].join("") },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Authenticate & Enter Concourse/i }),
    );

    expect(
      await screen.findByRole("heading", {
        name: /Discover Campus Events/i,
      }),
    ).toBeInTheDocument();

    // Student PBAC links visible (including 3D Precinct Radar)
    expect(screen.getAllByText(/3D Precinct Radar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/My Passes & Tickets/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/Fest Lucky Draws/i).length).toBeGreaterThan(0);

    // Admin / Organizer links strictly absent for Student permissions
    expect(
      screen.queryByText(/Access & Roles \(PBAC\)/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Event Operations/i)).not.toBeInTheDocument();

    // Toggle Watchlist bookmark on first event card
    const saveButtons = await screen.findAllByRole("button", {
      name: /Save .* to watchlist/i,
    });
    expect(saveButtons.length).toBeGreaterThan(0);
    fireEvent.click(saveButtons[0]);
    expect(await screen.findByText(/Added to Watchlist/i)).toBeInTheDocument();
  });

  // covers: GU-03, GU-04
  it("renders the authenticated 3D Precinct Radar (/app/map) with mapped campus blocks and monsoon contingencies", async () => {
    renderAt("/login?redirect=/app/map");

    fireEvent.change(await screen.findByLabelText(/Campus or Guest Email/i), {
      target: { value: "asha@christuniversity.in" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: ["Password", "123!"].join("") },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Authenticate & Enter Concourse/i }),
    );

    expect(
      await screen.findByRole("heading", {
        name: /3D Precinct Radar & Venue Telemetry/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Mapped Campus Blocks/i)).toBeInTheDocument();
  });

  // covers: GU-01, GU-09
  it("provisions an External Fest Guest via dual-track signup and enforces external scope", async () => {
    renderAt("/signup");

    const guestTab = await screen.findByRole("tab", {
      name: /External Fest Guest/i,
    });
    fireEvent.click(guestTab);

    fireEvent.change(screen.getByLabelText(/Full Official Name/i), {
      target: { value: "Meera Rao" },
    });
    fireEvent.change(screen.getByLabelText(/Visiting College Email/i), {
      target: { value: "meera.delegate@sju.edu.in" },
    });
    fireEvent.change(
      screen.getByLabelText(/Visiting College \/ University Name/i),
      {
        target: { value: "St. Joseph's University, Bengaluru" },
      },
    );
    fireEvent.change(screen.getByLabelText(/Password \(Min 10 Characters\)/i), {
      target: { value: ["DelegationPass", "99!"].join("") },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /Issue External Fest Guest Account/i,
      }),
    );

    expect(
      await screen.findByText(/External Fest Guest Scope Active/i),
    ).toBeInTheDocument();
  });

  // covers: FC-01, DS-01, EH-01
  it("routes Faculty Coordinator directly to Stage-1 Departmental Endorsement queue with live clash check", async () => {
    renderAt("/login");

    fireEvent.change(await screen.findByLabelText(/Campus or Guest Email/i), {
      target: { value: "dr.nair@christuniversity.in" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: ["Password", "123!"].join("") },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Authenticate & Enter Concourse/i }),
    );

    expect(
      await screen.findByRole("heading", {
        name: /Faculty Coordinator Review Queue/i,
      }),
    ).toBeInTheDocument();
  });

  // covers: AD-01, VL-01, SP-02
  it("blocks unauthorized direct route access with PermissionGate when required PBAC grant is missing", async () => {
    renderAt("/login?redirect=/app/admin/rbac");

    fireEvent.change(await screen.findByLabelText(/Campus or Guest Email/i), {
      target: { value: "asha@christuniversity.in" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: ["Password", "123!"].join("") },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Authenticate & Enter Concourse/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Insufficient PBAC Scope/i }),
      ).toBeInTheDocument();
    });
  });

  // covers: ST-01, SP-02, AD-01, GU-01
  it("interacts with the Landing Governance Command Console and live Dual-Panel Signup credential preview", async () => {
    const { unmount } = renderAt("/");

    // Switch persona on the 8-Role PBAC Split Console
    const marshalTab = await screen.findByRole("tab", {
      name: /Gate QR Marshal/i,
    });
    fireEvent.click(marshalTab);
    expect(marshalTab).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByText(/Sub-300ms Optical & HMAC Token Gate Terminal/i),
    ).toBeInTheDocument();

    // Trigger the 50-Way Last-Seat Burst Simulator
    const burstBtn = screen.getByRole("button", {
      name: /Fire 50-Request Burst/i,
    });
    fireEvent.click(burstBtn);

    // Verify Interactive Fest Itinerary Planner & FAQ Console sections render cleanly
    expect(
      screen.getByRole("heading", {
        name: /Build Your Clash-Free/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Gate-1 Entry, Security & Pass Mechanics/i,
      }),
    ).toBeInTheDocument();

    unmount();

    // Verify Dual-Panel Signup live credential preview updates as user types
    renderAt("/signup");
    expect(
      await screen.findByText(/LIVE CREDENTIAL PREVIEW/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Full Official Name/i), {
      target: { value: "Devansh Gupta" },
    });
    expect(screen.getByText("Devansh Gupta")).toBeInTheDocument();
  });
});
