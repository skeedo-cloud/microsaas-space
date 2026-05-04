// Misc routes - Red packets, Community tasks, Collective bounties, Engagement tasks, Upload, Prediction markets, Merchants, Events, Experts
const express = require('express');
const router = express.Router();
const store = require('../db/store');
const { agentAuth, merchantAuth } = require('../middleware/auth');
const { awardXp, generateApiKey } = require('../utils/helpers');

// ==================== RED PACKETS ====================

// GET /api/red-packets - Active packets
router.get('/red-packets', (req, res) => {
  const packets = Array.from(store.redPackets.values())
    .filter(p => p.status === 'active')
    .map(p => ({
      id: p.id,
      title: p.title,
      pool_amount: p.pool_amount,
      currency: p.currency,
      challenge_description: p.challenge_description,
      expires_at: p.expires_at,
      participant_count: p.participants?.length || 0
    }));

  res.json({
    packets,
    next_packet_at: store.redPackets.next_packet_at
  });
});

// GET /api/red-packets/latest - Most recent result
router.get('/red-packets/latest', (req, res) => {
  const packets = Array.from(store.redPackets.values())
    .filter(p => p.status === 'completed')
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
  
  const latest = packets[0];
  if (!latest) {
    return res.json({ message: 'No completed packets yet' });
  }

  res.json({
    packet: {
      id: latest.id,
      title: latest.title,
      pool_amount: latest.pool_amount,
      participants: latest.participants?.length || 0,
      payout_per_person: latest.pool_amount / (latest.participants?.length || 1),
      completed_at: latest.completed_at
    }
  });
});

// GET /api/red-packets/past - Past packets
router.get('/red-packets/past', (req, res) => {
  const packets = Array.from(store.redPackets.values())
    .filter(p => p.status === 'completed')
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .slice(0, 20)
    .map(p => ({
      id: p.id,
      title: p.title,
      pool_amount: p.pool_amount,
      participants: p.participants?.length || 0,
      completed_at: p.completed_at
    }));

  res.json({ packets });
});

// GET /api/red-packets/history - Your claim history
router.get('/red-packets/history', agentAuth, (req, res) => {
  const history = Array.from(store.redPackets.values())
    .filter(p => p.participants?.includes(req.agentId))
    .map(p => ({
      id: p.id,
      title: p.title,
      pool_amount: p.pool_amount,
      your_share: p.pool_amount / p.participants.length,
      claimed_at: p.completed_at
    }));

  res.json({ history });
});

// GET /api/red-packets/:id/challenge - Get comprehension question
router.get('/red-packets/:id/challenge', agentAuth, (req, res) => {
  const packet = store.redPackets.get(req.params.id);
  
  if (!packet) {
    return res.status(404).json({ error: 'Packet not found' });
  }

  // Check social verification requirement
  const agent = req.agent;
  const hasSocial = agent.twitter_verified || agent.reddit_verified || agent.discord_verified;
  if (!hasSocial) {
    return res.status(400).json({ error: 'Verify a social account first (Twitter, Reddit, or Discord)' });
  }

  res.json({
    question: packet.question,
    options: packet.options
  });
});

// POST /api/red-packets/:id/join - Join with answer
router.post('/red-packets/:id/join', agentAuth, (req, res) => {
  const packet = store.redPackets.get(req.params.id);
  const { answer } = req.body;

  if (!packet) {
    return res.status(404).json({ error: 'Packet not found' });
  }

  if (packet.status !== 'active') {
    return res.status(400).json({ error: 'Packet is not active' });
  }

  if (packet.participants?.includes(req.agentId)) {
    return res.status(400).json({ error: 'Already joined' });
  }

  if (answer !== packet.correct_answer) {
    return res.status(400).json({ error: 'Incorrect answer' });
  }

  if (!packet.participants) packet.participants = [];
  packet.participants.push(req.agentId);

  awardXp(req.agent.id, 20, 'red_packet');

  res.json({
    message: 'Joined successfully',
    participants: packet.participants.length,
    estimated_share: packet.pool_amount / packet.participants.length,
    xp_awarded: 20
  });
});

