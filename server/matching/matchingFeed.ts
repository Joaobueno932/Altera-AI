import { BrainDomainName } from "../secondBrain/domains";
import { DeepProfile } from "./profileBuilder";
import { CompatibilityResult } from "./compatibility";

export type InteractionType = "view" | "like" | "pass";

export type InteractionRecord = {
  targetId: number;
  type: InteractionType;
  timestamp: number;
  compatibility?: number;
  notes?: string;
};

export type FeedSuggestion = {
  userId: number;
  score: number;
  rationale: string[];
  feedPreview: string;
};

export type PreferenceBias = {
  preferredDomains: Partial<Record<BrainDomainName, number>>;
  favoredInterests: Partial<Record<string, number>>;
  conversationTone: Partial<Record<string, number>>;
};

type UserMemory = {
  seen: Set<number>;
  interactions: InteractionRecord[];
  liked: number[];
  passed: number[];
  featureTally: {
    domains: Partial<Record<BrainDomainName, number>>;
    interests: Partial<Record<string, number>>;
    conversation: Partial<Record<string, number>>;
  };
};

export class MatchingFeed {
  private memory: Map<number, UserMemory> = new Map();

  getHistory(userId: number): UserMemory {
    if (!this.memory.has(userId)) {
      this.memory.set(userId, {
        seen: new Set(),
        interactions: [],
        liked: [],
        passed: [],
        featureTally: { domains: {}, interests: {}, conversation: {} },
      });
    }

    return this.memory.get(userId)!;
  }

  rememberSuggestions(userId: number, suggestions: number[]): void {
    const history = this.getHistory(userId);
    suggestions.forEach(id => history.seen.add(id));
  }

  recordInteraction(
    userId: number,
    candidate: DeepProfile,
    type: InteractionType,
    compatibility?: CompatibilityResult
  ): void {
    const history = this.getHistory(userId);
    const timestamp = Date.now();

    history.interactions.push({ targetId: candidate.userId, type, timestamp, compatibility: compatibility?.score });

    if (type === "like") {
      history.liked.push(candidate.userId);
      this.updateFeatureTally(history, candidate, 1);
    }

    if (type === "pass") {
      history.passed.push(candidate.userId);
      this.updateFeatureTally(history, candidate, -0.5);
    }
  }

  getPreferenceBias(userId: number): PreferenceBias {
    const history = this.getHistory(userId);
    return {
      preferredDomains: history.featureTally.domains,
      favoredInterests: history.featureTally.interests,
      conversationTone: history.featureTally.conversation,
    };
  }

  buildFeed(
    user: DeepProfile,
    candidates: Array<{ profile: DeepProfile; compatibility: CompatibilityResult }>
  ): FeedSuggestion[] {
    const history = this.getHistory(user.userId);

    const filtered = candidates.filter(
      item => item.profile.userId !== user.userId && !history.seen.has(item.profile.userId)
    );

    const ranked = filtered
      .map(item => ({
        userId: item.profile.userId,
        score: item.compatibility.score,
        rationale: item.compatibility.rationale,
        feedPreview: this.buildPreview(item.profile, item.compatibility),
      }))
      .sort((a, b) => b.score - a.score || a.userId - b.userId);

    this.rememberSuggestions(user.userId, ranked.map(item => item.userId));

    return ranked;
  }

  private buildPreview(profile: DeepProfile, compatibility: CompatibilityResult): string {
    const domainSnippet = profile.activeDomains.slice(0, 2).join(", ") || "interesses diversos";
    const themeSnippet = profile.recurringThemes.slice(0, 2).join(", ") || "temas variados";
    const reasonSnippet = compatibility.rationale[0] ?? "Alinhamento de valores detectado";

    return `Domínios: ${domainSnippet}. Temas: ${themeSnippet}. ${reasonSnippet}.`;
  }

  private updateFeatureTally(history: UserMemory, candidate: DeepProfile, weight: number): void {
    candidate.activeDomains.forEach(domain => {
      history.featureTally.domains[domain] = (history.featureTally.domains[domain] ?? 0) + weight;
    });

    candidate.interests.forEach(interest => {
      history.featureTally.interests[interest] = (history.featureTally.interests[interest] ?? 0) + weight;
    });

    candidate.conversationStyle.forEach(tone => {
      history.featureTally.conversation[tone] = (history.featureTally.conversation[tone] ?? 0) + weight * 0.5;
    });
  }
}
