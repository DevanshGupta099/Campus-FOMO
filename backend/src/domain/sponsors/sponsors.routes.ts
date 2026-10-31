import type { FastifyPluginAsync } from "fastify";
import { requirePermission } from "../../auth/middleware.js";

export const sponsorRoutes: FastifyPluginAsync = async (app) => {
  let impressionsCount = 428;

  // GET /api/v1/sponsors/showcase (Public sponsor showcase page)
  app.get(
    "/sponsors/showcase",
    {
      config: { auth: "public" },
    },
    async (_request, reply) => {
      impressionsCount += 1;
      return reply.status(200).send({
        brand: "Third Wave Coffee Campus Lounge",
        tagline: "Fueling CHRIST University Innovators & Creatives",
        location: "Central Block Ground Floor (Near Audi 1)",
        hours: "08:00 AM – 08:30 PM",
        studentPerk:
          "Flat 20% off with verified Campus FOMO registration badge",
        menuHighlights: [
          { name: "Classic Cold Brew", price: 180, studentPrice: 144 },
          { name: "Sea Salt Mocha", price: 210, studentPrice: 168 },
          { name: "Sourdough Toast & Hummus", price: 160, studentPrice: 128 },
        ],
        activeCampaigns: [
          {
            id: "camp-twc-01",
            title: "Fest Hackathon Free Cold Brew Lucky Draw",
            prize: "5x ₹500 Cafe Vouchers",
          },
        ],
      });
    },
  );

  // GET /api/v1/sponsors/analytics (Sponsor internal analytics)
  app.get(
    "/sponsors/analytics",
    {
      config: { auth: ["sponsor:analytics:view:own"] },
      preHandler: [requirePermission("sponsor:analytics:view:own")],
    },
    async (_request, reply) => {
      // Compliance: NFR p. 4 - Student phone numbers/emails are strictly NOT exposed to sponsors
      return reply.status(200).send({
        sponsorName: "Third Wave Coffee Campus Lounge",
        totalImpressions: impressionsCount,
        bannerClickThroughs: 89,
        voucherClaims: 34,
        privacyNote:
          "Strict PII Minimization enforced: Student phone numbers and emails are never shared with sponsors.",
      });
    },
  );
};