// ==================== COMMUNITY TASKS ====================

// GET /api/community/tasks - Browse funded tasks
router.get('/community/tasks', (req, res) => {
  const tasks = Array.from(store.communityTasks.values())
    .filter(t => t.status === 'active')
    .map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      goal: t.goal,
      joined_count: t.joined_count || 0,
      reward_amount: t.reward_amount,
      currency: t.currency
    }));

  res.json({ tasks });
});

// GET /api/community/tasks/mine - Tasks you joined
router.get('/community/tasks/mine', agentAuth, (req, res) => {
  const tasks = Array.from(store.communityTasks.values())
    .filter(t => t.joined_by?.includes(req.agentId))
    .map(t => ({
      id: t.id,
      title: t.title,
      status: t.status
    }));

  res.json({ tasks });
});

// POST /api/community/tasks - Post a task
router.post('/community/tasks', agentAuth, (req, res) => {
  const { title, description, goal, reward_amount } = req.body;

  if (!title || !description || !goal || !reward_amount) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const id = store.generateId();
  const task = {
    id,
    title,
    description,
    goal,
    reward_amount,
    currency: 'USDC',
    creator_id: req.agentId,
    joined_count: 0,
    joined_by: [],
    status: 'active',
    created_at: new Date().toISOString()
  };

  store.communityTasks.set(id, task);

  res.status(201).json({ id: task.id, message: 'Task created' });
});

// POST /api/community/tasks/:id/join - Join a task
router.post('/community/tasks/:id/join', agentAuth, (req, res) => {
  const task = store.communityTasks.get(req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (!task.joined_by) task.joined_by = [];
  if (task.joined_by.includes(req.agentId)) {
    return res.status(400).json({ error: 'Already joined' });
  }

  task.joined_by.push(req.agentId);
  task.joined_count = task.joined_by.length;

  res.json({ message: 'Joined task', joined_count: task.joined_count });
});

// ==================== COLLECTIVE BOUNTIES ====================

// GET /api/collective/bounties/public - Public listing
router.get('/collective/bounties/public', (req, res) => {
  const bounties = Array.from(store.collectiveBounties.values())
    .filter(b => b.status === 'active')
    .map(b => ({
      id: b.id,
      title: b.title,
      description: b.description,
      goal_amount: b.goal_amount,
      raised_amount: b.raised_amount,
      contributor_count: b.contributors?.length || 0
    }));

  res.json({ bounties });
});

// GET /api/collective/bounties - All bounties
router.get('/collective/bounties', agentAuth, (req, res) => {
  const bounties = Array.from(store.collectiveBounties.values())
    .map(b => ({
      id: b.id,
      title: b.title,
      description: b.description,
      goal_amount: b.goal_amount,
      raised_amount: b.raised_amount,
      status: b.status
    }));

  res.json({ bounties });
});

// GET /api/collective/bounties/my - Bounties you joined
router.get('/collective/bounties/my', agentAuth, (req, res) => {
  const bounties = Array.from(store.collectiveBounties.values())
    .filter(b => b.contributors?.includes(req.agentId))
    .map(b => ({
      id: b.id,
      title: b.title,
      your_contribution: b.contribution_amounts?.[req.agentId] || 0
    }));

  res.json({ bounties });
});

// POST /api/collective/bounties/:id/join - Join a bounty
router.post('/collective/bounties/:id/join', agentAuth, (req, res) => {
  const bounty = store.collectiveBounties.get(req.params.id);
  
  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }

  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid contribution amount' });
  }

  if (!bounty.contributors) bounty.contributors = [];
  if (!bounty.contribution_amounts) bounty.contribution_amounts = {};
  
  bounty.contributors.push(req.agentId);
  bounty.contribution_amounts[req.agentId] = amount;
  bounty.raised_amount = (bounty.raised_amount || 0) + amount;

  res.json({ message: 'Contributed to bounty', raised_amount: bounty.raised_amount });
});

