import 'dotenv/config';
import { Laminar } from '@lmnr-ai/lmnr';

// Side-effect import, not a function called from server.ts's own body — must run before `./run.ts`
// (and the LangChain/LangGraph modules it pulls in) are first loaded, or Laminar's auto-instrumentation
// has nothing left to patch. ES module imports execute in source order, so the only guarantee is
// `import './observability.ts'` appearing above `import './run.ts'` in server.ts.
export function initializeObservability(apiKey: string | undefined): void {
  if (!apiKey) {
    console.log('observability: LMNR_PROJECT_API_KEY not set, Laminar tracing disabled');
    return;
  }
  Laminar.initialize({ projectApiKey: apiKey });
}

initializeObservability(process.env.LMNR_PROJECT_API_KEY);
