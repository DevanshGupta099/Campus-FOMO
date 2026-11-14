import { createHash, randomBytes } from "node:crypto";
import { streamHub } from "../stream/stream.routes.js";
import { eventsService } from "../events/events.service.js";
import { auditService } from "../../modules/audit/index.js";

export interface LuckyCampaign {
  id: string;
  eventId: string;
  title: string;
  prizeDescription?: string;
  sponsorBrand?: string;
  status: "OPEN" | "DRAWN" | "CLAIMED" | "REDRAWN";
  seedHash: string;
  seedRevealed?: string;
  winnerSub?: string;
  winnerName?: string;
  winnerDept?: string;
  winnerIndex?: number;
  totalEntries: number;
  claimDeadline?: string;
  createdAt: string;
}

export interface LuckyEntry {
  campaignId: string;
  userSub: string;
  userName: string;
  department: string;
  sessionId: string;
  enteredAt: string;
}

interface IssuedSession {
  campaignId: string;
  userSub: string;
  expiresAt: number;
}

export class LuckyDrawService {
  private campaigns = new Map<string, LuckyCampaign>();
  // Secret seeds are strictly isolated from serialized LuckyCampaign objects until commit-reveal draw executes
  private secretSeeds = new Map<string, string>();
  private entries = new Map<string, LuckyEntry[]>();
  private issuedSessions = new Map<string, IssuedSession>();
  private usedSessions = new Set<string>();

  constructor() {
    this.createCampaign(
      "evt-hackathon-100",
      "Labyrinth Hackathon Cold Brew Voucher Draw",
      "5x INR 500 Third Wave Coffee Central Block Vouchers",
      "Third Wave Coffee — Central Block",
    );
    this.createCampaign(
      "evt-cultural-dance",
      "Dhwani & In-Bloom Front-Row Pit Access Draw",
      "10x Priority Amphitheatre Front-Row Passes",
      "Student Welfare Office (SWO)",
    );
  }

  listCampaigns(): LuckyCampaign[] {
    return Array.from(this.campaigns.values()).map((c) => ({ ...c }));
  }

  getCampaign(id: string): LuckyCampaign | undefined {
    const found = this.campaigns.get(id);
    return found ? { ...found } : undefined;
  }

  private lockPromise: Promise<void> = Promise.resolve();

  private async acquireLock(): Promise<() => void> {
    let release: () => void;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    const currentLock = this.lockPromise;
    this.lockPromise = nextLock;
    await currentLock;
    return release!;
  }

  createCampaign(
    eventId: string,
    title: string,
    prizeDescription = "Official Campus Fest Merch & Partner Perks",
    sponsorBrand = "CHRIST Central Campus Fest",
  ): LuckyCampaign {
    const id = `draw-${randomBytes(6).toString("hex")}`;
    const seedSecret = randomBytes(32).toString("hex");
    const seedHash = createHash("sha256").update(seedSecret).digest("hex");

    const campaign: LuckyCampaign = {
      id,
      eventId,
      title,
      prizeDescription,
      sponsorBrand,
      status: "OPEN",
      seedHash,
      totalEntries: 0,
      createdAt: new Date().toISOString(),
    };

    this.secretSeeds.set(id, seedSecret);
    this.campaigns.set(id, campaign);
    this.entries.set(id, []);
    return campaign;
  }

  createSession(
    campaignId: string,
    userSub: string,
  ): { sessionId: string; campaignId: string } {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "OPEN") {
      throw new Error("Campaign is not accepting entries");
    }

