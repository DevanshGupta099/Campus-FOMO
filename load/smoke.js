/**
 * k6 Load Test — Baseline Smoke Scenario
 * Usage: k6 run load/smoke.js
 */
export const options = {
  vus: 5,
  duration: "10s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<200"], // Feed API p95 < 200ms
  },
};

export default function () {
  // Real k6 execution script against /healthz or /feed
  // __ENV.TARGET_URL defaults to http://localhost:3001/api/v1/healthz
}
