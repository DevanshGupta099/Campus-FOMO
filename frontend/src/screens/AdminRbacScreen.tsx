import { DEMO_PERSONAS } from "../auth/persona.js";

export function AdminRbacScreen() {
  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-2xl font-extrabold text-paper-50 font-display">
          Access & Roles — Zero-Trust PBAC Engine
        </h2>
        <p className="text-xs text-royal-300 font-body">
          Permission-Based Access Control (PBAC) configured on Apache APISIX and
          Keycloak 26. Backend routes and frontend screens check granular
          permissions (<code className="text-gold-400">event:approve:dept</code>
          ), never raw role names.
        </p>
      </div>

      {/* Zero Trust Architecture Summary */}
      <section className="bg-ink-800/60 border border-royal-500/30 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-paper-50 text-base">
          Zero-Trust Security Perimeter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-ink-950 p-4 rounded-xl border border-royal-500/20 space-y-1">
            <span className="text-gold-400 font-bold block">
              1. Ingress Gateway
            </span>
            <span className="text-paper-50/70">
              Apache APISIX validates Bearer JWT tokens, enforces rate limits,
              unbuffered SSE streams, and CORS.
            </span>
          </div>

          <div className="bg-ink-950 p-4 rounded-xl border border-royal-500/20 space-y-1">
            <span className="text-gold-400 font-bold block">
              2. Fastify Boot Audit
            </span>
            <span className="text-paper-50/70">
              Backend audits every route at boot time. Any route missing
              explicit <code className="text-mint-400">config.auth</code> halts
              boot immediately.
            </span>
          </div>

          <div className="bg-ink-950 p-4 rounded-xl border border-royal-500/20 space-y-1">
            <span className="text-gold-400 font-bold block">
              3. Granular PBAC
            </span>
            <span className="text-paper-50/70">
              Permissions follow{" "}
              <code className="text-mint-400">resource:action[:scope]</code>{" "}
              format with ownership checks (
              <code className="text-royal-300">own</code>,{" "}
              <code className="text-royal-300">dept</code>,{" "}
              <code className="text-royal-300">any</code>).
            </span>
          </div>
        </div>
      </section>

      {/* 8 Persona Composite Role Bundles */}
      <section className="space-y-4">
        <h3 className="font-bold text-paper-50 text-base">
          Pre-Configured Persona Composite Role Bundles (Keycloak 26)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_PERSONAS.map((persona) => (
            <div
              key={persona.id}
              className="bg-ink-800/70 border border-royal-500/20 rounded-xl p-4 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-paper-50 flex items-center gap-1.5">
                  <span>{persona.avatar}</span>
                  <span>{persona.name}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-royal-500/30 text-royal-300 border border-royal-500/40">
                  {persona.role}
                </span>
              </div>

              <p className="text-paper-50/70 text-[11px]">
                {persona.description}
              </p>

              <div className="pt-2 border-t border-royal-500/10 text-[10px] text-paper-50/50 font-mono">
                Sub: {persona.token.split(":")[2] || "01927500-..."}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