    const sessionId = `sess-${randomBytes(16).toString("hex")}`;
    this.issuedSessions.set(sessionId, {
      campaignId,
      userSub,
      expiresAt: Date.now() + 300_000,
    });
    return { sessionId, campaignId };
  }

  async enterCampaign(params: {
    campaignId: string;
    sessionId: string;
    userSub: string;
    userName: string;
    department: string;
  }): Promise<{ message: string; campaignId: string; totalEntries: number }> {
    const release = await this.acquireLock();
    try {
      const campaign = this.campaigns.get(params.campaignId);
      if (!campaign) throw new Error("Campaign not found");
      if (campaign.status !== "OPEN") throw new Error("Campaign is closed");

      if (!params.sessionId || this.usedSessions.has(params.sessionId)) {
        throw new Error(
          "Session replay rejected: session has already been used",
        );
      }

      const issued = this.issuedSessions.get(params.sessionId);
      if (issued) {
        if (
          issued.campaignId !== params.campaignId ||
          issued.userSub !== params.userSub ||
          Date.now() > issued.expiresAt
        ) {
          throw new Error("Invalid or expired entry session binding");
        }
      }

      const campaignEntries = this.entries.get(params.campaignId) || [];

      const alreadyEntered = campaignEntries.some(
        (e) => e.userSub === params.userSub,
      );
      if (alreadyEntered) {
        throw new Error(
          "UNIQUE constraint violated: User has already entered this lucky draw",
        );
      }

      this.usedSessions.add(params.sessionId);
      this.issuedSessions.delete(params.sessionId);

      const entry: LuckyEntry = {
        campaignId: params.campaignId,
        userSub: params.userSub,
        userName: params.userName,
        department: params.department,
        sessionId: params.sessionId,
        enteredAt: new Date().toISOString(),
      };
      campaignEntries.push(entry);
      this.entries.set(params.campaignId, campaignEntries);
      campaign.totalEntries = campaignEntries.length;

      eventsService.awardXp(
        params.userSub,
        25,
        `Entered lucky draw: ${campaign.title}`,
      );

      return {
        message: "Successfully entered lucky draw",
        campaignId: params.campaignId,
        totalEntries: campaign.totalEntries,
      };
    } finally {
      release();
    }
  }

  executeDraw(campaignId: string): LuckyCampaign {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "OPEN") throw new Error("Campaign cannot be drawn");

    const campaignEntries = this.entries.get(campaignId) || [];
    if (campaignEntries.length === 0) {
      throw new Error("Cannot execute draw with 0 participants");
    }

    const secret = this.secretSeeds.get(campaignId);
    if (!secret) {
      throw new Error("Cryptographic seed missing for campaign");
    }

    campaign.seedRevealed = secret;

    const sorted = [...campaignEntries].sort((a, b) =>
      a.userSub.localeCompare(b.userSub),
    );

    const drawHash = createHash("sha256")
      .update(`${campaign.seedRevealed}:${sorted.length}`)
      .digest("hex");
    const winnerIndex = Number(BigInt(`0x${drawHash}`) % BigInt(sorted.length));
    const winner = sorted[winnerIndex];

    campaign.status = "DRAWN";
    campaign.winnerIndex = winnerIndex;
    campaign.winnerSub = winner.userSub;
    campaign.winnerName = winner.userName.split(" ")[0];
    campaign.winnerDept = winner.department;
    campaign.claimDeadline = new Date(Date.now() + 86_400_000).toISOString();

    eventsService.awardXp(
      winner.userSub,
      200,
      `Won lucky draw prize: ${campaign.title}`,
    );

    auditService.record({
      action: "LUCKY_DRAW_EXECUTED",
      actor: "system:commit-reveal",
      target: campaignId,
      details: `Revealed SHA-256 seed and selected index #${winnerIndex} of ${sorted.length} entries (${campaign.winnerName}, ${campaign.winnerDept}).`,
    });

    streamHub.broadcast("luckydraw.completed", {
      campaignId: campaign.id,
      title: campaign.title,
      winnerName: campaign.winnerName,
      winnerDept: campaign.winnerDept,
    });

    return { ...campaign };
  }

  verifyDraw(campaignId: string) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status === "OPEN" || !campaign.seedRevealed) {
      throw new Error("Campaign has not been drawn yet");
    }

    const campaignEntries = this.entries.get(campaignId) || [];
    const sorted = [...campaignEntries].sort((a, b) =>
      a.userSub.localeCompare(b.userSub),
    );
    const recomputedHash = createHash("sha256")
      .update(campaign.seedRevealed)
      .digest("hex");
    const hashMatch = recomputedHash === campaign.seedHash;

    const drawHash = createHash("sha256")
      .update(`${campaign.seedRevealed}:${sorted.length}`)
      .digest("hex");
    const calculatedWinnerIndex = Number(
      BigInt(`0x${drawHash}`) % BigInt(sorted.length),
    );

    return {
      campaignId,
      seedHash: campaign.seedHash,
      seedRevealed: campaign.seedRevealed,
      isSeedValid: hashMatch,
      totalEntries: sorted.length,
      winnerIndex: campaign.winnerIndex,
      isWinnerIndexExact: calculatedWinnerIndex === campaign.winnerIndex,
      winnerFirstname: campaign.winnerName?.split(" ")[0],
      winnerDepartment: campaign.winnerDept,
      verificationFormula:
        "BigInt('0x' + sha256(seedRevealed + ':' + totalEntries)) % BigInt(totalEntries)",
    };
  }
}

export const luckyDrawService = new LuckyDrawService();
