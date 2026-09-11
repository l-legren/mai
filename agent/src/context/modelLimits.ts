export type ModelLimits = {
  inputLimit: number;
  outputLimit: number;
  contextWindow: number;
  /** Max tokens a single user may consume across all requests to this model per day. */
  dailyLimitPerUser: number;
};

/** Default threshold for context window usage (80%) */
export const DEFAULT_THRESHOLD = 0.8;

/**
 * Model limits registry.
 * Currently only includes the Claude models this agent actually calls.
 */
const MODEL_LIMITS: Record<string, ModelLimits> = {
  'claude-sonnet-5': {
    inputLimit: 2000,
    // Higher than haiku's: adaptive thinking is on by default on Sonnet 5 and its
    // reasoning tokens are billed as output, so this has to cover thinking + reply.
    outputLimit: 6000,
    contextWindow: 50000,
    dailyLimitPerUser: 30000,
  },
  'claude-haiku-4-5': {
    inputLimit: 10000,
    outputLimit: 2000,
    contextWindow: 50000,
    dailyLimitPerUser: 30000,
  },
};

/** Default limits used when the model is not found in the registry. */
const DEFAULT_LIMITS: ModelLimits = {
  inputLimit: 10000,
  outputLimit: 2000,
  contextWindow: 50000,
  dailyLimitPerUser: 15000,
};

/**
 * Get token limits for a specific model.
 * Falls back to default limits if model not found.
 */
export function getModelLimits(model: string): ModelLimits {
  return MODEL_LIMITS[model] ?? DEFAULT_LIMITS;
}

/** Check if token usage exceeds the threshold. */
export function isOverThreshold(
  totalTokens: number,
  contextWindow: number,
  threshold: number = DEFAULT_THRESHOLD
): boolean {
  return totalTokens >= contextWindow * threshold;
}

/** Calculate usage percentage. */
export function calculateUsagePercentage(totalTokens: number, contextWindow: number): number {
  return (totalTokens / contextWindow) * 100;
}
