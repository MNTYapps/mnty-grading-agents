// mastra.config.ts
// Configuration for mnty x card grading AI agents
import { config } from 'dotenv';

config();

export const mastraConfig = {
  name: 'mnty-x-card-grading',
  version: '1.0.0',
  
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
      models: {
        'gpt-4-turbo': 'gpt-4-turbo-2024-04-09',
        'gpt-4-vision': 'gpt-4-vision-preview',
      }
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY!,
      models: {
        'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
      }
    },
  },
  
  environment: process.env.MASTRA_ENVIRONMENT || 'development',
};

export default mastraConfig;
