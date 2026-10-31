import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { App } from "./App.js";

describe("Web App Contract Integration & Dynamic Navigation", () => {
  it("renders application headline, navigation bar, and persona selector in mock mode", async () => {
    render(<App />);

    expect(screen.getAllByText(/CAMPUS/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/FOMO/i).length).toBeGreaterThan(0);

    // Renders the persona switcher
    expect(screen.getByLabelText(/Switch Persona/i)).toBeDefined();

    // Waits for dynamic navigation and hero banner to resolve
    await waitFor(() => {
      expect(screen.getByText(/The Campus After Dark/i)).toBeDefined();
      expect(screen.getByText(/Discover Events/i)).toBeDefined();
    });

    // Verifies footer health check
    await waitFor(() => {
      expect(screen.getByText(/API Health:/i)).toBeDefined();
    });
  });
});
