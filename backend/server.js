const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------
// Global Middleware
// ---------------------
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ---------------------
// Health check
// ---------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------
// API Routes
// ---------------------
// Routes will be mounted here as they are implemented in later phases:
// app.use('/api/auth',         require('./src/routes/auth'));
// app.use('/api/business',     require('./src/routes/business'));
// app.use('/api/products',     require('./src/routes/products'));
// app.use('/api/categories',   require('./src/routes/categories'));
// app.use('/api/transactions', require('./src/routes/transactions'));
// app.use('/api/reports',      require('./src/routes/reports'));
// app.use('/api/ai',           require('./src/routes/ai'));
// app.use('/api/settings',     require('./src/routes/settings'));

// ---------------------
// Global error handler
// ---------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------
// Start server
// ---------------------
async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');

    app.listen(PORT, () => {
      console.log(`🚀 FlowPOS API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🔌 Prisma disconnected');
  process.exit(0);
});

// Export for use in route files
module.exports = { prisma };
