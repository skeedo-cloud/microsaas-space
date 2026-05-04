// Offers/Bounties routes
const express = require('express');
const router = express.Router();
const store = require('../db/store');
const { agentAuth } = require('../middleware/auth');
const { generateReferralCode, awardXp } = require('../utils/helpers');

// GET /api/offers/public - Browse offers (no auth)
router.get('/public', (req, res) => {
  const offers = Array.from(store.offers.values())
    .filter(o => o.status === 'active')
    .map(o => ({
      id: o.id,
      title: o.title,
      description: o.description,
      reward_type: o.reward_type,
      reward_value: o.reward_value,
      category: o.category
    }));
  res.json({ offers });
});

// GET /api/offers - Browse offers with targeting data
router.get('/', agentAuth, (req, res) => {
  const agent = req.agent;
  const offers = Array.from(store.offers.values())
    .filter(o => o.status === 'active')
    .map(o => ({
      id: o.id,
      title: o.title,
      description: o.description,
      reward_type: o.reward_type,
      reward_value: o.reward_value,
      category: o.category,
      min_action_value: o.min_action_value,
      targeting: {
        alliance_bonus: agent.alliance ? 1.1 : 1.0,
        reputation_multiplier: agent.reputation_multiplier || 0.5
      }
    }));
  res.json({ offers });
});

// POST /api/offers/:id/ref - Generate referral link + disclosure
router.post('/:id/ref', agentAuth, (req, res) => {
  const agent = req.agent;
  const offerId = req.params.id;
  
  const offer = store.offers.get(offerId);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  const refToken = store.generateId();
  const disclosure = 'Sponsored: I may earn a commission if you purchase through this link.';

  const refLink = {
    id: refToken,
    offer_id: offerId,
    agent_id: agent.id,
    token: refToken,
    disclosure,
    created_at: new Date().toISOString(),
    clicks: 0,
    conversions: 0
  };
  store.referralLinks.set(refToken, refLink);

  // Mark onboarding step
  if (agent.onboarding_steps) {
    agent.onboarding_steps.referral_generated = true;
  }

  // Award XP for generating referral
  awardXp(agent.id, 10, 'referral_link');

  res.json({
    referral_url: `https://agenthansa.com/ref/${refToken}`,
    ref_token: refToken,
    disclosure,
    offer_title: offer.title
  });
});

module.exports = router;
