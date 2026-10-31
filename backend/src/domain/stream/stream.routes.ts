import type { FastifyPluginAsync } from "fastify";

interface StreamEvent {
  id: number;
  event: string;
  data: any;
  timestamp: string;
}

export const streamRoutes: FastifyPluginAsync = async (app) => {
  let eventSeq = 1;
  const recentEvents: StreamEvent[] = [
    {
      id: eventSeq++,
      event: "seat.updated",
      data: {
        eventId: "evt-hackathon-100",
        confirmedCount: 49,
        capacity: 50,
        remaining: 1,
      },
      timestamp: new Date().toISOString(),
    },
  ];

  // GET /api/v1/stream (Real-Time SSE Stream)
  app.get(
    "/stream",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      reply.raw.setHeader("Content-Type", "text/event-stream");
      reply.raw.setHeader("Cache-Control", "no-cache");
      reply.raw.setHeader("Connection", "keep-alive");
      reply.raw.setHeader("X-Accel-Buffering", "no");

      // Initial connection established message
      reply.raw.write(
        `id: ${eventSeq}\nevent: connection.ready\ndata: {"status":"connected"}\n\n`,
      );

      // Handle Last-Event-ID replay if client reconnected
      const lastIdHeader = request.headers["last-event-id"];
      if (lastIdHeader) {
        const lastId = parseInt(lastIdHeader as string, 10);
        const replay = recentEvents.filter((e) => e.id > lastId);
        for (const evt of replay) {
          reply.raw.write(
            `id: ${evt.id}\nevent: ${evt.event}\ndata: ${JSON.stringify(evt.data)}\n\n`,
          );
        }
      }

      // 15-second heartbeat interval to prevent Wi-Fi proxy timeout
      const heartbeat = setInterval(() => {
        if (!reply.raw.writableEnded) {
          reply.raw.write(":heartbeat\n\n");
        }
      }, 15000);

      request.raw.on("close", () => {
        clearInterval(heartbeat);
      });
    },
  );

  // GET /api/v1/stream/poll (HTTP short-polling fallback)
  app.get(
    "/stream/poll",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      const query = request.query as { since?: string };
      const since = parseInt(query.since || "0", 10);
      const newEvents = recentEvents.filter((e) => e.id > since);
      return reply.status(200).send({
        events: newEvents,
        pollIntervalMs: 15000,
        serverTime: new Date().toISOString(),
      });
    },
  );
};
