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

/**
 * NVIDIA NIM adapter. Uses the OpenAI-compatible Chat Completions endpoint at
 * https://integrate.api.nvidia.com/v1. Requires NVIDIA_API_KEY in env. The
 * --model flag selects any NIM-hosted model by its slug, e.g.
 * `deepseek-ai/deepseek-v3_1-terminus`, `moonshotai/kimi-k2-instruct-0905`,
 * `minimaxai/minimax-m2.7`, `nvidia/nemotron-3-super-120b-a12b`,
 * `nvidia/nemotron-3-nano-30b-a3b`.
 */
export const nim = {
  name: 'nim',
  async complete({ system, user, temperature, model }) {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is not set in the environment.');
    }
    if (!model) {
      throw new Error(
        'nim adapter requires --model (e.g. deepseek-ai/deepseek-v3_1-terminus)'
      );
    }
    const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens: 1024,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`NIM ${resp.status} for ${model}: ${errText.slice(0, 500)}`);
    }
    const data = await resp.json();
    const text = (data.choices?.[0]?.message?.content ?? '').trim();
    return { text };
  },
};

export const adapters = { mock, openai, anthropic, nim };

export function selectAdapter(name) {
  const a = adapters[name];
  if (!a) {
    throw new Error(`unknown adapter: ${name}. Available: ${Object.keys(adapters).join(', ')}`);
  }
  return a;
}
