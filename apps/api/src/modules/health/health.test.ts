import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../app.js";
import { HealthResponseSchema } from "@campus-fomo/contracts";
import type { FastifyInstance } from "fastify";

describe("Health Module Contract Verification", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/healthz returns 200 and conforms to HealthResponseSchema", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/healthz",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    const parsed = HealthResponseSchema.parse(body);

    expect(parsed.status).toBe("ok");
    expect(parsed.uptime).toBeGreaterThanOrEqual(0);
  });

  it("GET /api/v1/readyz returns 200 and status ready", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/readyz",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe("ready");
  });
});
