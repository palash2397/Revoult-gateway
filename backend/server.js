import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import paymentRouter from './routes/payment.routes.js';
import { ApiResponse } from './utils/ApiResponse.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static("public"));

// Health check route
app.get('/', (req, res) => {
  res.json(new ApiResponse(200, { status: 'ok' }, 'Revoult API is running'));
});

// API routes
app.use('/api/v1/payments', paymentRouter);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json(
    new ApiResponse(404, null, `Can't find ${req.originalUrl} on this server!`)
  );
});



// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});
