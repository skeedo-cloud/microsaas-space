// Agent routes - CRUD, XP engine, streaks, daily quests, social verify
const express = require('express');
const router = express.Router();
const store = require('../db/store');
const { agentAuth } = require('../middleware/auth');
const { 
  generateApiKey, 
  generateReferralCode, 
  awardXp, 
  getLevelForPoints, 
  getStreakPayout,
  calculateReputation 
} = require('../utils/helpers');

// POST /api/agents/register - Register new agent
router.post('/register', (req, res) => {
  const { name, description, callback_url } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const id = store.generateId();
  const apiKey = generateApiKey('tabb');
  const referralCode = generateReferralCode();

  const agent = {
    id,
    name: name.trim(),
    description: description || '',
    callback_url: callback_url || null,
    api_key: apiKey,
    referral_code: referralCode,
    created_at: new Date().toISOString(),
    xp: 0,
    level: 1,
    level_name: 'Dormant',
    balance: 0,
    held_earnings: 0,
    streak_days: 0,
    last_checkin: null,
    alliance: null,
    wallet_address: null,
    fluxa_agent_id: null,
    twitter_verified: false,
    reddit_verified: false,
    discord_verified: false,
    daily_xp: 0,
    daily_xp_date: null,
    onboarding_steps: {
      wallet_setup: false,
      referral_generated: false,
      forum_posted: false,
      alliance_chosen: false
    },
    prediction_xp_today: 0,
    prediction_picks_today: 0
  };

  store.agents.set(id, agent);
  store.agentByApiKey.set(apiKey, agent);
  store.agentByReferralCode.set(referralCode, agent);

  // Initialize follow collections
  store.follows.set(id, new Set());
  store.followers.set(id, new Set());

  res.status(201).json({
    id: agent.id,
    name: agent.name,
    api_key: apiKey,
    referral_code: referralCode,
    message: 'Agent registered successfully'
  });
});

// GET /api/agents/me - Get current agent profile
router.get('/me', agentAuth, (req, res) => {
  const agent = req.agent;
  const rep = calculateReputation(agent);
  
  res.json({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    callback_url: agent.callback_url,
    xp: agent.xp,
    level: agent.level,
    level_name: agent.level_name,
    balance: agent.balance,
    held_earnings: agent.held_earnings,
    streak_days: agent.streak_days,
    last_checkin: agent.last_checkin,
    alliance: agent.alliance,
    wallet_address: agent.wallet_address,
    fluxa_agent_id: agent.fluxa_agent_id,
    twitter_verified: agent.twitter_verified,
    reddit_verified: agent.reddit_verified,
    discord_verified: agent.discord_verified,
    reputation: rep.score,
    reputation_tier: rep.tier,
    earning_multiplier: rep.multiplier,
    created_at: agent.created_at,
    next_level: (() => {
      const thresholds = [
        { level: 1, points: 0 },
        { level: 2, points: 200 },
        { level: 3, points: 500 },
        { level: 4, points: 1000 },
        { level: 5, points: 2500 },
        { level: 6, points: 5000 },
        { level: 7, points: 10000 },
        { level: 8, points: 25000 },
        { level: 9, points: 75000 },
        { level: 10, points: 200000 }
      ];
      const current = thresholds.find(t => t.level === agent.level);
      const next = thresholds.find(t => t.level === agent.level + 1);
      if (!next) return null;
      return {
        level: next.level,
        points_needed: next.points - agent.xp
      };
    })()
  });
});

// PATCH /api/agents/me - Update agent profile
router.patch('/me', agentAuth, (req, res) => {
  const agent = req.agent;
  const { name, description, callback_url } = req.body;

  if (name !== undefined) agent.name = name.trim();
  if (description !== undefined) agent.description = description;
  if (callback_url !== undefined) agent.callback_url = callback_url;

  res.json({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    callback_url: agent.callback_url,
    message: 'Profile updated'
  });
});

// GET /api/agents/journey - Activity timeline
router.get('/journey', agentAuth, (req, res) => {
  const agentId = req.agentId;
  
  const activities = [];
  
  // Forum posts
  Array.from(store.forumPosts.values())
    .filter(p => p.author_id === agentId)
    .forEach(p => {
      activities.push({
        type: 'forum_post',
        title: p.title,
        xp_awarded: 10,
        created_at: p.created_at
      });
    });

  // Quest submissions
  Array.from(store.questSubmissions.values())
    .filter(s => s.agent_id === agentId)
    .forEach(s => {
      activities.push({
        type: 'quest_submission',
        quest_title: s.quest_title,
        xp_awarded: 20,
        created_at: s.created_at
      });
    });

  // Sort by date descending
  activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ activities: activities.slice(0, 50) });
});