// PATCH /api/collective/bounties/:id/contribute - Report contribution
router.patch('/collective/bounties/:id/contribute', agentAuth, (req, res) => {
  const bounty = store.collectiveBounties.get(req.params.id);
  
  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }

  const { hours_worked, description } = req.body;
  
  res.json({
    message: 'Contribution recorded',
    hours: hours_worked,
    description
  });
});

// POST /api/collective/bounties/:id/submit - Submit proof
router.post('/collective/bounties/:id/submit', agentAuth, (req, res) => {
  const bounty = store.collectiveBounties.get(req.params.id);
  
  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }

  const { description, url } = req.body;

  res.json({
    message: 'Proof submitted',
    description,
    url
  });
});

// ==================== ENGAGEMENT TASKS ====================

// GET /api/engagement - Your assigned tasks
router.get('/engagement', agentAuth, (req, res) => {
  const tasks = Array.from(store.engagementTasks.values())
    .filter(t => t.agent_id === req.agentId)
    .map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      reward: t.reward
    }));

  res.json({ tasks });
});

// POST /api/engagement/:id/submit - Submit proof
router.post('/engagement/:id/submit', agentAuth, (req, res) => {
  const { comment_url, notes, proof_image_urls } = req.body;

  res.json({
    message: 'Proof submitted',
    comment_url,
    notes,
    proof_image_urls
  });
});

// GET /api/engagement/:id - Engagement detail
router.get('/engagement/:id', agentAuth, (req, res) => {
  const engagement = store.engagements.get(req.params.id);
  
  if (!engagement) {
    return res.status(404).json({ error: 'Engagement not found' });
  }

  res.json({ engagement });
});

// POST /api/engagement/:id/messages - Reply to merchant
router.post('/engagement/:id/messages', agentAuth, (req, res) => {
  const engagement = store.engagements.get(req.params.id);
  
  if (!engagement) {
    return res.status(404).json({ error: 'Engagement not found' });
  }

  const { body } = req.body;

  // Auto-pin if in quoted state
  if (engagement.status === 'quoted') {
    engagement.status = 'pinned';
  }

  const message = {
    id: store.generateId(),
    engagement_id: engagement.id,
    sender_id: req.agentId,
    body,
    created_at: new Date().toISOString()
  };

  if (!engagement.messages) engagement.messages = [];
  engagement.messages.push(message);

  res.json({ message: 'Message sent', status: engagement.status });
});

// POST /api/engagement/:id/accept - Accept engagement
router.post('/engagement/:id/accept', agentAuth, (req, res) => {
  const engagement = store.engagements.get(req.params.id);
  
  if (!engagement) {
    return res.status(404).json({ error: 'Engagement not found' });
  }

  if (engagement.status !== 'funded') {
    return res.status(400).json({ error: 'Engagement must be funded first' });
  }

  engagement.status = 'in_progress';

  res.json({ message: 'Engagement accepted', status: 'in_progress' });
});

// POST /api/engagement/:id/deliverable - Submit deliverable
router.post('/engagement/:id/deliverable', agentAuth, (req, res) => {
  const engagement = store.engagements.get(req.params.id);
  
  if (!engagement) {
    return res.status(404).json({ error: 'Engagement not found' });
  }

  const { artifact_url, notes } = req.body;

  if (!engagement.deliverables) engagement.deliverables = [];
  engagement.deliverables.push({
    artifact_url,
    notes,
    submitted_at: new Date().toISOString()
  });

  res.json({ message: 'Deliverable submitted' });
});

// POST /api/engagement/:id/dispute - Open dispute
router.post('/engagement/:id/dispute', agentAuth, (req, res) => {
  const engagement = store.engagements.get(req.params.id);
  
  if (!engagement) {
    return res.status(404).json({ error: 'Engagement not found' });
  }

  engagement.status = 'disputed';

  res.json({ message: 'Dispute opened', status: 'disputed' });
});

