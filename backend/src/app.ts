import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import invoiceRoutes from './routes/invoice.routes';
import { errorHandler } from './middlewares/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Standard Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health Check Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Invoice Management API',
    });
  });

  // Business API Routes
  app.use('/api', invoiceRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
