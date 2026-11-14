import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from "jose";
import { config } from "../config.js";
import { authService } from "../modules/auth/index.js";

export interface DecodedUser {
  id: string;
  sub: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  institution?: string;
  permissions: string[];
  jti?: string;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    const keycloakUrl = process.env.KEYCLOAK_URL || config.KEYCLOAK_URL;
    const realm = process.env.KEYCLOAK_REALM || config.KEYCLOAK_REALM;
    const jwksUri = new URL(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
    );
    jwks = createRemoteJWKSet(jwksUri);
  }
  return jwks;
}

export async function verifyToken(token: string): Promise<DecodedUser> {
  // 1. Test/Development deterministic token shortcut
  if (config.NODE_ENV !== "production" && token.startsWith("test-token:")) {
    const [
      ,
      role = "STUDENT",
      sub = "01927500-0001-7000-8000-000000000001",
      dept = "Computer Science",
    ] = token.split(":");
    const { PERSONA_ROLE_BUNDLES } = await import("../access/roles.js");
    const permissions = PERSONA_ROLE_BUNDLES[role] || [];
    return {
      id: sub,
      sub,
      email: `${role.toLowerCase()}@christuniversity.in`,
      name: `Test ${role}`,
      role,
      department: dept,
      permissions: [...permissions],
    };
  }

  // 2. Inspect JOSE header to route between local HS256 auth and Keycloak RS256 JWKS
  const header = decodeProtectedHeader(token);
  if (header.alg === "HS256") {
    return authService.verifyLocalAccessToken(token);
  }

  // 3. Keycloak 26 OIDC RS256 JWKS verification
  const keycloakUrl = process.env.KEYCLOAK_URL || config.KEYCLOAK_URL;
  const realm = process.env.KEYCLOAK_REALM || config.KEYCLOAK_REALM;
  const expectedIssuer = `${keycloakUrl}/realms/${realm}`;

  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: expectedIssuer,
    algorithms: ["RS256"],
  });

  let permissions: string[] = [];
  if (Array.isArray(payload.permissions)) {
    permissions = payload.permissions as string[];
  } else if (
    payload.resource_access &&
    typeof payload.resource_access === "object"
  ) {
    const clientAccess = (payload.resource_access as Record<string, any>)[
      config.KEYCLOAK_CLIENT_ID
    ];
    if (clientAccess && Array.isArray(clientAccess.roles)) {
      permissions = clientAccess.roles;
    }
  }

  const realmRoles = (payload.realm_access as any)?.roles || [];
  const primaryRole =
    realmRoles.find((r: string) =>
      [
        "ADMIN",
        "DEAN",
        "FACULTY",
        "EVENT_HEAD",
        "VOLUNTEER",
        "SPONSOR",
        "STUDENT",
        "GUEST",
      ].includes(r),
    ) || "GUEST";

  return {
    id: payload.sub as string,
    sub: payload.sub as string,
    email: (payload.email as string) || "",
    name:
      (payload.name as string) ||
      (payload.preferred_username as string) ||
      "Anonymous",
    role: primaryRole,
    department: (payload.department as string) || undefined,
    institution: (payload.institution as string) || undefined,
    permissions,
    jti: payload.jti,
  };
}
