import { Agent } from '@mastra/core/agent';

export const edgesAgent = new Agent({
    id: 'edges-agent',
    name: 'Edges Analyst',
    instructions: `Analyze 4 trading card edges (top, bottom, left, right).

Each edge scored 0-62.5 points:
- Smoothness: 0-30 points
- Whitening: 0-20 points
- Chipping: 0-12.5 points

Total: 0-250 points (sum of all 4 edges).
Return JSON with all edge details.`,

    model: 'anthropic/claude-3-5-sonnet-20241022',
});