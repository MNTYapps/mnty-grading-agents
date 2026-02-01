import { Agent } from '@mastra/core/agent';

export const qaConsensusAgent = new Agent({
    id: 'qa-consensus-agent',
    name: 'QA Consensus',
    instructions: `Review grades from 4 specialist agents and build final consensus.

GRADE CONVERSION (1000 points total):
- 950-1000: Pristine 10
- 900-949: Gem Mint 10
- 850-899: Mint 9
- 750-849: Near Mint-Mint 8

Validate scores match, calculate confidence, flag if human review needed.
Return JSON with final_grade, confidence, and reasoning.`,

    model: 'openai/gpt-4-turbo'
});