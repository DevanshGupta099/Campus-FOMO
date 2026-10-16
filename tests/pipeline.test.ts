import { describe, it, expect } from "vitest";
import { HealthResponseSchema } from "@campus-fomo/contracts";
import { healthService } from "../apps/api/src/modules/health/index.js";

describe("End-to-End Pipeline Sanity Test", () => {
  it("validates health module output against the contract schema", () => {
    const health = healthService.getHealth();
    const validated = HealthResponseSchema.parse(health);

    expect(validated.status).toBe("ok");
    expect(validated.version).toBeDefined();
  });
});
