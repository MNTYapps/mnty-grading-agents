// mastra.config.ts
import { defineConfig } from '@mastra/core';
import { openai, anthropic } from '@mastra/integrations';

export default defineConfig({
  name: 'mnty-x-card-grading',
  version: '1.0.0',
  
  integrations: [
    openai({
      apiKey: process.env.OPENAI_API_KEY!,
    }),
    anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    }),
  ],
  
  agents: './agents',
  tools: './tools',
  workflows: './workflows',
  
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
  },
  
  deployment: {
    provider: 'mastra-cloud',
    region: 'us-east-1',
  },
});
