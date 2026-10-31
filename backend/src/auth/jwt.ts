import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "../config.js";

export interface DecodedUser {
  id: string;
  sub: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  institution?: string;
  permissions: string[];
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    const keycloakUrl = process.env.KEYCLOAK_URL || "http://localhost:8080";
    const realm = process.env.KEYCLOAK_REALM || "campus-fomo";
    const jwksUri = new URL(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
    );
    jwks = createRemoteJWKSet(jwksUri);
  }
  return jwks;
}

export async function verifyToken(token: string): Promise<DecodedUser> {
  // Test/Development mock token shortcut
  if (config.NODE_ENV === "test" && token.startsWith("test-token:")) {
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

  const keycloakUrl = process.env.KEYCLOAK_URL || "http://localhost:8080";
  const realm = process.env.KEYCLOAK_REALM || "campus-fomo";
  const expectedIssuer = `${keycloakUrl}/realms/${realm}`;

  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: expectedIssuer,
    algorithms: ["RS256"],
  });

  // Extract flat permissions array from token
  let permissions: string[] = [];
  if (Array.isArray(payload.permissions)) {
    permissions = payload.permissions as string[];
  } else if (
    payload.resource_access &&
    typeof payload.resource_access === "object"
  ) {
    const clientAccess = (payload.resource_access as Record<string, any>)[
      "campus-api"
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
  };
}
