import { DEMO_PERSONAS } from "../auth/persona.js";

export function AdminRbacScreen() {
  return (
    <div className="space-y-8 text-left animate-fadeIn">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-mono font-semibold border border-violet-500/30">
          <span>🔐 PBAC MATRIX</span>
          <span>•</span>
          <span>APACHE APISIX + KEYCLOAK 26</span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mt-2">
          Access & Roles — Zero-Trust PBAC Engine
        </h2>
        <p className="text-xs text-white/60 max-w-xl mt-1">
          Permission-Based Access Control (PBAC) configured on Apache APISIX and
          Keycloak 26. Backend routes and frontend screens check granular
          permissions (
          <code className="text-violet-300">event:approve:dept</code>), never
          raw role names.
        </p>
      </div>

      {/* Zero Trust Architecture Summary */}
      <section className="bg-surface border border-white/10 rounded-2xl p-6 space-y-4 shadow-card">
        <h3 className="font-bold text-white text-base">
          Zero-Trust Security Perimeter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-surface-2 p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-violet-300 font-bold block">
              1. Ingress Gateway
            </span>
            <span className="text-white/60">
              Apache APISIX validates Bearer JWT tokens, enforces rate limits,
              unbuffered SSE streams, and CORS preflight.
            </span>
          </div>

          <div className="bg-surface-2 p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-violet-300 font-bold block">
              2. Fastify Boot Audit
            </span>
            <span className="text-white/60">
              Backend audits every route at boot time. Any route missing
              explicit <code className="text-mint-400">config.auth</code> halts
              boot immediately.
            </span>
          </div>

          <div className="bg-surface-2 p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-violet-300 font-bold block">
              3. Granular PBAC
            </span>
            <span className="text-white/60">
              Permissions follow{" "}
              <code className="text-mint-400">resource:action[:scope]</code>{" "}
              format with ownership checks (
              <code className="text-violet-300">own</code>,{" "}
              <code className="text-violet-300">dept</code>,{" "}
              <code className="text-violet-300">any</code>).
            </span>
          </div>
        </div>
      </section>

      {/* 8 Persona Composite Role Bundles */}
      <section className="space-y-4">
        <h3 className="font-bold text-white text-base">
          Pre-Configured Persona Composite Role Bundles (Keycloak 26)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_PERSONAS.map((persona) => (
            <div
              key={persona.id}
              className="bg-surface border border-white/10 hover:border-violet-500/40 rounded-xl p-4 space-y-2 text-xs transition-colors shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>{persona.avatar}</span>
                  <span>{persona.name}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-600/30">
                  {persona.role}
                </span>
              </div>

              <p className="text-white/60 text-[11px] leading-relaxed">
                {persona.description}
              </p>

              <div className="pt-2 border-t border-white/5 text-[10px] text-white/40 font-mono">
                Sub: {persona.token.split(":")[2] || "01927500-..."}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
