import type { HealthResponse, ReadyResponse } from "@campus-fomo/contracts";

export class HealthService {
  private startTime = Date.now();

  getHealth(): HealthResponse {
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "0.1.0",
      uptime: Math.round(uptimeSeconds * 100) / 100,
    };
  }

  getReadiness(): ReadyResponse {
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: {
        database: "up",
        redis: "up",
      },
    };
  }
}

export const healthService = new HealthService();
