import { eq } from "drizzle-orm";
import { brainInsights } from "../../drizzle/schema";
import { SecondBrainStore } from "../secondBrain/store";
import { BrainDomainName, DomainState } from "../secondBrain/domains";
import { CoreProfile } from "../secondBrain/core";
import { getDb } from "../db";

export type DeepProfile = {
  userId: number;
  core: CoreProfile;
  domains: Record<BrainDomainName, DomainState>;
  activeDomains: BrainDomainName[];
  recurringThemes: string[];
  hobbies: string[];
  interests: string[];
  conversationStyle: string[];
  emotionalTriggers: string[];
  recentTopics: string[];
};

export class ProfileBuilder {
  private store: SecondBrainStore;

  constructor(store: SecondBrainStore = new SecondBrainStore()) {
    this.store = store;
  }

  async build(userId: number): Promise<DeepProfile> {
    const [core, domains, recentMessages, insights] = await Promise.all([
      this.store.getCore(userId),
      this.store.getDomains(userId),
      this.store.listRecentMessages(userId, 50),
      this.fetchInsights(userId),
    ]);

    const activeDomains = Object.values(domains)
      .filter(domain => domain.active)
      .map(domain => domain.name);

    const recurringThemes = this.extractThemes(core, insights, activeDomains);
    const hobbies = this.extractHobbies(core, insights);
    const interests = this.extractInterests(core, insights, activeDomains);
    const conversationStyle = this.deriveConversationStyle(core, recentMessages);
    const emotionalTriggers = this.deriveEmotionalTriggers(insights, recentMessages);
    const recentTopics = this.extractRecentTopics(recentMessages, insights);

    return {
      userId,
      core,
      domains,
      activeDomains,
      recurringThemes,
      hobbies,
      interests,
      conversationStyle,
      emotionalTriggers,
      recentTopics,
    };
  }

  private async fetchInsights(userId: number): Promise<Array<{ category: string; label: string }>> {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select({ category: brainInsights.category, label: brainInsights.label })
      .from(brainInsights)
      .where(eq(brainInsights.userId, userId))
      .orderBy(brainInsights.id);

    return rows;
  }

  private extractThemes(
    core: CoreProfile,
    insights: Array<{ category: string; label: string }>,
    activeDomains: BrainDomainName[]
  ): string[] {
    const themeSignals = insights
      .filter(item => item.category === "theme")
      .map(item => item.label);

    const domainThemes = activeDomains.map(domain => `domínio:${domain}`);
    const behaviorThemes = [...core.behavior.habits, ...core.behavior.preferences];

    return unique([...themeSignals, ...domainThemes, ...behaviorThemes]);
  }

  private extractHobbies(
    core: CoreProfile,
    insights: Array<{ category: string; label: string }>
  ): string[] {
    const hobbyLike = insights
      .filter(item => item.category === "habit" || item.category === "preference")
      .map(item => item.label);

    const fromPreferences = core.behavior.preferences
      .filter(pref => /jogar|música|esporte|ler|cozinhar|arte|hobby/i.test(pref))
      .map(pref => pref.toLowerCase());

    return unique([...hobbyLike, ...fromPreferences]);
  }

  private extractInterests(
    core: CoreProfile,
    insights: Array<{ category: string; label: string }>,
    activeDomains: BrainDomainName[]
  ): string[] {
    const interestSignals = insights
      .filter(item => item.category === "domain" || item.category === "preference")
      .map(item => item.label.toLowerCase());

    const identityStatements = core.identity.statements.map(statement => statement.toLowerCase());
    const goals = core.lifeContext.goals.map(goal => goal.toLowerCase());

    const domainLabels = activeDomains.map(domain => domain.toString());

    return unique([...interestSignals, ...identityStatements, ...goals, ...domainLabels]);
  }

  private deriveConversationStyle(
    core: CoreProfile,
    recentMessages: Array<{ content: string }>
  ): string[] {
    const style: string[] = [];

    if (core.bigFive.extraversion >= 60) style.push("gosta de conversas dinâmicas");
    if (core.bigFive.agreeableness >= 60) style.push("prefere tom acolhedor");
    if (core.bigFive.conscientiousness >= 60) style.push("organiza ideias em passos");
    if (core.bigFive.openness >= 60) style.push("aprecia explorar possibilidades");
    if (core.bigFive.neuroticism >= 60) style.push("valoriza segurança e previsibilidade");

    const detectedTone = recentMessages
      .flatMap(message => (message.content.match(/!|\?|\./g) ?? []))
      .filter(Boolean);

    if (detectedTone.length > 10) style.push("engaja com pontuações e ênfases");

    return unique(style);
  }

  private deriveEmotionalTriggers(
    insights: Array<{ category: string; label: string }>,
    recentMessages: Array<{ content: string }>
  ): string[] {
    const emotionSignals = insights
      .filter(item => item.category === "emotion")
      .map(item => item.label.toLowerCase());

    const stressMarkers = recentMessages
      .filter(message => /ansiedade|stress|preocupação|cansado|exausto/i.test(message.content))
      .map(() => "stress/contexto");

    const excitementMarkers = recentMessages
      .filter(message => /empolgado|animado|feliz|grato/i.test(message.content))
      .map(() => "entusiasmo/novidade");

    return unique([...emotionSignals, ...stressMarkers, ...excitementMarkers]);
  }

  private extractRecentTopics(
    recentMessages: Array<{ content: string }>,
    insights: Array<{ category: string; label: string }>
  ): string[] {
    const topicKeywords = recentMessages
      .flatMap(message => message.content.split(/[,.;\n]/))
      .map(part => part.trim())
      .filter(part => part.length > 4)
      .slice(-10);

    const insightTopics = insights
      .filter(item => item.category === "domain" || item.category === "theme")
      .map(item => item.label.toLowerCase());

    return unique([...topicKeywords, ...insightTopics]);
  }
}

const unique = (values: string[]): string[] => Array.from(new Set(values.filter(Boolean)));
