/**
 * जिज्ञासा engine entry point — the ONE module the UI loads, and it loads it
 * lazily (`useAsk.ts` → dynamic `import('./engine')`). Everything heavy (the
 * registries, the panchang engine) hangs off this file, so nothing under
 * `src/ask/` except `types.ts` and `useAsk.ts` may be reached statically from
 * the launch graph — `launchPath.test.ts` pins that.
 */
import { INTENTS, exampleQuestions } from './intents';
import { getAskLexicon } from './lexicon';
import { prepareIntents, resolveAsk, looksLikeQuestion } from './resolve';
import type { AskContext, AskResolution, Localized } from './types';

let prepared: ReturnType<typeof prepareIntents> | null = null;

function intents() {
  if (!prepared) prepared = prepareIntents(INTENTS);
  return prepared;
}

/** Build the lexicon + fold the triggers now, so the first keystroke is free. */
export function warmAsk(): void {
  getAskLexicon();
  intents();
}

export function askQuestion(question: string, ctx: AskContext): AskResolution {
  return resolveAsk(question, ctx, getAskLexicon(), intents());
}

export { looksLikeQuestion };

export function askExamples(): Localized[] {
  return exampleQuestions();
}

export type AskEngine = {
  askQuestion: typeof askQuestion;
  looksLikeQuestion: typeof looksLikeQuestion;
  askExamples: typeof askExamples;
  warmAsk: typeof warmAsk;
};

export const engine: AskEngine = { askQuestion, looksLikeQuestion, askExamples, warmAsk };
