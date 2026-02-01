import { Agent } from '@mastra/core/agent';

export const centeringAgent = new Agent({
    id: 'centering-agent',
    name: 'Centering Analyst',
    instructions: `You are an expert at analyzing trading card centering.

SCORING CRITERIA (0-250 points):
- 245-250: Perfect 50/50 centering
- 230-244: 55/45 centering (Gem Mint)
- 210-229: 60/40 centering (Mint)
- 180-209: 65/35 centering (Near Mint-Mint)

Analyze front and back images. Measure border widths.
Return JSON: {"score": 0-250, "front_lr_ratio": "X/Y", "confidence": 0-1}`,

    model: 'openai/gpt-4-vision-preview',
});