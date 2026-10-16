# Security Policy — Campus FOMO

## Supported Versions

Only the latest release on the `master` branch is supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Campus FOMO takes the security and privacy of students and faculty seriously.

If you discover a security vulnerability:

1. **Do not create a public GitHub issue.**
2. Send a detailed report to `security@campusfomo.internal` (or reach out to the project administrator directly).
3. Include reproduction steps, environment details, and affected endpoints.

### Responsible Disclosure & Scope

- We will acknowledge receipt of your report within 24 hours.
- We request that you give us at least 7 days to patch the vulnerability before public disclosure.
- In-scope: Authentication bypass, IDOR, SQL injection, secrets leakage, over-capacity registration races, unauthorized role elevation.
- Out-of-scope: Denial of Service attacks against third-party mock providers, spamming external trial SMS numbers.
