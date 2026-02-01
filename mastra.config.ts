import { Mastra, createLogger, LogLevel } from '@mastra/core';

export const mastra = new Mastra({
  name: 'card-grading',
  logger: createLogger({
    type: 'CONSOLE',
    level: LogLevel.INFO,
  }),
  agents: {
    agentsDir: './src/agents',
  },
  workflows: {
    workflowsDir: './src/workflows',
  },
});
