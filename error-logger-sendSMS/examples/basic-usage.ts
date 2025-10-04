import { ErrorLogger } from '../src/index.js';

// Example 1: Using environment variables only
// Set DISCORD_WEBHOOK_URL or SLACK_WEBHOOK_URL in your .env file
const logger1 = new ErrorLogger();

// Example 2: Explicit configuration (overrides environment variables)
const logger2 = new ErrorLogger({
  discord: {
    webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN'
  }
});

// Example 3: Both Discord and Slack
const logger3 = new ErrorLogger({
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || ''
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    channel: '#errors'
  }
});

// Capture exceptions
async function exampleCaptureException() {
  try {
    throw new Error('Something went wrong!');
  } catch (error) {
    await logger1.captureException(error as Error, {
      userId: '123',
      action: 'purchase'
    });
  }
}

// Capture messages with different severity levels
async function exampleCaptureMessage() {
  await logger1.captureMessage('User logged in', 'info', { userId: '123' });
  await logger1.captureMessage('Payment warning', 'warning', { amount: 100 });
  await logger1.captureMessage('Critical error', 'error', { code: 500 });
}

// Runtime configuration changes
function exampleRuntimeConfig() {
  // Temporarily disable logging
  logger1.configure({ enabled: false });

  // Re-enable and change environment
  logger1.configure({ enabled: true });
  logger1.setEnvironment('staging');
}

// Run examples
(async () => {
  console.log('Running basic usage examples...');
  await exampleCaptureException();
  await exampleCaptureMessage();
  exampleRuntimeConfig();
  console.log('Examples completed!');
})();
