# Card Grading - Mastra.ai Project

This is a proper Mastra.ai project using their latest framework.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Add your OPENAI_API_KEY and ANTHROPIC_API_KEY

# Start development server
npm run dev

# Deploy to Mastra Cloud
npm run deploy
```

## 📁 Project Structure

```
.
├── mastra.config.ts          # Mastra configuration
├── src/
│   ├── agents/               # AI Agents
│   │   ├── centering.agent.ts
│   │   └── corners.agent.ts
│   ├── workflows/            # Workflows
│   │   └── grading.workflow.ts
│   └── index.ts              # Main exports
├── package.json
└── .env.example
```

## 🔧 Configuration

The project uses Mastra's latest structure with:
- Agents in `src/agents/`
- Workflows in `src/workflows/`
- Configuration in `mastra.config.ts`

## 📝 Environment Variables

```bash
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
```

## 🤖 Agents

- **Centering Agent**: Analyzes card centering (GPT-4 Vision)
- **Corners Agent**: Analyzes corners for wear (Claude 3.5)

## 🔄 Workflows

- **Card Grading Workflow**: Orchestrates all agents for complete grading

## 🚀 Deployment

```bash
# Deploy to Mastra Cloud
npm run deploy

# Or use Mastra CLI
mastra deploy
```

## 📚 Documentation

- [Mastra Docs](https://docs.mastra.ai)
- [Agent Documentation](https://docs.mastra.ai/agents)
- [Workflow Documentation](https://docs.mastra.ai/workflows)

## ⚠️ Note

This uses Mastra's current framework structure. Make sure you have:
1. Mastra CLI installed (`npm install -g @mastra/cli`)
2. Mastra account created
3. API keys for OpenAI and Anthropic

## 🐛 Troubleshooting

If you get package errors:
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstall
npm install
```

If Mastra deploy fails:
```bash
# Check Mastra CLI version
mastra --version

# Update Mastra
npm install -g @mastra/cli@latest
```
