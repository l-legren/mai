import { generateText, stepCountIs, type ToolSet } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { MONIQ_TOOLS } from '../src/tools.ts';
import type { EvalData, SingleTurnResult, MultiTurnEvalData, MultiTurnResult } from './types.ts';
import { buildMessages } from './utils.ts';

// this works like a runner, takes whatever is in our data and executes it
export const singleTurnExecutor = async (data: EvalData): Promise<SingleTurnResult> => {
  const messages = buildMessages(data);

  // No execute here even though MONIQ_TOOLS has real (stubbed) execute bodies — stopWhen(1)
  // means the model gets exactly one turn to pick a tool, it's never actually invoked. That's
  // the point: this tests tool *selection*, not task completion.
  const tools: ToolSet = {};
  for (const toolName of data.tools) {
    const def = MONIQ_TOOLS[toolName];
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
 * Not implemented yet. Unlike singleTurnExecutor, this needs `stopWhen: stepCountIs(N)` with
 * N > 1 and real (or fixture) `execute` bodies on the tools, so the model can see actual tool
 * results and decide what to do next across several steps.
 */
export const multiTurnExecutor = async (_data: MultiTurnEvalData): Promise<MultiTurnResult> => {
  throw new Error('multiTurnExecutor not implemented yet');
};
