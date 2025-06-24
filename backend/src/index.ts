import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { createRouter } from './routes';

// Load environment variables
const PORT = process.env.PORT || 3000;

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Error handling
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        message: err.message,
        status: err.status,
      },
      err.status
    );
  }
  
  console.error('Unhandled error:', err);
  return c.json(
    {
      message: 'Internal Server Error',
      status: 500,
    },
    500
  );
});

// API Routes
app.route('/api', createRouter());

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'BloodSky API is running' }));

// Start server
console.log(`Server running on http://localhost:${PORT}`);

export default {
  fetch: app.fetch,
  port: PORT,
};