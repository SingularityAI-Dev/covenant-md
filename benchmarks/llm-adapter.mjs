// LLM adapter interface for the COVENANT.md bench harness.
//
// Each adapter exports an async `complete({ system, user, temperature }) -> { text }`.
// The harness selects an adapter via the --adapter flag.

/**
 * Deterministic mock adapter. Used by the smoke test and by anyone who wants
 * to exercise the harness without API credits. Returns a fixed plausible
 * structured response so the scorer's parsing path is exercised.
 */
export const mock = {
  name: 'mock',
  async complete({ user }) {
    // Echo a JSON-shaped response that claims an operation and an output.
    // Picks the first operation name found in the prompt, defaulting to 'render'.
    const opMatch = user.match(/- name: ([a-z][a-z0-9_-]*)/);
    const op = opMatch ? opMatch[1] : 'render';
    const text = [
      '```json',
      JSON.stringify(
        {
          operation: op,
          output: { success: true },
        },
        null,
        2
      ),
      '```',
    ].join('\n');
    return { text };
  },
};

/**
 * Stub for the OpenAI adapter. Wire up the real call before a real publish.
 */
export const openai = {
  name: 'openai',
  async complete() {
    throw new Error(
      'openai adapter not wired in this release. Add the API call here (env OPENAI_API_KEY) and remove this throw.'
    );
  },
};

/**
 * Anthropic adapter. Requires ANTHROPIC_API_KEY in env. Default model is
 * claude-sonnet-4-6; override with --model on the run command.
 */
export const anthropic = {
  name: 'anthropic',
  async complete({ system, user, temperature, model = 'claude-sonnet-4-6' }) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in the environment.');
    }
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model,
      max_tokens: 1024,
      system,
      temperature,
      messages: [{ role: 'user', content: user }],
    });
    const text = resp.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();
    return { text };
  },
};

export const adapters = { mock, openai, anthropic };

export function selectAdapter(name) {
  const a = adapters[name];
  if (!a) {
    throw new Error(`unknown adapter: ${name}. Available: ${Object.keys(adapters).join(', ')}`);
  }
  return a;
}