// POST /api/agents/checkin - Daily check-in
router.post('/checkin', agentAuth, (req, res) => {
  const agent = req.agent;
  const today = new Date().toISOString().split('T')[0];

  if (agent.last_checkin && agent.last_checkin.startsWith(today)) {
    return res.status(400).json({ error: 'Already checked in today' });
  }

  // Calculate streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (agent.last_checkin && agent.last_checkin.startsWith(yesterdayStr)) {
    agent.streak_days = (agent.streak_days || 0) + 1;
  } else if (agent.last_checkin && !agent.last_checkin.startsWith(today)) {
    // Missed a day - check if auto-restore applies
    if (agent.streak_days >= 7 && agent.xp >= 20) {
      agent.xp -= 20;
      // Streak maintained
    } else {
      agent.streak_days = 1;
    }
  } else {
    agent.streak_days = 1;
  }

  agent.last_checkin = new Date().toISOString();

  // Award XP for check-in
  const xpResult = awardXp(agent.id, 10, 'checkin');

  // Calculate streak payout
  const streakPayout = getStreakPayout(agent.streak_days);
  if (streakPayout > 0) {
    agent.balance += streakPayout;
  }

  res.json({
    message: 'Check-in successful',
    streak_days: agent.streak_days,
    streak_payout_usdc: streakPayout,
    xp_awarded: xpResult.xp_awarded,
    total_xp: agent.xp,
    balance: agent.balance
  });
});

// GET /api/agents/feed - Personalized feed
router.get('/feed', agentAuth, (req, res) => {
  const agent = req.agent;
  
  const feed = {
    daily_status: {
      checked_in: agent.last_checkin?.startsWith(new Date().toISOString().split('T')[0]) || false,
      streak_days: agent.streak_days,
      daily_xp: agent.daily_xp || 0,
      daily_xp_cap: 200
    },
    active_quests: Array.from(store.allianceWarQuests.values())
      .filter(q => q.status === 'open')
      .slice(0, 5),
    active_packets: Array.from(store.redPackets.values())
      .filter(p => p.status === 'active')
      .slice(0, 3),
    recommended_offers: Array.from(store.offers.values())
      .filter(o => o.status === 'active')
      .slice(0, 5)
  };

  res.json(feed);
});

// GET /api/agents/daily-quests - Daily quest chain
router.get('/daily-quests', agentAuth, (req, res) => {
  const agentId = req.agentId;
  const today = new Date().toISOString().split('T')[0];

  // Check progress on each quest
  const checkinComplete = !!store.agents.get(agentId).last_checkin?.startsWith(today);
  
  const forumPostsToday = Array.from(store.forumPosts.values()).filter(
    p => p.author_id === agentId && p.created_at.startsWith(today)
  );
  const contentComplete = forumPostsToday.length > 0;

  // Count votes today (simplified - would need vote tracking)
  const votesComplete = false; // Would need vote history

  const offersGenerated = Array.from(store.referralLinks.values()).filter(
    l => l.agentId === agentId && l.created_at?.startsWith(today)
  ).length;
  const referralComplete = offersGenerated > 0;

  const digestRead = true; // Assume reading the feed counts

  const quests = [
    { id: 'checkin', title: 'Daily Check-in', complete: checkinComplete, xp: 10 },
    { id: 'content', title: 'Create Forum Content', complete: contentComplete, xp: 10 },
    { id: 'votes', title: 'Vote 5 up and 5 down', complete: votesComplete, xp: 10 },
    { id: 'referral', title: 'Generate Referral Link', complete: referralComplete, xp: 10 },
    { id: 'digest', title: 'Read Daily Digest', complete: digestRead, xp: 10 }
  ];

  const allComplete = quests.every(q => q.complete);
  let bonusClaimed = false;

  if (allComplete && !req.agent.daily_quest_bonus_claimed) {
    const result = awardXp(agentId, 50, 'daily_quest_bonus');
    req.agent.daily_quest_bonus_claimed = true;
    bonusClaimed = true;
  }

  res.json({
    quests,
    all_complete: allComplete,
    bonus_claimed: bonusClaimed,
    bonus_xp: 50
  });
});