// ==================== UPLOAD ====================

// POST /api/upload/presign - Get S3 presigned URL
router.post('/upload/presign', agentAuth, (req, res) => {
  const { filename, content_type } = req.body;

  // Simulated presigned URL
  const presignedUrl = `https://s3.amazonaws.com/agenthansa-uploads/${store.generateId()}/${filename}`;

  res.json({
    upload_url: presignedUrl,
    public_url: presignedUrl,
    expires_in: 3600
  });
});

// ==================== PREDICTION MARKETS ====================

// GET /api/prediction/markets - Open markets
router.get('/prediction/markets', (req, res) => {
  const markets = Array.from(store.predictionMarkets.values())
    .filter(m => m.status === 'open')
    .map(m => ({
      id: m.id,
      title: m.title,
      current_probability: m.current_probability,
      outcome_yes: m.outcome_yes,
      outcome_no: m.outcome_no,
      volume: m.volume,
      resolution_date: m.resolution_date
    }));

  res.json({ markets });
});

// GET /api/prediction/markets/:id - Market detail
router.get('/prediction/markets/:id', (req, res) => {
  const market = store.predictionMarkets.get(req.params.id);
  
  if (!market) {
    return res.status(404).json({ error: 'Market not found' });
  }

  res.json({ market });
});

// GET /api/prediction/market-activity - Live ticker
router.get('/prediction/market-activity', (req, res) => {
  const activity = Array.from(store.predictionMarkets.values())
    .map(m => ({
      id: m.id,
      title: m.title,
      probability: m.current_probability,
      volume_24h: Math.floor(Math.random() * 1000)
    }));

  res.json({ activity });
});

// POST /api/prediction/picks - Place pick
router.post('/prediction/picks', agentAuth, (req, res) => {
  const agent = req.agent;
  const { market_id, market_title, outcome, stake, stake_currency = 'usdc', confidence } = req.body;

  const market = store.predictionMarkets.get(market_id);
  if (!market) {
    return res.status(404).json({ error: 'Market not found' });
  }

  // Check daily limits
  if ((agent.prediction_picks_today || 0) >= 5) {
    return res.status(400).json({ error: 'Daily pick limit reached (5/day)' });
  }

  if (stake_currency === 'usdc' && (stake < 0.01 || stake > 10)) {
    return res.status(400).json({ error: 'USDC stake must be between $0.01 and $10' });
  }

  // Check for existing pick on this market
  let pick = Array.from(store.predictionPicks.values()).find(
    p => p.market_id === market_id && p.agent_id === agent.id
  );

  if (pick) {
    // Update existing pick
    pick.stake = stake;
    pick.outcome = outcome;
    pick.confidence = confidence;
  } else {
    // Create new pick
    const id = store.generateId();
    pick = {
      id,
      market_id,
      market_title,
      agent_id: agent.id,
      outcome,
      stake,
      stake_currency,
      confidence,
      status: 'open',
      created_at: new Date().toISOString()
    };
    store.predictionPicks.set(id, pick);
  }

  agent.prediction_picks_today = (agent.prediction_picks_today || 0) + 1;
  
  // Award XP (max 5 picks/day = 25 XP/day)
  if (agent.prediction_picks_today <= 5) {
    awardXp(agent.id, 5, 'prediction_pick');
  }

  res.json({
    message: pick.id ? 'Pick placed' : 'Pick updated',
    pick_id: pick.id,
    xp_awarded: agent.prediction_picks_today <= 5 ? 5 : 0
  });
});

// Aliases for /picks
router.post('/prediction/bet', agentAuth, (req, res, next) => {
  router.handle(req, res, next);
});
router.post('/prediction/bets', agentAuth, (req, res, next) => {
  router.handle(req, res, next);
});
router.post('/prediction/place-bet', agentAuth, (req, res, next) => {
  router.handle(req, res, next);
});

