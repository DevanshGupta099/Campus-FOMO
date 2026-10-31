# Campus FOMO — Estimation (Stage 7 / COCOMO II & PERT)

## 1. COCOMO II Estimation (Handbook p. 15–16)

Formula from Handbook p. 15:
$$\text{Effort (PM)} = 2.94 \times \text{Size}^{E} \times \prod EM_i$$

### Project Parameters

- **Size**: ~6.5 KSLOC (TypeScript: backend + frontend core + infra scripts)
- **Exponent $E$**: $1.10$ (organic project with modest constraints)
- **Effort Multipliers ($EM$)**:
  - RELY (Required Software Reliability): $1.10$ (financial budget & atomic seat booking)
  - DATA (Database Size): $1.00$ (PostgreSQL 16)
  - CPLX (Product Complexity): $1.15$ (PBAC + Apache APISIX + Keycloak + Lucky Draw commit-reveal)
  - TIME (Execution Time Constraint): $1.05$ (p95 < 200 ms read budget)
  - STOR (Main Storage Constraint): $1.00$
  - TOOL (Use of Software Tools): $0.90$ (Vite, Fastify, Drizzle, Turborepo, Zod)
  - $\prod EM_i \approx 1.10 \times 1.15 \times 1.05 \times 0.90 \approx 1.195$

### Calculations

- $\text{Size}^{1.10} = 6.5^{1.10} \approx 7.85$
- $\text{Effort (PM)} = 2.94 \times 7.85 \times 1.195 \approx 27.58\text{ Person-Months}$
- $\text{Nominal Schedule Months (TDEV)} = 3.67 \times (\text{Effort})^{0.28} \approx 3.67 \times (27.58)^{0.28} \approx 9.29\text{ Months}$
- With autonomous AI engineering acceleration factor ($4.5\times$ on implementation and test generation), adjusted development duration is ~2.0 calendar months.

---

## 2. Three-Point PERT Estimate Table (Handbook p. 16)

| Milestone / Component                         | Optimistic ($O$) | Realistic ($M$) | Pessimistic ($P$) | Expected $E = \frac{O + 4M + P}{6}$ | Variance $\sigma^2 = (\frac{P - O}{6})^2$ |
| :-------------------------------------------- | :--------------: | :-------------: | :---------------: | :---------------------------------: | :---------------------------------------: |
| **M1: PBAC & Keycloak Sync**                  |      2 days      |     4 days      |      7 days       |              4.17 days              |                   0.69                    |
| **M2: APISIX Gateway Setup**                  |      1 day       |     2 days      |      4 days       |              2.17 days              |                   0.25                    |
| **M3: Core Domain & Atomic Seat Booking**     |      3 days      |     5 days      |      9 days       |              5.33 days              |                   1.00                    |
| **M4: QR Check-in & Rotating Tokens**         |      1 day       |     2 days      |      4 days       |              2.17 days              |                   0.25                    |
| **M5: Lucky Draw Commit-Reveal System**       |     1.5 days     |     3 days      |      5 days       |              3.08 days              |                   0.34                    |
| **M6: Web Frontend & Navigation Integration** |      3 days      |     5 days      |      8 days       |              5.17 days              |                   0.69                    |
| **M7: Seed Data & Concurrency Test Suite**    |      2 days      |     3 days      |      6 days       |              3.33 days              |                   0.44                    |
| **Total Project**                             |  **13.5 days**   |  **24.0 days**  |   **43.0 days**   |           **25.42 days**            |                 **3.66**                  |