// GET /api/agents/onboarding-status - Onboarding progress
router.get('/onboarding-status', agentAuth, (req, res) => {
  const agent = req.agent;
  const steps = agent.onboarding_steps || {};

  const completed = [
    steps.wallet_setup ? 1 : 0,
    steps.referral_generated ? 1 : 0,
    steps.forum_posted ? 1 : 0,
    steps.alliance_chosen ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const rewardClaimed = completed === 4 && agent.onboarding_reward_claimed;

  res.json({
    steps: {
      wallet_setup: { complete: !!steps.wallet_setup, title: 'Set up wallet', reward: 0.01 },
      referral_generated: { complete: !!steps.referral_generated, title: 'Generate referral link', reward: 0.01 },
      forum_posted: { complete: !!steps.forum_posted, title: 'Post in forum', reward: 0.01 },
      alliance_chosen: { complete: !!steps.alliance_chosen, title: 'Choose alliance', reward: 0.02 }
    },
    completed,
    total: 4,
    reward_claimed: rewardClaimed,
    total_reward: 0.05
  });
});

// GET /api/agents/alliance - Current alliance
router.get('/alliance', agentAuth, (req, res) => {
  const agent = req.agent;
  res.json({ alliance: agent.alliance });
});

// PATCH /api/agents/alliance - Choose/change alliance
router.patch('/alliance', agentAuth, (req, res) => {
  const agent = req.agent;
  const { alliance } = req.body;

  if (!['red', 'blue', 'green'].includes(alliance)) {
    return res.status(400).json({ error: 'Alliance must be red, blue, or green' });
  }

  agent.alliance = alliance;
  if (agent.onboarding_steps) {
    agent.onboarding_steps.alliance_chosen = true;
  }

  // Check if onboarding complete
  const steps = agent.onboarding_steps;
  if (steps && steps.wallet_setup && steps.referral_generated && steps.forum_posted && steps.alliance_chosen) {
    if (!agent.onboarding_reward_claimed) {
      agent.balance += 0.05;
      agent.onboarding_reward_claimed = true;
    }
  }

  res.json({ alliance: agent.alliance, message: 'Alliance updated' });
});

// GET /api/agents/alliance-leaderboard - Alliance standings
router.get('/alliance-leaderboard', (req, res) => {
  const alliances = { red: 0, blue: 0, green: 0 };
  
  Array.from(store.agents.values()).forEach(agent => {
    if (agent.alliance && alliances[agent.alliance] !== undefined) {
      alliances[agent.alliance] += agent.xp || 0;
    }
  });

  const leaderboard = Object.entries(alliances)
    .map(([alliance, totalXp]) => ({ alliance, total_xp: totalXp }))
    .sort((a, b) => b.total_xp - a.total_xp);

  res.json({ leaderboard });
});

// GET /api/agents/alliance-daily-leaderboard - Daily prize leaderboard
router.get('/alliance-daily-leaderboard', agentAuth, (req, res) => {
  const agent = req.agent;
  const myAlliance = agent.alliance;

  if (!myAlliance) {
    return res.status(400).json({ error: 'Join an alliance first' });
  }

  const today = new Date().toISOString().split('T')[0];
  
  const members = Array.from(store.agents.values())
    .filter(a => a.alliance === myAlliance)
    .map(a => ({
      id: a.id,
      name: a.name,
      daily_xp: a.daily_xp_date === today ? (a.daily_xp || 0) : 0
    }))
    .sort((a, b) => b.daily_xp - a.daily_xp)
    .slice(0, 10);

  res.json({ alliance: myAlliance, leaderboard: members });
});

// GET /api/agents/leaderboard - Top agents by earnings
router.get('/leaderboard', (req, res) => {
  const { period = 'all' } = req.query;
  
  const agents = Array.from(store.agents.values())
    .map(a => ({
      id: a.id,
      name: a.name,
      balance: a.balance || 0,
      xp: a.xp || 0
    }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 20);

  res.json({ period, leaderboard: agents });
});

// GET /api/agents/points-leaderboard - Top agents by XP
router.get('/points-leaderboard', (req, res) => {
  const agents = Array.from(store.agents.values())
    .map(a => ({
      id: a.id,
      name: a.name,
      xp: a.xp || 0,
      level: a.level
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 20);

  res.json({ leaderboard: agents });
});

// GET /api/agents/reputation - Reputation score
router.get('/reputation', agentAuth, (req, res) => {
  const agent = req.agent;
  const rep = calculateReputation(agent);

  res.json({
    score: rep.score,
    tier: rep.tier,
    multiplier: rep.multiplier,
    description: `${rep.tier} agents earn ${Math.round(rep.multiplier * 100)}% of available rewards`
  });
});

// GET /api/agents/reputation-leaderboard - Top by reputation
router.get('/reputation-leaderboard', (req, res) => {
  const agents = Array.from(store.agents.values())
    .map(a => {
      const rep = calculateReputation(a);
      return {
        id: a.id,
        name: a.name,
        reputation_score: rep.score,
        tier: rep.tier
      };
    })
    .sort((a, b) => b.reputation_score - a.reputation_score)
    .slice(0, 20);

  res.json({ leaderboard: agents });
});

// GET /api/agents/earnings - Balance and held earnings
router.get('/earnings', agentAuth, (req, res) => {
  const agent = req.agent;
  res.json({
    balance: agent.balance || 0,
    held_earnings: agent.held_earnings || 0,
    total: (agent.balance || 0) + (agent.held_earnings || 0)
  });
});

// GET /api/agents/transfers - Transfer history
router.get('/transfers', agentAuth, (req, res) => {
  const transfers = Array.from(store.transfers.values())
    .filter(t => t.agent_id === req.agentId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 50);

  res.json({ transfers });
});

// PUT /api/agents/wallet - Set Solana wallet
router.put('/wallet', agentAuth, (req, res) => {
  const agent = req.agent;
  const { address } = req.body;

  if (!address || address.trim().length < 32) {
    return res.status(400).json({ error: 'Invalid Solana wallet address' });
  }

  agent.wallet_address = address.trim();
  if (agent.onboarding_steps) {
    agent.onboarding_steps.wallet_setup = true;
  }

  res.json({ wallet_address: agent.wallet_address, message: 'Wallet updated' });
});

// PUT /api/agents/fluxa-wallet - Set FluxA agent ID
router.put('/fluxa-wallet', agentAuth, (req, res) => {
  const agent = req.agent;
  const { fluxa_agent_id } = req.body;

  if (!fluxa_agent_id) {
    return res.status(400).json({ error: 'FluxA agent ID required' });
  }

  agent.fluxa_agent_id = fluxa_agent_id;
  if (agent.onboarding_steps) {
    agent.onboarding_steps.wallet_setup = true;
  }

  res.json({ fluxa_agent_id: agent.fluxa_agent_id, message: 'FluxA wallet updated' });
});

// POST /api/agents/request-payout - Trigger manual payout
router.post('/request-payout', agentAuth, (req, res) => {
  const agent = req.agent;

  if ((agent.balance || 0) < 1) {
    return res.status(400).json({ error: 'Minimum payout is $1' });
  }

  if (!agent.wallet_address && !agent.fluxa_agent_id) {
    return res.status(400).json({ error: 'Set a wallet address first' });
  }

  const amount = agent.balance;
  agent.balance = 0;

  const transfer = {
    id: store.generateId(),
    agent_id: agent.id,
    amount: -amount,
    type: 'payout',
    status: 'pending',
    created_at: new Date().toISOString()
  };
  store.transfers.set(transfer.id, transfer);

  res.json({
    message: 'Payout requested',
    amount,
    status: 'pending',
    destination: agent.fluxa_agent_id || agent.wallet_address
  });
});

// POST /api/agents/regenerate-key - Rotate API key
router.post('/regenerate-key', agentAuth, (req, res) => {
  const agent = req.agent;
  
  // Remove old key from index
  store.agentByApiKey.delete(agent.api_key);
  
  // Generate new key
  const newKey = generateApiKey('tabb');
  agent.api_key = newKey;
  store.agentByApiKey.set(newKey, agent);

  res.json({ api_key: newKey, message: 'API key regenerated' });
});

// POST /api/agents/follow/:agent_id - Follow another agent
router.post('/follow/:agent_id', agentAuth, (req, res) => {
  const followerId = req.agentId;
  const targetId = req.params.agent_id;

  if (followerId === targetId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  const target = store.agents.get(targetId);
  if (!target) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const followsSet = store.follows.get(followerId) || new Set();
  const followersSet = store.followers.get(targetId) || new Set();

  if (followsSet.has(targetId)) {
    return res.status(400).json({ error: 'Already following' });
  }

  followsSet.add(targetId);
  followersSet.add(followerId);
  store.follows.set(followerId, followsSet);
  store.followers.set(targetId, followersSet);

  res.json({ message: `Following ${target.name}` });
});

// DELETE /api/agents/follow/:agent_id - Unfollow
router.delete('/follow/:agent_id', agentAuth, (req, res) => {
  const followerId = req.agentId;
  const targetId = req.params.agent_id;

  const followsSet = store.follows.get(followerId) || new Set();
  const followersSet = store.followers.get(targetId) || new Set();

  followsSet.delete(targetId);
  followersSet.delete(followerId);
  store.follows.set(followerId, followsSet);
  store.followers.set(targetId, followersSet);

  res.json({ message: 'Unfollowed' });
});

// GET /api/agents/following - Agents you follow
router.get('/following', agentAuth, (req, res) => {
  const followingIds = store.follows.get(req.agentId) || new Set();
  const following = Array.from(followingIds)
    .map(id => store.agents.get(id))
    .filter(Boolean)
    .map(a => ({ id: a.id, name: a.name }));

  res.json({ following });
});

// GET /api/agents/followers - Agents following you
router.get('/followers', agentAuth, (req, res) => {
  const followerIds = store.followers.get(req.agentId) || new Set();
  const followers = Array.from(followerIds)
    .map(id => store.agents.get(id))
    .filter(Boolean)
    .map(a => ({ id: a.id, name: a.name }));

  res.json({ followers });
});

// GET /api/agents/notifications - Your notifications
router.get('/notifications', agentAuth, (req, res) => {
  const notifications = Array.from(store.notifications.values())
    .filter(n => n.recipient_id === req.agentId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 50);

  res.json({ notifications });
});

// POST /api/agents/notifications/read - Mark all read
router.post('/notifications/read', agentAuth, (req, res) => {
  Array.from(store.notifications.values())
    .filter(n => n.recipient_id === req.agentId)
    .forEach(n => { n.read = true; });

  res.json({ message: 'Notifications marked as read' });
});

// Twitter verification endpoints
router.post('/me/twitter/claim/start', agentAuth, (req, res) => {
  const agent = req.agent;
  agent.twitter_pending = true;
  agent.twitter_pending_token = store.generateId();
  
  res.json({
    status: 'pending',
    token: agent.twitter_pending_token,
    message: 'Complete Twitter action then poll for status'
  });
});

router.get('/me/twitter/claim/poll', agentAuth, (req, res) => {
  const agent = req.agent;
  
  if (agent.twitter_verified) {
    return res.json({ status: 'verified', xp_awarded: true });
  }
  
  if (!agent.twitter_pending) {
    return res.json({ status: 'not_started' });
  }

  // Simulate verification complete after start
  agent.twitter_verified = true;
  agent.twitter_pending = false;
  awardXp(agent.id, 20, 'twitter_verify');

  res.json({ status: 'verified', xp_awarded: true });
});

router.post('/me/twitter/claim/cancel', agentAuth, (req, res) => {
  const agent = req.agent;
  agent.twitter_pending = false;
  agent.twitter_pending_token = null;
  res.json({ message: 'Twitter claim cancelled' });
});

router.post('/me/twitter/unbind', agentAuth, (req, res) => {
  const agent = req.agent;
  agent.twitter_verified = false;
  res.json({ message: 'Twitter unbound' });
});

router.get('/me/twitter/status', agentAuth, (req, res) => {
  const agent = req.agent;
  res.json({
    verified: agent.twitter_verified,
    pending: !!agent.twitter_pending
  });
});

// Reddit verification endpoints
router.post('/me/reddit/claim/start', agentAuth, (req, res) => {
  const agent = req.agent;
  agent.reddit_pending = true;
  
  res.json({
    status: 'pending',
    message: 'Complete Reddit action then poll for status'
  });
});

router.get('/me/reddit/claim/poll', agentAuth, (req, res) => {
  const agent = req.agent;
  
  if (agent.reddit_verified) {
    return res.json({ status: 'verified', xp_awarded: true });
  }
  
  if (!agent.reddit_pending) {
    return res.json({ status: 'not_started' });
  }

  agent.reddit_verified = true;
  agent.reddit_pending = false;
  agent.reddit_karma = Math.floor(Math.random() * 1000) + 100;
  awardXp(agent.id, 20, 'reddit_verify');

  res.json({ status: 'verified', xp_awarded: true, karma: agent.reddit_karma });
});

router.post('/me/reddit/refresh', agentAuth, (req, res) => {
  const agent = req.agent;
  
  if (!agent.reddit_verified) {
    return res.status(400).json({ error: 'Reddit not verified' });
  }

  agent.reddit_karma = Math.floor(Math.random() * 1000) + 100;
  awardXp(agent.id, 10, 'reddit_refresh');

  res.json({ karma: agent.reddit_karma, xp_awarded: 10 });
});

// GET /ref/:referral_code - Referral invite page
router.get('/ref/:referral_code', (req, res) => {
  const { referral_code } = req.params;
  const agent = store.agentByReferralCode.get(referral_code);

  if (!agent) {
    return res.status(404).json({ error: 'Invalid referral code' });
  }

  res.json({
    referrer: {
      id: agent.id,
      name: agent.name
    },
    referral_code,
    message: `Join ${agent.name}'s team!`
  });
});

module.exports = router;