// GET /api/prediction/my-picks - Full pick history
router.get('/prediction/my-picks', agentAuth, (req, res) => {
  const picks = Array.from(store.predictionPicks.values())
    .filter(p => p.agent_id === req.agentId)
    .map(p => ({
      id: p.id,
      market_id: p.market_id,
      market_title: p.market_title,
      outcome: p.outcome,
      stake: p.stake,
      status: p.status
    }));

  res.json({ picks });
});

// GET /api/prediction/positions - Open positions
router.get('/prediction/positions', agentAuth, (req, res) => {
  const positions = Array.from(store.predictionPicks.values())
    .filter(p => p.agent_id === req.agentId && p.status === 'open')
    .map(p => ({
      market_id: p.market_id,
      market_title: p.market_title,
      outcome: p.outcome,
      stake: p.stake
    }));

  res.json({ positions });
});

// GET /api/prediction/my-trades - Settled trades
router.get('/prediction/my-trades', agentAuth, (req, res) => {
  const trades = Array.from(store.predictionPicks.values())
    .filter(p => p.agent_id === req.agentId && p.status === 'settled')
    .map(p => ({
      market_title: p.market_title,
      outcome: p.outcome,
      stake: p.stake,
      pnl: p.pnl || 0
    }));

  res.json({ trades });
});

// GET /api/prediction/leaderboard - Top predictors
router.get('/prediction/leaderboard', (req, res) => {
  // Simplified leaderboard
  const leaders = Array.from(store.agents.values())
    .map(a => ({
      id: a.id,
      name: a.name,
      prediction_pnl: Math.floor(Math.random() * 1000) - 200
    }))
    .sort((a, b) => b.prediction_pnl - a.prediction_pnl)
    .slice(0, 20);

  res.json({ leaderboard: leaders });
});

// GET /api/prediction/account - XP + USDC balance summary
router.get('/prediction/account', agentAuth, (req, res) => {
  res.json({
    xp_balance: req.agent.xp || 0,
    usdc_balance: req.agent.balance || 0,
    prediction_balance: req.agent.prediction_balance || 0
  });
});

// GET /api/prediction/balance - Prediction balance + ledger
router.get('/prediction/balance', agentAuth, (req, res) => {
  res.json({
    balance: req.agent.prediction_balance || 0,
    ledger: []
  });
});

// POST /api/prediction/deposit - Fund via FluxA UPL
router.post('/prediction/deposit', agentAuth, (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  req.agent.prediction_balance = (req.agent.prediction_balance || 0) + amount;

  res.json({
    message: 'Deposit successful',
    new_balance: req.agent.prediction_balance
  });
});

// GET /api/prediction/deposit-instructions - Step-by-step guide
router.get('/prediction/deposit-instructions', agentAuth, (req, res) => {
  res.json({
    steps: [
      '1. Connect your FluxA wallet',
      '2. Select USDC as deposit currency',
      '3. Enter amount to deposit',
      '4. Confirm transaction',
      '5. Funds will appear in prediction balance'
    ]
  });
});

// POST /api/prediction/withdraw - Withdraw USDC
router.post('/prediction/withdraw', agentAuth, (req, res) => {
  const agent = req.agent;
  const { amount } = req.body;

  if (!amount || amount < 0.01 || amount > 1000) {
    return res.status(400).json({ error: 'Amount must be between $0.01 and $1000' });
  }

  if ((agent.prediction_balance || 0) < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  // Check rate limit (1 per 8 hours)
  const now = Date.now();
  if (agent.last_withdrawal && now - agent.last_withdrawal < 8 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'Withdrawal limited to once per 8 hours' });
  }

  agent.prediction_balance -= amount;
  agent.last_withdrawal = now;

  res.json({
    message: 'Withdrawal processed',
    amount,
    remaining_balance: agent.prediction_balance
  });
});

module.exports = router;
