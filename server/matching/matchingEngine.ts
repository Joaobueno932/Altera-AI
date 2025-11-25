import { calculateCompatibility, CompatibilityResult } from "./compatibility";
import { MatchingFeed, FeedSuggestion, InteractionType } from "./matchingFeed";
import { DeepProfile, ProfileBuilder } from "./profileBuilder";

export class MatchingEngine {
  private builder: ProfileBuilder;
  private feed: MatchingFeed;

  constructor(builder = new ProfileBuilder(), feed = new MatchingFeed()) {
    this.builder = builder;
    this.feed = feed;
  }

  async buildProfile(userId: number): Promise<DeepProfile> {
    return this.builder.build(userId);
  }

  async calculatePairCompatibility(userId: number, candidateId: number) {
    const [user, candidate] = await Promise.all([
      this.builder.build(userId),
      this.builder.build(candidateId),
    ]);

    const bias = this.feed.getPreferenceBias(userId);
    const result = calculateCompatibility(user, candidate, bias);

    return { user, candidate, result };
  }

  async suggestMatches(userId: number, candidateIds: number[]): Promise<FeedSuggestion[]> {
    const userProfile = await this.builder.build(userId);
    const bias = this.feed.getPreferenceBias(userId);

    const candidateProfiles = await Promise.all(candidateIds.map(id => this.builder.build(id)));

    const scored = candidateProfiles.map(profile => ({
      profile,
      compatibility: calculateCompatibility(userProfile, profile, bias),
    }));

    return this.feed.buildFeed(userProfile, scored);
  }

  recordInteraction(
    userId: number,
    candidateProfile: DeepProfile,
    type: InteractionType,
    compatibilityScore?: number
  ) {
    const compatibility: CompatibilityResult | undefined =
      compatibilityScore !== undefined
        ? {
            score: compatibilityScore,
            breakdown: {
              bigFive: 0,
              domains: 0,
              themes: 0,
              hobbies: 0,
              conversation: 0,
              emotionalTriggers: 0,
            },
            rationale: [],
          }
        : undefined;

    this.feed.recordInteraction(userId, candidateProfile, type, compatibility);
  }
}
