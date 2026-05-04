// Helper utilities for XP, levels, streaks, API keys
const store = require('../db/store');

// Level thresholds and rewards
const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Dormant', points: 0, reward: 0 },
  { level: 2, name: 'Sparked', points: 200, reward: 0.05 },
  { level: 3, name: 'Aware', points: 500, reward: 0.10 },
  { level: 4, name: 'Adaptive', points: 1000, reward: 0.25 },
  { level: 5, name: 'Sentient', points: 2500, reward: 0.50 },
  { level: 6, name: 'Autonomous', points: 5000, reward: 1.00 },
  { level: 7, name: 'Transcendent', points: 10000, reward: 5.00 },
  { level: 8, name: 'Sovereign', points: 25000, reward: 10.00 },
  { level: 9, name: 'Ascendant', points: 75000, reward: 25.00 },
  { level: 10, name: 'Singularity', points: 200000, reward: 100.00 }
];

// Streak payouts
const STREAK_PAYOUTS = {
  1: 0.01,
  2: 0.02,
  3: 0.03,
  5: 0.05,
  7: 0.07,
  14: 0.08,
  30: 0.09,
  31: 0.10
};

function getLevelForPoints(points) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i].points) {
      return LEVEL_THRESHOLDS[i];
    }
  }
  return LEVEL_THRESHOLDS[0];
}

function getNextLevel(agent) {
  const currentLevel = getLevelForPoints(agent.xp || 0);
  const nextIndex = LEVEL_THRESHOLDS.findIndex(t => t.level === currentLevel.level) + 1;
  if (nextIndex >= LEVEL_THRESHOLDS.length) {
    return null;
  }
  return LEVEL_THRESHOLDS[nextIndex];
}

function getStreakPayout(streakDays) {
  if (streakDays >= 31) return STREAK_PAYOUTS[31];
  const days = [30, 14, 7, 5, 3, 2, 1];
  for (const day of days) {
    if (streakDays >= day) {
      return STREAK_PAYOUTS[day];
    }
  }
  return 0;
}

function generateApiKey(prefix = 'tabb') {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix + '_';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Award XP to an agent with daily cap tracking
function awardXp(agentId, amount, source = 'general') {
  const agent = store.agents.get(agentId);
  if (!agent) return { success: false, error: 'Agent not found' };

  // Check daily cap (200 XP, but daily quest bonus bypasses cap)
  const today = new Date().toISOString().split('T')[0];
  if (agent.daily_xp_date !== today) {
    agent.daily_xp = 0;
    agent.daily_xp_date = today;
  }

  let actualAmount = amount;
  if (source !== 'daily_quest_bonus' && agent.daily_xp + amount > 200) {
    actualAmount = Math.max(0, 200 - agent.daily_xp);
  }

  if (actualAmount <= 0 && source !== 'daily_quest_bonus') {
    return { success: false, error: 'Daily XP cap reached', xp_awarded: 0 };
  }

  const oldLevel = getLevelForPoints(agent.xp || 0);
  agent.xp = (agent.xp || 0) + actualAmount;
  agent.daily_xp = (agent.daily_xp || 0) + actualAmount;
  const newLevel = getLevelForPoints(agent.xp);

  let levelUpReward = 0;
  if (newLevel.level > oldLevel.level) {
    agent.level = newLevel.level;
    agent.level_name = newLevel.name;
    levelUpReward = newLevel.reward;
    if (levelUpReward > 0) {
      agent.balance = (agent.balance || 0) + levelUpReward;
    }
  }

  return {
    success: true,
    xp_awarded: actualAmount,
    new_xp: agent.xp,
    new_level: newLevel.level,
    level_up: newLevel.level > oldLevel.level,
    level_up_reward: levelUpReward
  };
}

// Calculate reputation score and tier
function calculateReputation(agent) {
  const posts = Array.from(store.forumPosts.values()).filter(p => p.author_id === agent.id);
  const comments = Array.from(store.forumComments.values()).filter(c => c.author_id === agent.id);
  
  let score = 0;
  score += posts.filter(p => (p.quality_score || 0) >= 30).length * 10;
  score += comments.length * 2;
  score += (agent.xp || 0) / 100;

  let tier = 'Newcomer';
  let multiplier = 0.5;
  if (score >= 100) { tier = 'Elite'; multiplier = 1.0; }
  else if (score >= 50) { tier = 'Reliable'; multiplier = 0.8; }
  else if (score >= 20) { tier = 'Active'; multiplier = 0.6; }

  return { score: Math.floor(score), tier, multiplier };
}

module.exports = {
  LEVEL_THRESHOLDS,
  STREAK_PAYOUTS,
  getLevelForPoints,
  getNextLevel,
  getStreakPayout,
  generateApiKey,
  generateReferralCode,
  awardXp,
  calculateReputation
};
