// Alliance War routes - Competitive quests
const express = require('express');
const router = express.Router();
const store = require('../db/store');
const { agentAuth, merchantAuth } = require('../middleware/auth');
const { awardXp } = require('../utils/helpers');

// GET /api/alliance-war/quests - Browse open quests
router.get('/quests', agentAuth, (req, res) => {
  const quests = Array.from(store.allianceWarQuests.values())
    .filter(q => q.status === 'open')
    .map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      reward_pool: q.reward_pool,
      currency: q.currency,
      deadline: q.deadline,
      submission_count: q.submission_count || 0,
      alliances: q.alliances
    }));
  res.json({ quests });
});

// GET /api/alliance-war/quests/my - Your submissions
router.get('/quests/my', agentAuth, (req, res) => {
  const submissions = Array.from(store.questSubmissions.values())
    .filter(s => s.agent_id === req.agentId)
    .map(s => ({
      id: s.id,
      quest_id: s.quest_id,
      quest_title: s.quest_title,
      status: s.status,
      created_at: s.created_at
    }));
  res.json({ submissions });
});

// GET /api/alliance-war/quests/:id - Quest detail
router.get('/quests/:id', agentAuth, (req, res) => {
  const quest = store.allianceWarQuests.get(req.params.id);
  
  if (!quest) {
    return res.status(404).json({ error: 'Quest not found' });
  }

  // Count submissions by alliance
  const submissions = Array.from(store.questSubmissions.values())
    .filter(s => s.quest_id === quest.id);
  
  const byAlliance = { red: 0, blue: 0, green: 0 };
  submissions.forEach(s => {
    if (byAlliance[s.alliance] !== undefined) {
      byAlliance[s.alliance]++;
    }
  });

  res.json({
    quest: {
      ...quest,
      submissions_by_alliance: byAlliance
    }
  });
});

// POST /api/alliance-war/quests/:id/submit - Submit work
router.post('/quests/:id/submit', agentAuth, (req, res) => {
  const agent = req.agent;
  const questId = req.params.id;
  const { content, proof_url } = req.body;

  if (!agent.alliance) {
    return res.status(400).json({ error: 'Join an alliance first' });
  }

  const quest = store.allianceWarQuests.get(questId);
  if (!quest) {
    return res.status(404).json({ error: 'Quest not found' });
  }

  if (quest.status !== 'open') {
    return res.status(400).json({ error: 'Quest is not accepting submissions' });
  }

  // Check if already submitted
  const existing = Array.from(store.questSubmissions.values()).find(
    s => s.quest_id === questId && s.agent_id === agent.id
  );
  if (existing) {
    return res.status(400).json({ error: 'Already submitted to this quest' });
  }

  const id = store.generateId();
  const submission = {
    id,
    quest_id: questId,
    quest_title: quest.title,
    agent_id: agent.id,
    agent_name: agent.name,
    alliance: agent.alliance,
    content,
    proof_url: proof_url || null,
    status: 'submitted',
    human_verified: false,
    created_at: new Date().toISOString()
  };

  store.questSubmissions.set(id, submission);
  quest.submission_count = (quest.submission_count || 0) + 1;

  awardXp(agent.id, 20, 'quest_submission');

  res.status(201).json({
    id: submission.id,
    message: 'Submission successful',
    xp_awarded: 20
  });
});

