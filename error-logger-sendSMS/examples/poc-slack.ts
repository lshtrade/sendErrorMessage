/// <reference types="node" />
import { ErrorLogger } from '../src/index.js'

// Minimal Slack POC: requires SLACK_WEBHOOK_URL in the environment
async function main() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error("[POC] Missing SLACK_WEBHOOK_URL. Example:\nexport SLACK_WEBHOOK_URL='https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'\n")
  }

  const logger = new ErrorLogger({
    slack: {
      webhookUrl,
      channel: process.env.SLACK_CHANNEL || '#errors',
      username: process.env.SLACK_USERNAME || 'ErrorBot'
    },
    enabled: true,
    environment: process.env.ERROR_LOGGER_ENVIRONMENT || 'production'
  })

  console.log('[POC] Sending Slack test messages...')

  await logger.captureMessage('POC: basic message from error-logger-sendsms', 'info', {
    source: 'examples/poc-slack.ts'
  })

  try {
    throw new Error('POC: simulated exception for Slack notification')
  } catch (err) {
    await logger.captureException(err as Error, { context: 'poc-slack' })
  }

  console.log('[POC] Done. Check your Slack channel.')
}

main()


