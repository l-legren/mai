import { generateText, stepCountIs, tool, type ModelMessage, type ToolSet } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { createMaiTools } from '../src/tools.ts';
import type {
  EvalData,
  SingleTurnResult,
  MockToolConfig,
  MultiTurnEvalData,
  MultiTurnResult,
} from './types.ts';
import { buildMessages } from './utils.ts';

const DEFAULT_MULTI_TURN_MAX_STEPS = 4;

/**
 * Builds a fixture `ToolSet` from `MockToolConfig`s: same description/shape the model sees in
 * production, but `execute` always returns the fixed `mockReturn` — no real DB/tool-loop
 * dependency, so these evals stay deterministic and don't need `MCP_READONLY_DATABASE_URL` set.
 * Every param is a plain string per `MockToolConfig`'s own "simplified" contract — the model still
 * has to choose which params to fill in, so tool-selection behaviour is exercised the same way.
 */
function buildMockTools(mockTools: Record<string, MockToolConfig>): ToolSet {
  const tools: ToolSet = {};
  for (const [name, config] of Object.entries(mockTools)) {
    const shape: Record<string, ReturnType<typeof z.string>> = {};
    for (const paramName of Object.keys(config.parameters)) {
      shape[paramName] = z.string();
    }
    tools[name] = tool({
      description: config.description,
      inputSchema: z.object(shape),
      execute: async () => config.mockReturn,
    });
  }
  return tools;
}

// Fixture user id/date for tool-selection evals only — stopWhen(1) means no tool's `execute` body
// ever actually runs here, so what `createMaiTools` closes over doesn't matter.
const EVAL_FIXTURE_USER_ID = 'eval-fixture-user';
const EVAL_FIXTURE_TODAY = '2026-01-01';

// this works like a runner, takes whatever is in our data and executes it
export const singleTurnExecutor = async (data: EvalData): Promise<SingleTurnResult> => {
  const messages = buildMessages(data);

  // No execute here even though getRecentSpending has a real execute body — stopWhen(1) means
  // the model gets exactly one turn to pick a tool, it's never actually invoked. That's the
  // point: this tests tool *selection*, not task completion.
  const allTools = createMaiTools(EVAL_FIXTURE_USER_ID, EVAL_FIXTURE_TODAY);
  const tools: ToolSet = {};
  for (const toolName of data.tools) {
    const def = allTools[toolName];
    if (def) tools[toolName] = def;
  }

  const { toolCalls } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    messages,
    tools,
    stopWhen: stepCountIs(1),
    temperature: data.config?.temperature ?? undefined,
  });

  const calls = toolCalls.map((call) => ({
    toolName: call.toolName,
    args: 'args' in call ? call.args : {},
  }));

  const toolNames = calls.map((call) => call.toolName);

  return {
    toolCalls: calls,
    toolNames,
    selectedAny: calls.length > 0,
  };
};

/**
 * Runs a full multi-*step* tool-calling turn against fixture tools (see `buildMockTools`), so a
 * case can assert on the model's final grounded answer — not just which tool it picked, but
 * whether it used the tool's result correctly (e.g. didn't invent a number the mock never
 * returned). Supports both a fresh `prompt` and a pre-filled `messages` transcript.
 */
export const multiTurnExecutor = async (data: MultiTurnEvalData): Promise<MultiTurnResult> => {
  const messages: ModelMessage[] =
    data.messages ?? (data.prompt ? [{ role: 'user', content: data.prompt }] : []);

  const { text, steps } = await generateText({
    model: anthropic(data.config?.model ?? 'claude-haiku-4-5'),
    messages,
    tools: buildMockTools(data.mockTools),
    stopWhen: stepCountIs(data.config?.maxSteps ?? DEFAULT_MULTI_TURN_MAX_STEPS),
  });

  const resultSteps = steps.map((step) => ({
    toolCalls: step.toolCalls.map((call) => ({ toolName: call.toolName, args: call.input })),
    toolResults: step.toolResults.map((result) => ({
      toolName: result.toolName,
      result: result.output,
    })),
    text: step.text,
  }));

  const toolCallOrder = steps.flatMap((step) => step.toolCalls.map((call) => call.toolName));

  return {
    text,
    steps: resultSteps,
    toolsUsed: [...new Set(toolCallOrder)],
    toolCallOrder,
  };
};
