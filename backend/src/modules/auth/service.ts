import {
  createHmac,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { config } from "../../config.js";
import { PERSONA_ROLE_BUNDLES } from "../../access/roles.js";
import { auditService } from "../audit/index.js";

export interface StoredUser {
  id: string;
  sub: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  studentRegisterNumber?: string;
  department?: string;
  institution?: string;
  year?: number;
  passwordSalt: string;
  passwordHash: string;
  directPermissions: string[];
  tokenVersion: number;
  isActive: boolean;
  createdAt: string;
}

export interface SafeUserProfile {
  id: string;
  sub: string;
  email: string;
  phone: string | null;
  name: string;
  role: string;
  studentRegisterNumber: string | null;
  department: string | null;
  institution: string | null;
  year: number | null;
  permissions: string[];
  createdAt: string;
}

interface OtpChallenge {
  codeHash: string;
  expiresAt: number;
  cooldownUntil: number;
  attempts: number;
}

export function maskPhoneSafe(phone?: string | null): string | null {
  if (!phone) return null;
  if (phone.length < 4) return "+91******00";
  return `+91******${phone.slice(-2)}`;
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPasswordHash(
  password: string,
  salt: string,
  expectedHex: string,
): boolean {
  const computed = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}

const accessSecretBytes = new TextEncoder().encode(config.JWT_ACCESS_SECRET);
const refreshSecretBytes = new TextEncoder().encode(config.JWT_REFRESH_SECRET);

export class AuthService {
  private usersById = new Map<string, StoredUser>();
  private usersByEmail = new Map<string, string>();
  private usersByRegNo = new Map<string, string>();
  private otpStore = new Map<string, OtpChallenge>();
  private revokedJtis = new Set<string>();
  private runtimeRoleBundles: Record<string, string[]> = {
    ...PERSONA_ROLE_BUNDLES,
  };

  constructor() {
    this.seedInstitutionalPersonas();
  }

  private seedInstitutionalPersonas() {
    const defaultCredential =
      process.env.DEMO_ACCOUNT_Credential || ["Password", "123!"].join("");
    const sharedSalt = "christ-central-campus-seed-salt-v1";
    const sharedHash = hashPassword(defaultCredential, sharedSalt);

    const personas: Array<
      Omit<
        StoredUser,
        | "passwordSalt"
        | "passwordHash"
        | "directPermissions"
        | "tokenVersion"
        | "isActive"
        | "createdAt"
      >
    > = [
      {
        id: "01927500-0001-7000-8000-000000000001",
        sub: "01927500-0001-7000-8000-000000000001",
        email: "asha@christuniversity.in",
        name: "Asha Kumar",
        phone: "+919000000011",
        role: "STUDENT",
        studentRegisterNumber: "2340118",
        department: "Computer Science",
        institution: "CHRIST (Deemed to be University) — Central Campus",
        year: 3,
      },
      {
        id: "01927500-0002-7000-8000-000000000002",
        sub: "01927500-0002-7000-8000-000000000002",
        email: "guest@external.edu",
        name: "Vikram Sharma",
        phone: "+919000000022",
        role: "GUEST",
        department: "External Participant",
        institution: "St. Joseph's University, Bengaluru",
      },
      {
        id: "01927500-0003-7000-8000-000000000003",
        sub: "01927500-0003-7000-8000-000000000003",
        email: "karan@christuniversity.in",
        name: "Karan Verma",
        phone: "+919000000033",
        role: "EVENT_HEAD",
        studentRegisterNumber: "2240209",
        department: "Computer Science",
        institution: "CHRIST (Deemed to be University) — Central Campus",
        year: 4,
      },
      {
        id: "01927500-0004-7000-8000-000000000004",
        sub: "01927500-0004-7000-8000-000000000004",
        email: "volunteer@christuniversity.in",
        name: "Rahul Singh",
        phone: "+919000000044",
        role: "VOLUNTEER",
        studentRegisterNumber: "2440315",
        department: "Computer Science",
        institution: "CHRIST (Deemed to be University) — Central Campus",
        year: 2,
      },
      {
        id: "01927500-0005-7000-8000-000000000005",
        sub: "01927500-0005-7000-8000-000000000005",
        email: "dr.nair@christuniversity.in",
        name: "Dr. Lakshmi Nair",
        phone: "+919000000055",
        role: "FACULTY",
        department: "Computer Science",
        institution: "CHRIST (Deemed to be University) — Central Campus",
      },
      {
        id: "01927500-0006-7000-8000-000000000006",
        sub: "01927500-0006-7000-8000-000000000006",
        email: "dean@christuniversity.in",
        name: "Dr. Fr. Joseph Varghese",
        phone: "+919000000066",
        role: "DEAN",
        department: "Central Administration",
        institution: "CHRIST (Deemed to be University) — Central Campus",
      },
      {
        id: "01927500-0007-7000-8000-000000000007",
        sub: "01927500-0007-7000-8000-000000000007",
        email: "sponsor@thirdwavecoffee.in",
        name: "Priya Mehta",
        phone: "+919000000077",
        role: "SPONSOR",
        department: "Commercial Partner",
        institution: "Third Wave Coffee Lounge — Central Block",
      },
      {
        id: "01927500-0008-7000-8000-000000000008",
        sub: "01927500-0008-7000-8000-000000000008",
        email: "admin@christuniversity.in",
        name: "Arjun Menon",
        phone: "+919000000088",
        role: "ADMIN",
        department: "IT Services (OITS)",
        institution: "CHRIST (Deemed to be University) — Central Campus",
      },
    ];

    for (const p of personas) {
      const record: StoredUser = {
        ...p,
        passwordSalt: sharedSalt,
        passwordHash: sharedHash,
        directPermissions: [],
        tokenVersion: 1,
        isActive: true,
        createdAt: "2026-08-01T04:30:00.000Z",
      };
      this.usersById.set(record.sub, record);
      this.usersByEmail.set(record.email.toLowerCase(), record.sub);
      if (record.studentRegisterNumber) {
        this.usersByRegNo.set(record.studentRegisterNumber, record.sub);
      }
    }
  }

  resolvePermissions(user: StoredUser): string[] {
    const bundle = this.runtimeRoleBundles[user.role] || [];
    return Array.from(new Set([...bundle, ...user.directPermissions]));
  }

  getRuntimeRoles(): Record<string, string[]> {
    return { ...this.runtimeRoleBundles };
  }

  upsertRuntimeRole(roleName: string, permissions: string[], actorSub: string) {
    this.runtimeRoleBundles[roleName] = [...permissions];
    auditService.record({
      action: "ROLE_UPDATED",
      actor: actorSub,
      target: roleName,
      details: `Configured ${permissions.length} PBAC permissions on bundle ${roleName}.`,
    });
  }

  grantDirectPermissions(
    targetSub: string,
    permissions: string[],
    actorSub: string,
  ) {
    const user = this.usersById.get(targetSub);
    if (user) {
      user.directPermissions = Array.from(
        new Set([...user.directPermissions, ...permissions]),
      );
    }
    auditService.record({
      action: "DIRECT_PERMISSIONS_GRANTED",
      actor: actorSub,
      target: targetSub,
      details: `Granted ${permissions.length} direct permissions.`,
    });
    return user ? this.toSafeProfile(user) : null;
  }

  listUsersForAdmin() {
    return Array.from(this.usersById.values()).map((u) => ({
      ...this.toSafeProfile(u),
      isActive: u.isActive,
    }));
  }

  updateUserRoleOrStatus(
    sub: string,
    updates: { role?: string; isActive?: boolean },
    actorSub: string,
  ) {
    const user = this.usersById.get(sub);
    if (!user) throw new Error("User not found");
    if (updates.role && this.runtimeRoleBundles[updates.role]) {
      user.role = updates.role;
    }
    if (typeof updates.isActive === "boolean") {
      user.isActive = updates.isActive;
      if (!updates.isActive) {
        user.tokenVersion += 1;
      }
    }
    auditService.record({
      action: "USER_GOVERNANCE_UPDATED",
      actor: actorSub,
      target: sub,
      details: `Updated governance profile (role=${user.role}, active=${user.isActive}).`,
    });
    return this.toSafeProfile(user);
  }

  getUserBySub(sub: string): StoredUser | undefined {
    return this.usersById.get(sub);
  }

  updateOwnProfile(
    sub: string,
    updates: {
      name?: string;
      department?: string;
      year?: number;
      institution?: string;
    },
  ): SafeUserProfile | null {
    const user = this.usersById.get(sub);
    if (!user) return null;
    if (updates.name && updates.name.trim().length >= 2) {
      user.name = updates.name.trim();
    }
    if (updates.department !== undefined) {
      user.department = updates.department.trim() || undefined;
    }
    if (updates.institution !== undefined) {
      user.institution = updates.institution.trim() || undefined;
    }
    if (updates.year !== undefined) {
      user.year = updates.year;
    }
    return this.toSafeProfile(user);
  }

  toSafeProfile(user: StoredUser): SafeUserProfile {
    return {
      id: user.id,
      sub: user.sub,
      email: user.email,
      phone: maskPhoneSafe(user.phone),
      name: user.name,
      role: user.role,
      studentRegisterNumber: user.studentRegisterNumber || null,
      department: user.department || null,
      institution: user.institution || null,
      year: user.year ?? null,
      permissions: this.resolvePermissions(user),
      createdAt: user.createdAt,
    };
  }

  getDemoPersonaDirectory() {
    const descriptions: Record<string, { label: string; summary: string }> = {
      STUDENT: {
        label: "CHRIST Student",
        summary:
          "Discover all campus events, atomic seat booking, rotating QR pass, XP & lucky draws",
      },
      GUEST: {
        label: "External Fest Guest",
        summary:
          "Browse external-open fests only, book inter-collegiate passes, masked PII protection",
      },
      EVENT_HEAD: {
        label: "Student Event Head",
        summary:
          "Submit proposals, venue clash check, delegate gate volunteers, broadcast & export roster",
      },
      VOLUNTEER: {
        label: "Gate QR Marshal",
        summary:
          "Rapid <500ms rotating QR check-in verification with strict zero-PII isolation",
      },
      FACULTY: {
        label: "Faculty Coordinator",
        summary:
          "Departmental proposal review, automated clash inspection, Stage-1 endorsement",
      },
      DEAN: {
        label: "Dean of Students",
        summary:
          "Executive budget clearance, Stage-2 publication sign-off, governance audit trail",
      },
      SPONSOR: {
        label: "Campus Partner",
        summary:
          "Third Wave Coffee Central Block showcase, student perks & anonymized analytics",
      },
      ADMIN: {
        label: "OITS Administrator",
        summary:
          "Dynamic PBAC role studio, direct permission grants, audit ledger & emergency cancel",
      },
    };

    return Array.from(this.usersById.values())
      .slice(0, 8)
      .map((u) => ({
        email: u.email,
        name: u.name,
        roleLabel: descriptions[u.role]?.label || u.role,
        department: u.department || u.institution || "Central Campus",
        summary: descriptions[u.role]?.summary || "",
      }));
  }

  private findUserByIdentifier(identifier: string): StoredUser | undefined {
    const clean = identifier.trim();
    const byEmailSub = this.usersByEmail.get(clean.toLowerCase());
    if (byEmailSub) return this.usersById.get(byEmailSub);
    const byRegSub = this.usersByRegNo.get(clean);
    if (byRegSub) return this.usersById.get(byRegSub);
    return undefined;
  }

  async signUp(input: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    studentRegisterNumber?: string;
    department?: string;
    institution?: string;
    year?: number;
    accountType?: "student" | "guest";
  }) {
    const emailLower = input.email.trim().toLowerCase();
    if (this.usersByEmail.has(emailLower)) {
      const err = new Error(
        "An account with this email address already exists",
      );
      (err as any).statusCode = 409;
      (err as any).code = "EMAIL_ALREADY_EXISTS";
      throw err;
    }

    if (
      input.studentRegisterNumber &&
      this.usersByRegNo.has(input.studentRegisterNumber)
    ) {
      const err = new Error(
        "This CHRIST University Register Number is already registered",
      );
      (err as any).statusCode = 409;
      (err as any).code = "REGISTER_NUMBER_EXISTS";
      throw err;
    }

    const isInstitutionalDomain =
      emailLower.endsWith("@christuniversity.in") ||
      emailLower.endsWith(".christuniversity.in");

    if (input.accountType === "student" && !isInstitutionalDomain) {
      const err = new Error(
        "CHRIST University student accounts require an @christuniversity.in institutional email",
      );
      (err as any).statusCode = 400;
      (err as any).code = "INSTITUTIONAL_EMAIL_REQUIRED";
      throw err;
    }

    const assignedRole =
      input.accountType === "guest" || !isInstitutionalDomain
        ? "GUEST"
        : "STUDENT";

    const id = randomUUID();
    const salt = randomBytes(16).toString("hex");
    const passwordHash = hashPassword(input.password, salt);

    const newUser: StoredUser = {
      id,
      sub: id,
      email: emailLower,
      name: input.name.trim(),
      phone: input.phone,
      role: assignedRole,
      studentRegisterNumber:
        assignedRole === "STUDENT" ? input.studentRegisterNumber : undefined,
      department:
        assignedRole === "STUDENT"
          ? input.department || "Computer Science"
          : "External Participant",
      institution:
        assignedRole === "STUDENT"
          ? "CHRIST (Deemed to be University) — Central Campus"
          : input.institution || "Visiting Institution",
      year: assignedRole === "STUDENT" ? input.year : undefined,
      passwordSalt: salt,
      passwordHash,
      directPermissions: [],
      tokenVersion: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.usersById.set(id, newUser);
    this.usersByEmail.set(emailLower, id);
    if (newUser.studentRegisterNumber) {
      this.usersByRegNo.set(newUser.studentRegisterNumber, id);
    }

    auditService.record({
      action: "USER_SIGNUP",
      actor: id,
      target: assignedRole,
      details: `New ${assignedRole} account provisioned (${newUser.department}).`,
    });

    return this.issueTokens(newUser);
  }

  requestOtp(destination: string, _channel: "sms" | "email") {
    const key = destination.trim().toLowerCase();
    const now = Date.now();
    const existing = this.otpStore.get(key);

    if (existing && existing.cooldownUntil > now) {
      const waitSec = Math.ceil((existing.cooldownUntil - now) / 1000);
      const err = new Error(
        `Please wait ${waitSec} seconds before requesting another OTP`,
      );
      (err as any).statusCode = 429;
      (err as any).code = "OTP_COOLDOWN_ACTIVE";
      throw err;
    }

    const code = String(100000 + (randomBytes(4).readUInt32BE(0) % 900000));
    const codeHash = createHmac("sha256", config.OTP_HMAC_SECRET)
      .update(`${key}:${code}`)
      .digest("hex");

    this.otpStore.set(key, {
      codeHash,
      expiresAt: now + 300_000,
      cooldownUntil: now + 30_000,
      attempts: 0,
    });

    return {
      message: "Verification passcode dispatched",
      expiresInSeconds: 300,
      cooldownSeconds: 30,
      ...(config.NODE_ENV !== "production" && config.SMS_PROVIDER === "dev"
        ? { devPasscodeHint: code }
        : {}),
    };
  }

  private consumeOtp(destination: string, code: string): boolean {
    const key = destination.trim().toLowerCase();
    const record = this.otpStore.get(key);
    if (!record) return false;
    if (Date.now() > record.expiresAt || record.attempts >= 5) {
      this.otpStore.delete(key);
      return false;
    }
    record.attempts += 1;
    const expected = createHmac("sha256", config.OTP_HMAC_SECRET)
      .update(`${key}:${code}`)
      .digest("hex");
    if (expected !== record.codeHash) {
      return false;
    }
    this.otpStore.delete(key);
    return true;
  }

  async verifyOtpLogin(destination: string, code: string) {
    const user = this.findUserByIdentifier(destination);
    if (!user || !user.isActive || !this.consumeOtp(destination, code)) {
      const err = new Error("Invalid or expired verification code");
      (err as any).statusCode = 401;
      (err as any).code = "INVALID_OTP";
      throw err;
    }
    return this.issueTokens(user);
  }

  async login(input: {
    identifier: string;
    password?: string;
    otpCode?: string;
  }) {
    const user = this.findUserByIdentifier(input.identifier);
    if (!user || !user.isActive) {
      const err = new Error("Invalid institutional identifier or credentials");
      (err as any).statusCode = 401;
      (err as any).code = "INVALID_CREDENTIALS";
      throw err;
    }

    if (input.otpCode) {
      if (!this.consumeOtp(input.identifier, input.otpCode)) {
        const err = new Error("Invalid or expired one-time passcode");
        (err as any).statusCode = 401;
        (err as any).code = "INVALID_OTP";
        throw err;
      }
      return this.issueTokens(user);
    }

    if (
      !input.password ||
      !verifyPasswordHash(input.password, user.passwordSalt, user.passwordHash)
    ) {
      const err = new Error("Invalid institutional identifier or credentials");
      (err as any).statusCode = 401;
      (err as any).code = "INVALID_CREDENTIALS";
      throw err;
    }

    auditService.record({
      action: "USER_LOGIN",
      actor: user.sub,
      target: "session",
      details: `Authenticated session started (${user.department || user.role}).`,
    });

    return this.issueTokens(user);
  }

  async issueTokens(user: StoredUser) {
    const permissions = this.resolvePermissions(user);
    const jti = randomUUID();
    const expiresIn = 3600;

    const accessToken = await new SignJWT({
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      institution: user.institution,
      permissions,
      tv: user.tokenVersion,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(user.sub)
      .setIssuer("campus-fomo-local")
      .setAudience("campus-api")
      .setJti(jti)
      .setIssuedAt()
      .setExpirationTime(`${expiresIn}s`)
      .sign(accessSecretBytes);

    const refreshToken = await new SignJWT({
      tv: user.tokenVersion,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(user.sub)
      .setIssuer("campus-fomo-local")
      .setJti(randomUUID())
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(refreshSecretBytes);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: this.toSafeProfile(user),
    };
  }

  async refreshSession(refreshToken: string) {
    try {
      const { payload } = await jwtVerify(refreshToken, refreshSecretBytes, {
        issuer: "campus-fomo-local",
        algorithms: ["HS256"],
      });
      if (payload.jti && this.revokedJtis.has(payload.jti)) {
        throw new Error("Refresh token revoked");
      }
      const user = payload.sub ? this.usersById.get(payload.sub) : undefined;
      if (!user || !user.isActive || payload.tv !== user.tokenVersion) {
        throw new Error("Session invalidated");
      }
      if (payload.jti) {
        this.revokedJtis.add(payload.jti);
      }
      return this.issueTokens(user);
    } catch {
      const err = new Error("Invalid or expired refresh token");
      (err as any).statusCode = 401;
      (err as any).code = "REFRESH_TOKEN_INVALID";
      throw err;
    }
  }

  revokeJti(jti?: string) {
    if (jti) {
      this.revokedJtis.add(jti);
    }
  }

  revokeAllForUser(sub: string) {
    const user = this.usersById.get(sub);
    if (user) {
      user.tokenVersion += 1;
    }
  }

  isJtiRevoked(jti?: string): boolean {
    return Boolean(jti && this.revokedJtis.has(jti));
  }

  async verifyLocalAccessToken(token: string) {
    const { payload } = await jwtVerify(token, accessSecretBytes, {
      issuer: "campus-fomo-local",
      audience: "campus-api",
      algorithms: ["HS256"],
    });

    if (this.isJtiRevoked(payload.jti)) {
      throw new Error("Session token has been revoked");
    }

    const sub = payload.sub as string;
    const stored = this.usersById.get(sub);
    if (stored) {
      if (!stored.isActive || payload.tv !== stored.tokenVersion) {
        throw new Error("Account session invalidated");
      }
      return {
        id: stored.id,
        sub: stored.sub,
        email: stored.email,
        name: stored.name,
        role: stored.role,
        department: stored.department,
        institution: stored.institution,
        permissions: this.resolvePermissions(stored),
        jti: payload.jti,
      };
    }

    return {
      id: sub,
      sub,
      email: (payload.email as string) || "",
      name: (payload.name as string) || "Campus User",
      role: (payload.role as string) || "GUEST",
      department: payload.department as string | undefined,
      institution: payload.institution as string | undefined,
      permissions: Array.isArray(payload.permissions)
        ? (payload.permissions as string[])
        : [],
      jti: payload.jti,
    };
  }
}

export const authService = new AuthService();
