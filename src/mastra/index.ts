import { Observability, DefaultExporter, CloudExporter, SensitiveDataFilter } from '@mastra/observability';
import { orchestrator } from './agents/orchestrator';
import { cardResearchOrchestrator } from './agents/card-research-orchestrator';
import { edgesAgent } from "./agents/edges";
import { cornersAgent } from "./agents/corners";
import { centeringAgent } from "./agents/centering";
import { surfaceAgent } from "./agents/surface";
import { qaConsensusAgent } from "./agents/qa-consensus";
import { cardResearchAgent } from "./agents/card-research";
import { LibSQLStore} from "@mastra/libsql";
import {Mastra} from "@mastra/core";
import {PinoLogger} from "@mastra/loggers";

export const mastra = new Mastra({
  agents: {
    // Orchestrators
    orchestrator,                // Full grading flow (14 photos)
    cardResearchOrchestrator,    // Quick Add flow (1-2 photos)
    // Specialist agents
    edgesAgent,
    cornersAgent,
    centeringAgent,
    surfaceAgent,
    qaConsensusAgent,
    cardResearchAgent
  },
  storage: new LibSQLStore({ id: 'mnty-grading-storage', url: 'file:../../mastra.db'}),
  logger: new PinoLogger({
    name: 'mnty Grading',
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
