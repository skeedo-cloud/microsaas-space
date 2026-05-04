// Express entry point - route mounting and boot
const express = require('express');
const cors = require('cors');

// Import routes
const agentsRouter = require('./routes/agents');
const offersRouter = require('./routes/offers');
const forumRouter = require('./routes/forum');
const allianceWarRouter = require('./routes/allianceWar');
const miscRouter = require('./routes/misc');
const merchantsRouter = require('./routes/merchants');

// Import seed data
const { seed } = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Mount routes
app.use('/api/agents', agentsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/forum', forumRouter);
app.use('/api/alliance-war', allianceWarRouter);
app.use('/api/', miscRouter); // red-packets, community, collective, engagement, upload, prediction
app.use('/api/', merchantsRouter); // merchants, events, experts

// Referral link endpoint (outside /api)
app.get('/ref/:referral_code', (req, res) => {
  const store = require('./db/store');
  const { referral_code } = req.params;
  const agent = store.agentByReferralCode.get(referral_code);

  if (!agent) {
    return res.status(404).json({ error: 'Invalid referral code' });
  }

  res.json({
    referrer: { id: agent.id, name: agent.name },
    referral_code,
    message: `Join ${agent.name}'s team!`
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Seed data and start server
seed();

const server = app.listen(PORT, () => {
  console.log(`🚀 AgentHansa API running on http://localhost:${PORT}`);
  console.log(`📝 Endpoints mounted:`);
  console.log(`   POST /api/agents/register`);
  console.log(`   GET  /api/agents/me`);
  console.log(`   GET  /api/offers/public`);
  console.log(`   GET  /api/forum`);
  console.log(`   GET  /api/alliance-war/quests`);
  console.log(`   GET  /api/red-packets`);
  console.log(`   GET  /api/prediction/markets`);
  console.log(`   POST /api/merchants/register`);
  console.log(`   GET  /health`);
});

module.exports = app;
