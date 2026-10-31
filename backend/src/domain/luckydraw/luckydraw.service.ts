import { createHash, randomBytes } from "node:crypto";

export interface LuckyCampaign {
  id: string;
  eventId: string;
  title: string;
  status: "OPEN" | "DRAWN" | "CLAIMED" | "REDRAWN";
  seedHash: string;
  seedSecret: string; // Held secretly until draw
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

export class LuckyDrawService {
  private campaigns = new Map<string, LuckyCampaign>();
  private entries = new Map<string, LuckyEntry[]>(); // campaignId -> entries
  private usedSessions = new Set<string>();

  constructor() {
    // Seed initial promotional campaign for hackathon
    this.createCampaign(
      "evt-hackathon-100",
      "Fest Hackathon Free Cold Brew Lucky Draw (Third Wave Coffee)",
    );
  }

  listCampaigns(): LuckyCampaign[] {
    return Array.from(this.campaigns.values());
  }

  getCampaign(id: string): LuckyCampaign | undefined {
    return this.campaigns.get(id);
  }

  // Lock primitive for strict sequential atomicity during concurrency tests
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

  createCampaign(eventId: string, title: string): LuckyCampaign {
    const id = `draw-${randomBytes(6).toString("hex")}`;
    const seedSecret = randomBytes(32).toString("hex");
    const seedHash = createHash("sha256").update(seedSecret).digest("hex");

    const campaign: LuckyCampaign = {
      id,
      eventId,
      title,
      status: "OPEN",
      seedHash,
      seedSecret,
      totalEntries: 0,
      createdAt: new Date().toISOString(),
    };

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
    if (campaign.status !== "OPEN")
      throw new Error("Campaign is not accepting entries");

    const sessionId = `sess-${randomBytes(16).toString("hex")}`;
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

      // Session replay check
      if (this.usedSessions.has(params.sessionId)) {
        throw new Error(
          "Session replay rejected: session has already been used",
        );
      }

      const campaignEntries = this.entries.get(params.campaignId) || [];

      // UNIQUE: one entry per user per campaign
      const alreadyEntered = campaignEntries.some(
        (e) => e.userSub === params.userSub,
      );
      if (alreadyEntered) {
        throw new Error(
          "UNIQUE constraint violated: User has already entered this lucky draw",
        );
      }

      this.usedSessions.add(params.sessionId);
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

    // Reveal seed
    campaign.seedRevealed = campaign.seedSecret;

    // Cryptographic commit-reveal selection
    // Sort entries deterministically by userSub
    const sorted = [...campaignEntries].sort((a, b) =>
      a.userSub.localeCompare(b.userSub),
    );

    // Winner index = Number(BigInt("0x" + sha256(seed + count)) % BigInt(count))
    const drawHash = createHash("sha256")
      .update(`${campaign.seedRevealed}:${sorted.length}`)
      .digest("hex");
    const winnerIndex = Number(BigInt(`0x${drawHash}`) % BigInt(sorted.length));
    const winner = sorted[winnerIndex];

    campaign.status = "DRAWN";
    campaign.winnerIndex = winnerIndex;
    campaign.winnerSub = winner.userSub;
    campaign.winnerName = winner.userName;
    campaign.winnerDept = winner.department;
    campaign.claimDeadline = new Date(Date.now() + 86400000).toISOString(); // 24 hours

    return campaign;
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
      verificationFormula: "BigInt(sha256(seed + totalEntries)) % totalEntries",
    };
  }
}

export const luckyDrawService = new LuckyDrawService();
