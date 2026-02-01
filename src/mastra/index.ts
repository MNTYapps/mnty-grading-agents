import { Observability, DefaultExporter, CloudExporter, SensitiveDataFilter } from '@mastra/observability';
import { orchestrator } from './agents/orchestrator';
import { edgesAgent } from "./agents/edges";
import { cornersAgent } from "./agents/corners";
import { centeringAgent } from "./agents/centering";
import { surfaceAgent } from "./agents/surface";
import { qaConsensusAgent } from "./agents/qa-consensus";
import {Mastra} from "@mastra/core";
import {PinoLogger} from "@mastra/loggers";

export const mastra = new Mastra({
  agents: { orchestrator, edgesAgent, cornersAgent, centeringAgent, surfaceAgent, qaConsensusAgent },

  logger: new PinoLogger({
    name: 'Mastra',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new DefaultExporter(), // Persists traces to storage for Mastra Studio
          new CloudExporter(), // Sends traces to Mastra Cloud (if MASTRA_CLOUD_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});
