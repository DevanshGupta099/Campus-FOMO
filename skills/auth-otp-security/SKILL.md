---
name: campus-fomo-auth-otp-security
description: Use for signup, login, OTP (SMS/email), JWT, refresh rotation, RBAC, rate limiting, bot defence, SMS provider integration, and security review in Campus FOMO.
---

# Auth, OTP and security skill

## Tokens

- **Access JWT** (EdDSA or HS256 via `jose`), 15 min, claims: `sub, role, sid, iat, exp, aud, iss`; kept **in memory** on the client.
- **Refresh token:** opaque 256-bit random, stored hashed (SHA-256) in DB with `family_id`; sent as `HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth` cookie; 7 days sliding, 30 days absolute. **Rotate on every use; reuse of a used token revokes the whole family.** Concurrent refresh: first wins, second gets 401 `REFRESH_RACE` and the client retries once with the new cookie.
- Logout = revoke family; logout-all = revoke all families for user; role change or deactivation revokes all.
- Passwords: argon2id (≥ 19 MiB, t=2, p=1), min 10 chars, breached-password check via k-anonymity (HIBP range API, free) with timeout fallback allow. Generic errors ("invalid credentials"). Constant-time compares.
- CSRF: cookies only used on `/auth/*`; mutating auth routes require `X-Requested-With` + Origin check; state-changing API calls use Bearer header (not cookie) so CSRF-immune.

## OTP policy (config constants, all tested)

| Rule            | Value                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code            | 6 digits from CSPRNG, stored as HMAC-SHA256(code, serverSecret+challengeId); never plaintext                                                       |
| Expiry          | 5 minutes (email 10)                                                                                                                               |
| Verify attempts | 5 per challenge, then challenge dead + 15 min cooldown for that destination                                                                        |
| Resend cooldown | 30 s first, 60 s, 120 s (progressive); new code invalidates old                                                                                    |
| Resend cap      | 5 per destination per hour, 10 per day                                                                                                             |
| Request caps    | per IP 10/hour, per device cookie 15/day, global circuit breaker on SMS spend                                                                      |
| Responses       | identical for known/unknown destination (no enumeration), timing padded                                                                            |
| Bot defence     | Cloudflare Turnstile (free) token required after first request from an IP or when risk score high; honeypot field; reject disposable email domains |
| Logging         | **never** the code, the full phone, or tokens. Phone masked `+91******21`. A test greps captured logs for 6-digit codes.                           |
| Dev             | `DevInboxProvider` shows OTPs in `/dev/otp` only when `NODE_ENV!=production`; refuses to start in prod                                             |

## Phone-specific cases (all must be handled)

- Normalise to E.164 (libphonenumber-js); reject VOIP/invalid by regex+lib; India `+91` 10-digit starting 6–9.
- **Wrong number / lost number:** user signs in via email OTP → `phone/change` → OTP to _new_ number → on success old number released; old number gets a notice if still reachable. A number can belong to one active account; claiming a re-assigned number requires email verification of the previous owner or admin override.
- **DND-registered numbers:** use a transactional/OTP route (provider config); if delivery receipt says `DND_BLOCKED` or no DLR in 20 s, auto-offer **"Send to email instead"** and failover to email provider.
- **Provider selection (free/low-cost, verify current terms before relying):** adapters for Twilio Verify (trial only reaches verified numbers), MSG91 or similar Indian gateway (requires DLT registration for production sender IDs/templates), and the Dev inbox. Email OTP via Resend/Brevo/SMTP free tier is the dependable free channel. Document cost-per-OTP assumptions in `docs/SMS-COSTS.md` with a monthly budget guard (hard cap → switch to email).
- **Slow-SMS monitoring:** record `sms_send_latency_ms` and `sms_delivery_latency_ms` histograms per provider; alert (in `/admin/ops` + log at warn) when p95 delivery > 15 s over 5 min or success < 95%; automatic failover to secondary after 3 consecutive timeouts; circuit breaker with half-open probe.
- **Delivery receipts:** webhook endpoint with signature verification and replay protection.

## RBAC

Roles `STUDENT < ORGANIZER < FACULTY < ADMIN` are not strictly hierarchical: matrix in `authz.matrix.ts` is the single source and tests iterate over **every route × every role** asserting allow/deny.

## Security review checklist (run at G3 and G4; output goes to RELEASE-AUDIT)

Input validation everywhere; output encoding; IDOR checks on every `:id`; mass-assignment blocked by schemas; helmet + CSP (no inline script except hashed); CORS allow-list; cookie flags; JWT `alg` pinned and `none` rejected; secrets scan; dependency audit; rate limits on all unauthenticated routes; file upload type/size sniffing; SSRF none (no user URLs fetched); audit log for admin actions; PII minimisation and deletion endpoint; error messages generic; security headers verified by test; timing-safe comparisons; dependency pinning with lockfile.
