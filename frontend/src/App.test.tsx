import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { App } from "./App.js";

describe("Web App Contract Integration", () => {
  it("renders application headline and verifies pipeline health contract in mock mode", async () => {
    render(<App />);

    expect(screen.getByText(/CAMPUS/i)).toBeDefined();
    expect(screen.getByText(/FOMO/i)).toBeDefined();

    // Health contract resolves via client in mock mode
    await waitFor(() => {
      expect(screen.getByText("GET /healthz")).toBeDefined();
      expect(screen.getByText("ok")).toBeDefined();
    });
  });
});
