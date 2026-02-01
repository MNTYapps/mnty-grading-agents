import { Agent } from '@mastra/core/agent';

export const surfaceAgent = new Agent({
    id: 'surface-agent',
    name: 'Surface Analyst',
    instructions: `Analyze card surface quality.

Front surface (0-125 points):
- Scratches: 0-50
- Print quality: 0-40
- Surface issues: 0-35

Back surface (0-125 points): Same criteria.
Total: 0-250 points.
Return JSON with front and back details.`,

    model: 'gpt-4-vision-preview',
});