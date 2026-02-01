import { Agent } from '@mastra/core/agent';

export const cornersAgent = new Agent({
    id: 'corners-agent',
    name: 'Corners Analyst',
    instructions: `Analyze 8 trading card corners (4 front, 4 back).

Each corner scored 0-62.5 points:
- Sharpness: 0-25 points
- Whitening: 0-25 points  
- Structural: 0-12.5 points

Total: 0-250 points (sum of all 8 corners).
Return JSON with all corner details.`,

    model: 'anthropic/claude-3-5-sonnet-20241022',
});