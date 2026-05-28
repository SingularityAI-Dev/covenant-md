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
        'nim adapter requires --model (e.g. deepseek-ai/deepseek-v4-pro)'
      );
    }

    const body = {
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature,
      max_tokens: 1024,
    };

    // DeepSeek models on NIM expect chat_template_kwargs to control reasoning.
    // For structured-output benches we want the final answer, not reasoning
    // tokens, so disable thinking.
    if (model.toLowerCase().includes('deepseek')) {
      body.chat_template_kwargs = { thinking: false };
    }
    // Kimi K2 Thinking variant is reasoning-mandatory; same pattern if we
    // ever target it. Other kimi-k2-instruct variants do not need the flag.
    if (model.toLowerCase().includes('kimi') && model.toLowerCase().includes('thinking')) {
      body.chat_template_kwargs = { thinking: false };
    }

    // Long cold-starts on large MoE models can exceed undici's default
    // headers timeout. Use an explicit 5-minute abort window.
    // 429s on the free tier are common on sequential calls; retry with
    // exponential backoff up to 6 attempts (waits ~ 1s, 2s, 4s, 8s, 16s, 30s).
    const MAX_ATTEMPTS = 6;
    let attempt = 0;
    while (true) {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 300_000);
      try {
        const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
          signal: ac.signal,
        });
        if (resp.status === 429 && attempt < MAX_ATTEMPTS - 1) {
          const retryAfterHeader = resp.headers.get('retry-after');
          const headerWait = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : 0;
          const backoff = Math.min(30_000, 1000 * 2 ** attempt + Math.random() * 500);
          const wait = Math.max(headerWait, backoff);
          process.stderr.write(`[nim] 429 on ${model}, sleeping ${Math.round(wait)}ms (attempt ${attempt + 1}/${MAX_ATTEMPTS})\n`);
          await new Promise((r) => setTimeout(r, wait));
          attempt += 1;
          continue;
        }
        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`NIM ${resp.status} for ${model}: ${errText.slice(0, 500)}`);
        }
        const data = await resp.json();
        const text = (data.choices?.[0]?.message?.content ?? '').trim();
        return { text };
      } finally {
        clearTimeout(timer);
      }
    }
  },
};

/**
 * OpenRouter adapter. OpenAI-compatible at https://openrouter.ai/api/v1.
 * Requires OPENROUTER_API_KEY. Model slugs use OpenRouter's namespace, e.g.
 * `deepseek/deepseek-v4-flash:free`, `anthropic/claude-sonnet-4.6`,
 * `moonshotai/kimi-k2`. The `:free` suffix selects a free routed variant.
 */
export const openrouter = {
  name: 'openrouter',
  async complete({ system, user, temperature, model }) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set in the environment.');
    }
    if (!model) {
      throw new Error(
        'openrouter adapter requires --model (e.g. deepseek/deepseek-v4-flash:free)'
      );
    }

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 300_000);

    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'HTTP-Referer': 'https://github.com/SingularityAI-Dev/covenant-md',
          'X-Title': 'COVENANT.md bench',
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
        signal: ac.signal,
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`OpenRouter ${resp.status} for ${model}: ${errText.slice(0, 500)}`);
      }
      const data = await resp.json();
      const text = (data.choices?.[0]?.message?.content ?? '').trim();
      return { text };
    } finally {
      clearTimeout(timer);
    }
  },
};

export const adapters = { mock, openai, anthropic, nim, openrouter };

export function selectAdapter(name) {
  const a = adapters[name];
  if (!a) {
    throw new Error(`unknown adapter: ${name}. Available: ${Object.keys(adapters).join(', ')}`);
  }
  return a;
}
