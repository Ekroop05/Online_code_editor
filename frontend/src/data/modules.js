export const systemModules = [
  {
    slug: 'extension-market',
    name: 'Extension Market',
    category: 'Marketplace',
    status: 'Ready',
    description:
      'A curated module wall for plugins, packs, and install-ready tools with visible backend integration points.',
    backendHook: 'manifest registry',
    surface: 'hero / marketplace',
  },
  {
    slug: 'live-chat',
    name: 'Live Chat Stream',
    category: 'Collaboration',
    status: 'Live',
    description:
      'Presence, thread history, and inline feedback designed for socket or event-stream driven updates.',
    backendHook: 'chat gateway',
    surface: 'workspace / side rail',
  },
  {
    slug: 'deploy-watch',
    name: 'Deploy Watch',
    category: 'DevOps',
    status: 'Queued',
    description:
      'A status module for previews, checks, and release visibility that backend services can hydrate in real time.',
    backendHook: 'pipeline status',
    surface: 'editor / signal cards',
  },
  {
    slug: 'ai-assist',
    name: 'AI Assist',
    category: 'Productivity',
    status: 'Installed',
    description:
      'A prompt-aware helper surface where completions, actions, and model responses can be supplied later by services.',
    backendHook: 'assistant endpoint',
    surface: 'editor / command palette',
  },
  {
    slug: 'schema-sync',
    name: 'Schema Sync',
    category: 'Data',
    status: 'Ready',
    description:
      'Displays schema activity, migration state, and environment drift for teams working across full stack systems.',
    backendHook: 'schema service',
    surface: 'module board',
  },
]
