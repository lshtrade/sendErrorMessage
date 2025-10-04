import express, { Request, Response, NextFunction } from 'express';
import { ErrorLogger } from '../src/index.js';

// Initialize with environment variables
// Set DISCORD_WEBHOOK_URL or SLACK_WEBHOOK_URL in .env
const errorLogger = new ErrorLogger();

const app = express();

app.use(express.json());

// Example route that might throw errors
app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    // Simulate database error
    if (req.params.id === '999') {
      throw new Error('User not found');
    }

    res.json({ id: req.params.id, name: 'John Doe' });
  } catch (error) {
    // Log error before sending response
    await errorLogger.captureException(error as Error, {
      method: req.method,
      url: req.url,
      userId: req.params.id,
      ip: req.ip
    });

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Global error handler middleware
app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log all unhandled errors
  await errorLogger.captureException(err, {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query
  });

  res.status(500).json({ error: 'Internal server error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason: any) => {
  await errorLogger.captureException(
    new Error(`Unhandled rejection: ${reason}`),
    { reason }
  );
  console.error('Unhandled rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error: Error) => {
  await errorLogger.captureException(error, {
    type: 'uncaughtException'
  });
  console.error('Uncaught exception:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Error logging configured with environment variables');
});