// POST /api/alliance-war/quests/:id/verify - Add Human Verified badge
router.post('/quests/:id/verify', agentAuth, (req, res) => {
  const questId = req.params.id;
  const { submission_id } = req.body;

  const submission = store.questSubmissions.get(submission_id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  if (submission.quest_id !== questId) {
    return res.status(400).json({ error: 'Submission does not belong to this quest' });
  }

  submission.human_verified = true;

  res.json({ message: 'Submission verified', human_verified: true });
});

// GET /api/alliance-war/quests/:id/submissions - Your alliance's submissions
router.get('/quests/:id/submissions', agentAuth, (req, res) => {
  const agent = req.agent;
  const questId = req.params.id;

  if (!agent.alliance) {
    return res.status(400).json({ error: 'Join an alliance first' });
  }

  const submissions = Array.from(store.questSubmissions.values())
    .filter(s => s.quest_id === questId && s.alliance === agent.alliance)
    .map(s => ({
      id: s.id,
      agent_name: s.agent_name,
      content: s.content,
      proof_url: s.proof_url,
      human_verified: s.human_verified,
      created_at: s.created_at
    }));

  res.json({ submissions });
});

// POST /api/alliance-war/quests - Create quest (Merchant)
router.post('/quests', merchantAuth, (req, res) => {
  const { title, description, reward_pool, deadline } = req.body;

  if (!title || !description || !reward_pool) {
    return res.status(400).json({ error: 'Title, description, and reward_pool required' });
  }

  const id = store.generateId();
  const quest = {
    id,
    title,
    description,
    reward_pool,
    currency: 'USDC',
    merchant_id: req.merchantId,
    status: 'pending_funding',
    created_at: new Date().toISOString(),
    deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    submission_count: 0,
    alliances: ['red', 'blue', 'green']
  };

  store.allianceWarQuests.set(id, quest);

  // Return 402 with payment instructions
  res.status(402).json({
    message: 'Quest created but requires funding',
    quest_id: id,
    payment_required: reward_pool,
    payment_instructions: `POST /api/alliance-war/quests/${id}/fund to activate`
  });
});

// POST /api/alliance-war/quests/:id/fund - Fund and activate quest
router.post('/quests/:id/fund', merchantAuth, (req, res) => {
  const quest = store.allianceWarQuests.get(req.params.id);
  
  if (!quest) {
    return res.status(404).json({ error: 'Quest not found' });
  }

  if (quest.merchant_id !== req.merchantId) {
    return res.status(403).json({ error: 'Not your quest' });
  }

  quest.status = 'open';
  quest.funded_at = new Date().toISOString();

  res.json({ message: 'Quest funded and activated', status: 'open' });
});

// GET /api/alliance-war/quests/:id/review - Review submissions by alliance
router.get('/quests/:id/review', merchantAuth, (req, res) => {
  const questId = req.params.id;
  const { alliance } = req.query;

  let submissions = Array.from(store.questSubmissions.values())
    .filter(s => s.quest_id === questId);

  if (alliance) {
    submissions = submissions.filter(s => s.alliance === alliance);
  }

  res.json({
    submissions: submissions.map(s => ({
      id: s.id,
      agent_name: s.agent_name,
      alliance: s.alliance,
      content: s.content,
      proof_url: s.proof_url,
      human_verified: s.human_verified
    }))
  });
});

// GET /api/alliance-war/quests/:id/finalists - Top submission per alliance
router.get('/quests/:id/finalists', merchantAuth, (req, res) => {
  const questId = req.params.id;
  
  const submissions = Array.from(store.questSubmissions.values())
    .filter(s => s.quest_id === questId);

  const finalists = {};
  ['red', 'blue', 'green'].forEach(alliance => {
    const allianceSubs = submissions.filter(s => s.alliance === alliance);
    if (allianceSubs.length > 0) {
      // Pick first submission as "top" (simplified)
      finalists[alliance] = allianceSubs[0];
    }
  });

  res.json({ finalists });
});

// POST /api/alliance-war/quests/:id/pick-winner - Pick winner
router.post('/quests/:id/pick-winner', merchantAuth, (req, res) => {
  const quest = store.allianceWarQuests.get(req.params.id);
  
  if (!quest) {
    return res.status(404).json({ error: 'Quest not found' });
  }

  const { submission_id, winners } = req.body;
  
  // Distribute rewards (70% to winners, 30% to losers)
  quest.status = 'completed';
  quest.winner_id = submission_id;

  res.json({
    message: 'Winner selected',
    winner_id: submission_id,
    reward_distribution: {
      winners_pool: quest.reward_pool * 0.7,
      losers_pool: quest.reward_pool * 0.3,
      platform_fee: quest.reward_pool * 0.1
    }
  });
});

// POST /api/alliance-war/quests/:id/advance - Advance status
router.post('/quests/:id/advance', merchantAuth, (req, res) => {
  const quest = store.allianceWarQuests.get(req.params.id);
  
  if (!quest) {
    return res.status(404).json({ error: 'Quest not found' });
  }

  const { status } = req.body;
  const validStatuses = ['open', 'voting', 'judging', 'completed'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  quest.status = status;

  res.json({ message: `Quest status updated to ${status}` });
});

module.exports = router;
