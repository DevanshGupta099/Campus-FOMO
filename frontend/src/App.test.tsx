import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { App } from "./App.js";

describe("Web App Contract Integration & Dynamic Navigation", () => {
  it("renders revamped 3D modern hero banner and persona selector in mock mode", async () => {
    // covers: ST-01, GU-01
    render(<App />);

    expect(screen.getAllByText(/CAMPUS/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/FOMO/i).length).toBeGreaterThan(0);

    // Renders the persona switcher trigger
    expect(screen.getByLabelText(/Switch Persona/i)).toBeDefined();

    // Waits for dynamic navigation and new hero headline to resolve
    await waitFor(() => {
      expect(screen.getByText(/Where Every Moment Counts/i)).toBeDefined();
      expect(screen.getByText(/The Campus After Dark/i)).toBeDefined();
      expect(screen.getByText(/Discover Events/i)).toBeDefined();
    });

    // Verifies footer health check and PBAC info
    await waitFor(() => {
      expect(screen.getByText(/API Health:/i)).toBeDefined();
      expect(screen.getByText(/Keycloak 26/i)).toBeDefined();
    });
  });

  it("renders new spatial campus map and social feed navigation items", async () => {
    // covers: ST-02, SP-01
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Campus Map/i)).toBeDefined();
      expect(screen.getByText(/Social Buzz/i)).toBeDefined();
    });
  });

  it("opens and closes gamification achievement modal on student persona", async () => {
    // covers: ST-03, XP-01
    render(<App />);

    await waitFor(() => {
      const xpButton = screen.getByTitle(/Your Fest XP & Badges/i);
      expect(xpButton).toBeDefined();
      fireEvent.click(xpButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Fest XP & Badges/i)).toBeDefined();
      expect(screen.getByText(/Festival Achievement Badges/i)).toBeDefined();
      expect(screen.getByText(/Fest Pioneer/i)).toBeDefined();
    });

    const closeButton = screen.getByLabelText(/Close Gamification Modal/i);
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Festival Achievement Badges/i)).toBeNull();
    });
  });
});
