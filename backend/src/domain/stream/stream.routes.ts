import type { FastifyPluginAsync } from "fastify";
import { config } from "../../config.js";

export interface StreamEvent {
  id: number;
  event: string;
  data: any;
  timestamp: string;
}

export interface StreamListener {
  id: string;
  write: (chunk: string) => void;
}

class StreamHub {
  private listeners: Map<string, StreamListener> = new Map();
  private recentEvents: StreamEvent[] = [
    {
      id: 1,
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
  private seq = 2;

  addListener(id: string, listener: StreamListener) {
    this.listeners.set(id, listener);
  }

  removeListener(id: string) {
    this.listeners.delete(id);
  }

  broadcast(event: string, data: any) {
    const evt: StreamEvent = {
      id: this.seq++,
      event,
      data,
      timestamp: new Date().toISOString(),
    };
    this.recentEvents.push(evt);
    if (this.recentEvents.length > 50) {
      this.recentEvents.shift();
    }

    const payload = `id: ${evt.id}\nevent: ${evt.event}\ndata: ${JSON.stringify(evt.data)}\n\n`;
    for (const [id, listener] of this.listeners.entries()) {
      try {
        listener.write(payload);
      } catch {
        this.listeners.delete(id);
      }
    }
  }

  getRecent(since = 0): StreamEvent[] {
    return this.recentEvents.filter((e) => e.id > since);
  }

  getCurrentSeq(): number {
    return this.seq;
  }
}

export const streamHub = new StreamHub();

const ALLOWED_SSE_ORIGINS = new Set([
  config.APP_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://localhost:9080",
]);

export const streamRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/stream (Real-Time SSE Stream with Fastify hijack + CORS headers)
  app.get(
    "/stream",
    {
      config: { auth: "public" },
    },
    async (request, reply) => {
      reply.hijack();

      const reqOrigin = request.headers.origin;
      if (reqOrigin && ALLOWED_SSE_ORIGINS.has(reqOrigin)) {
        reply.raw.setHeader("Access-Control-Allow-Origin", reqOrigin);
        reply.raw.setHeader("Access-Control-Allow-Credentials", "true");
        reply.raw.setHeader("Vary", "Origin");
      } else {
        reply.raw.setHeader("Access-Control-Allow-Origin", config.APP_ORIGIN);
      }

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      reply.raw.write(
        `id: ${streamHub.getCurrentSeq()}\nevent: connection.ready\ndata: {"status":"connected","clientId":"${clientId}"}\n\n`,
      );

      const lastIdHeader = request.headers["last-event-id"];
      if (lastIdHeader) {
        const lastId = parseInt(lastIdHeader as string, 10);
        if (!Number.isNaN(lastId)) {
          const replay = streamHub.getRecent(lastId);
          for (const evt of replay) {
            reply.raw.write(
              `id: ${evt.id}\nevent: ${evt.event}\ndata: ${JSON.stringify(evt.data)}\n\n`,
            );
          }
        }
      }

      streamHub.addListener(clientId, {
        id: clientId,
        write: (chunk: string) => {
          if (!reply.raw.writableEnded) {
            reply.raw.write(chunk);
          }
        },
      });

      const heartbeat = setInterval(() => {
        if (!reply.raw.writableEnded) {
          reply.raw.write(":heartbeat\n\n");
        }
      }, 15000);

      request.raw.on("close", () => {
        clearInterval(heartbeat);
        streamHub.removeListener(clientId);
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
      const newEvents = streamHub.getRecent(since);
      return reply.status(200).send({
        events: newEvents,
        latestSeq: streamHub.getCurrentSeq() - 1,
        pollIntervalMs: 15000,
        serverTime: new Date().toISOString(),
      });
    },
  );
};
