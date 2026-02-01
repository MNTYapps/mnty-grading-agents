# Mastra.ai Deployment Guide

## 🚀 Quick Deploy to Mastra Cloud

### 1. Setup

```bash
# Install Mastra CLI
npm install -g @mastra/cli

# Login to Mastra
mastra login

# Navigate to project
cd mastra-project
```

### 2. Initialize Project

```bash
# Initialize Mastra project
mastra init

# This will:
# - Detect agents, tools, workflows
# - Generate deployment config
# - Create .mastra/ directory
```

### 3. Configure Environment

```bash
# Set environment variables
mastra secrets set OPENAI_API_KEY=sk-...
mastra secrets set ANTHROPIC_API_KEY=sk-ant-...

# Or use .env file (not recommended for production)
cp .env.example .env
# Edit .env with your keys
```

### 4. Deploy

```bash
# Deploy to Mastra Cloud
mastra deploy

# Or specify environment
mastra deploy --env production

# Deploy specific agents
mastra deploy --agents centering-analyst,corners-analyst

# Deploy with tags
mastra deploy --tag v1.0.0
```

### 5. Verify Deployment

```bash
# List deployed agents
mastra agents list

# Test an agent
mastra test centering-analyst --input test-data.json

# View logs
mastra logs centering-analyst --tail

# Check status
mastra status
```

## 🔧 Configuration Options

### mastra.config.ts

```typescript
export default defineConfig({
  name: 'mnty-x-card-grading',
  version: '1.0.0',
  
  deployment: {
    provider: 'mastra-cloud',
    region: 'us-east-1',
    
    // Scaling
    scaling: {
      minInstances: 1,
      maxInstances: 10,
      targetCPU: 70,
    },
    
    // Timeouts
    timeout: 180000, // 3 minutes
    
    // Memory
    memory: '2GB',
    
    // Environment
    environment: process.env.MASTRA_ENVIRONMENT || 'production',
  },
  
  // Monitoring
  monitoring: {
    enabled: true,
    logLevel: 'info',
    sentry: {
      dsn: process.env.SENTRY_DSN,
    },
  },
  
  // Rate limiting
  rateLimit: {
    enabled: true,
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000,
  },
});
```

## 🌍 Deployment Environments

### Development

```bash
# Deploy to dev environment
mastra deploy --env development

# Features:
# - Verbose logging
# - Lower rate limits
# - Test mode enabled
# - Mock data available
```

### Staging

```bash
# Deploy to staging
mastra deploy --env staging

# Features:
# - Production-like environment
# - Full monitoring
# - Performance testing
# - Load testing
```

### Production

```bash
# Deploy to production
mastra deploy --env production

# Features:
# - High availability
# - Auto-scaling
# - Full monitoring
# - Alerting enabled
```

## 📊 Monitoring & Logs

### View Logs

```bash
# Tail logs for all agents
mastra logs --tail

# Specific agent
mastra logs centering-analyst --tail

# Filter by level
mastra logs --level error

# Export logs
mastra logs --export logs.json
```

### Metrics

```bash
# View metrics dashboard
mastra metrics

# Agent-specific metrics
mastra metrics centering-analyst

# Export metrics
mastra metrics --export --format json
```

### Alerts

```bash
# Configure alerts
mastra alerts create \
  --name "high-error-rate" \
  --condition "error_rate > 0.05" \
  --action email:team@example.com

# List alerts
mastra alerts list

# Test alert
mastra alerts test high-error-rate
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Mastra

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Mastra
        env:
          MASTRA_API_KEY: ${{ secrets.MASTRA_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npm install -g @mastra/cli
          mastra deploy --env production
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm test

deploy_production:
  stage: deploy
  only:
    - main
  script:
    - npm install -g @mastra/cli
    - mastra deploy --env production
  environment:
    name: production
```

## 🔐 Security Best Practices

### Environment Variables

```bash
# Never commit API keys
# Use Mastra secrets management
mastra secrets set OPENAI_API_KEY=$OPENAI_KEY
mastra secrets set ANTHROPIC_API_KEY=$ANTHROPIC_KEY

# List secrets (values hidden)
mastra secrets list

# Delete secret
mastra secrets delete OLD_KEY
```

### Access Control

```bash
# Set team permissions
mastra team add user@example.com --role developer

# Roles: admin, developer, viewer
mastra team list

# Revoke access
mastra team remove user@example.com
```

### Audit Logs

```bash
# View audit log
mastra audit

# Filter by user
mastra audit --user user@example.com

# Export for compliance
mastra audit --export audit.csv
```

## 📈 Scaling Configuration

### Auto-scaling

```typescript
// mastra.config.ts
deployment: {
  scaling: {
    minInstances: 2,        // Always have 2 running
    maxInstances: 20,       // Scale up to 20
    targetCPU: 70,          // Scale when CPU > 70%
    targetMemory: 80,       // Scale when memory > 80%
    scaleUpCooldown: 60,    // Wait 60s before scaling up again
    scaleDownCooldown: 300, // Wait 5min before scaling down
  },
}
```

### Manual Scaling

```bash
# Scale specific agent
mastra scale centering-analyst --instances 5

# Scale all agents
mastra scale --instances 3

# Check current scale
mastra scale --status
```

## 💰 Cost Management

### Monitor Costs

```bash
# View current usage
mastra usage

# Breakdown by agent
mastra usage --by-agent

# Estimate monthly cost
mastra usage --estimate

# Set budget alerts
mastra budget set --limit 500 --period monthly
```

### Optimize Costs

```bash
# Enable caching
mastra cache enable --ttl 3600

# View cache stats
mastra cache stats

# Adjust rate limits
mastra config set rate_limit 50

# Review expensive agents
mastra usage --sort-by cost
```

## 🧪 Testing Before Deploy

### Local Testing

```bash
# Test locally with Mastra dev server
mastra dev

# Test specific agent
mastra test centering-analyst --input test-images.json

# Run integration tests
npm test

# Test workflow
mastra test workflow card-grading-complete
```

### Staging Deployment

```bash
# Deploy to staging first
mastra deploy --env staging

# Run smoke tests
mastra test --env staging

# If tests pass, deploy to production
mastra deploy --env production
```

## 🔄 Rollback

```bash
# List deployments
mastra deployments list

# Rollback to previous version
mastra rollback

# Rollback to specific version
mastra rollback --version v1.2.0

# Verify rollback
mastra status
```

## 📞 Support

- **Documentation**: https://docs.mastra.ai
- **Discord**: https://discord.gg/mastra
- **Email**: support@mastra.ai
- **Status Page**: https://status.mastra.ai

---

**Ready to deploy your production card grading system!** 🚀
