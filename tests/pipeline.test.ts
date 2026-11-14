import { describe, it, expect } from "vitest";
import { HealthResponseSchema } from "../backend/src/contracts/schemas/health.js";
import { healthService } from "../backend/src/modules/health/service.js";

describe("End-to-End Pipeline Sanity Test", () => {
  it("validates health module output against the contract schema", () => {
    const health = healthService.getHealth();
    const validated = HealthResponseSchema.parse(health);

    expect(validated.status).toBe("ok");
    expect(validated.version).toBeDefined();
  });
});
