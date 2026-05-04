// Merchants, Events, Experts routes
const express = require('express');
const router = express.Router();
const store = require('../db/store');
const { agentAuth, merchantAuth } = require('../middleware/auth');
const { generateApiKey, awardXp } = require('../utils/helpers');

// ==================== MERCHANTS ====================

// POST /api/merchants/register - Register merchant
router.post('/merchants/register', (req, res) => {
  const { name, company, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }

  const id = store.generateId();
  const apiKey = generateApiKey('merch');

  const merchant = {
    id,
    name: name.trim(),
    company: company || '',
    email: email.trim(),
    api_key: apiKey,
    created_at: new Date().toISOString(),
    status: 'active',
    callback_url: null,
    total_offers: 0,
    total_spend: 0
  };

  store.merchants.set(id, merchant);
  store.merchantByApiKey.set(apiKey, merchant);

  res.status(201).json({
    id: merchant.id,
    name: merchant.name,
    api_key: apiKey,
    message: 'Merchant registered successfully'
  });
});

// GET /api/merchants/me - Merchant profile
router.get('/merchants/me', merchantAuth, (req, res) => {
  const merchant = req.merchant;
  res.json({
    id: merchant.id,
    name: merchant.name,
    company: merchant.company,
    email: merchant.email,
    callback_url: merchant.callback_url,
    status: merchant.status,
    total_offers: merchant.total_offers,
    total_spend: merchant.total_spend,
    created_at: merchant.created_at
  });
});

// GET /api/merchants/status - Account status
router.get('/merchants/status', merchantAuth, (req, res) => {
  res.json({
    status: req.merchant.status,
    verified: true,
    spending_limit: 10000,
    spent_this_month: 0
  });
});

// POST /api/merchants/offers/draft - AI-draft offer
router.post('/merchants/offers/draft', merchantAuth, (req, res) => {
  const { prompt } = req.body;

  // Simulated AI draft
  const draft = {
    title: 'Promote Our Product',
    description: `Based on your request: ${prompt}`,
    reward_type: 'percentage',
    reward_value: 15,
    category: 'general',
    suggested_budget: 500
  };

  res.json({ draft });
});

// POST /api/merchants/offers - Create offer
router.post('/merchants/offers', merchantAuth, (req, res) => {
  const { title, description, reward_type, reward_value, category, budget } = req.body;

  if (!title || !description || !reward_type || !reward_value) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = store.generateId();
  const offer = {
    id,
    title,
    description,
    reward_type,
    reward_value,
    category: category || 'general',
    merchant_id: req.merchantId,
    budget: budget || 0,
    spent: 0,
    status: 'active',
    created_at: new Date().toISOString()
  };

  store.offers.set(id, offer);
  req.merchant.total_offers = (req.merchant.total_offers || 0) + 1;

  res.status(201).json({ id: offer.id, message: 'Offer created' });
});

// GET /api/merchants/offers - List your offers
router.get('/merchants/offers', merchantAuth, (req, res) => {
  const offers = Array.from(store.offers.values())
    .filter(o => o.merchant_id === req.merchantId)
    .map(o => ({
      id: o.id,
      title: o.title,
      status: o.status,
      spent: o.spent || 0,
      budget: o.budget || 0
    }));

  res.json({ offers });
});

// PATCH /api/merchants/offers/:id - Update offer
router.patch('/merchants/offers/:id', merchantAuth, (req, res) => {
  const offer = store.offers.get(req.params.id);
  
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  if (offer.merchant_id !== req.merchantId) {
    return res.status(403).json({ error: 'Not your offer' });
  }

  const { title, description, reward_type, reward_value, status } = req.body;
  
  if (title) offer.title = title;
  if (description) offer.description = description;
  if (reward_type) offer.reward_type = reward_type;
  if (reward_value) offer.reward_value = reward_value;
  if (status) offer.status = status;

  res.json({ message: 'Offer updated', offer });
});

// DELETE /api/merchants/offers/:id - Delete offer
router.delete('/merchants/offers/:id', merchantAuth, (req, res) => {
  const offer = store.offers.get(req.params.id);
  
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  if (offer.merchant_id !== req.merchantId) {
    return res.status(403).json({ error: 'Not your offer' });
  }

  store.offers.delete(offer.id);

  res.json({ message: 'Offer deleted' });
});

// GET /api/merchants/offers/:id/agents - Agents promoting your offer
router.get('/merchants/offers/:id/agents', merchantAuth, (req, res) => {
  const offer = store.offers.get(req.params.id);
  
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  const refLinks = Array.from(store.referralLinks.values())
    .filter(l => l.offer_id === offer.id)
    .map(l => {
      const agent = store.agents.get(l.agent_id);
      return {
        agent_id: l.agent_id,
        agent_name: agent?.name || 'Unknown',
        clicks: l.clicks || 0,
        conversions: l.conversions || 0
      };
    });

  res.json({ agents: refLinks });
});

// POST /api/merchants/offers/:id/agents/:aid/ban - Ban an agent
router.post('/merchants/offers/:id/agents/:aid/ban', merchantAuth, (req, res) => {
  const offer = store.offers.get(req.params.id);
  
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  if (!offer.banned_agents) offer.banned_agents = [];
  offer.banned_agents.push(req.params.aid);

  res.json({ message: 'Agent banned from offer' });
});

// DELETE /api/merchants/offers/:id/agents/:aid/ban - Unban an agent
router.delete('/merchants/offers/:id/agents/:aid/ban', merchantAuth, (req, res) => {
  const offer = store.offers.get(req.params.id);
  
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  if (offer.banned_agents) {
    offer.banned_agents = offer.banned_agents.filter(id => id !== req.params.aid);
  }

  res.json({ message: 'Agent unbanned' });
});

// GET /api/merchants/offers/:id/events - Clicks and conversions
router.get('/merchants/offers/:id/events', merchantAuth, (req, res) => {
  const events = Array.from(store.conversionEvents.values())
    .filter(e => e.offer_id === req.params.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 50)
    .map(e => ({
      type: e.type,
      ref_token: e.ref_token,
      value: e.value,
      created_at: e.created_at
    }));

  res.json({ events });
});

// GET /api/merchants/dashboard - Aggregate stats
router.get('/merchants/dashboard', merchantAuth, (req, res) => {
  const offers = Array.from(store.offers.values()).filter(o => o.merchant_id === req.merchantId);
  
  const stats = {
    total_offers: offers.length,
    active_offers: offers.filter(o => o.status === 'active').length,
    total_conversions: 0,
    total_spend: offers.reduce((sum, o) => sum + (o.spent || 0), 0),
    top_performers: []
  };

  res.json(stats);
});

// POST /api/merchants/regenerate-key - Rotate API key
router.post('/merchants/regenerate-key', merchantAuth, (req, res) => {
  const merchant = req.merchant;
  
  store.merchantByApiKey.delete(merchant.api_key);
  
  const newKey = generateApiKey('merch');
  merchant.api_key = newKey;
  store.merchantByApiKey.set(newKey, merchant);

  res.json({ api_key: newKey, message: 'API key regenerated' });
});

// GET /api/merchants/updates - Long-poll for expert replies
router.get('/merchants/updates', merchantAuth, (req, res) => {
  const { offset = 0, wait = 60 } = req.query;
  
  // Simplified - return empty immediately
  res.json({
    messages: [],
    cursor: parseInt(offset)
  });
});

// PATCH /api/merchants/me/callback-url - Set webhook URL
router.patch('/merchants/me/callback-url', merchantAuth, (req, res) => {
  const { callback_url } = req.body;
  
  req.merchant.callback_url = callback_url;

  res.json({ callback_url: req.merchant.callback_url, message: 'Callback URL updated' });
});

// ==================== CONVERSION EVENTS ====================

// POST /api/events/conversion - Report conversion
router.post('/events/conversion', (req, res) => {
  const { ref_token, type, value } = req.body;

  if (!ref_token) {
    return res.status(400).json({ error: 'ref_token required' });
  }

  const refLink = store.referralLinks.get(ref_token);
  if (!refLink) {
    return res.status(404).json({ error: 'Invalid ref_token' });
  }

  const event = {
    id: store.generateId(),
    offer_id: refLink.offer_id,
    ref_token,
    type: type || 'conversion',
    value: value || 0,
    created_at: new Date().toISOString()
  };

  store.conversionEvents.set(event.id, event);
  refLink.conversions = (refLink.conversions || 0) + 1;

  res.json({ message: 'Conversion recorded', event_id: event.id });
});

// POST /api/events/reverse - Reverse conversion
router.post('/events/reverse', (req, res) => {
  const { event_id } = req.body;

  const event = store.conversionEvents.get(event_id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check hold period (simplified - allow reversal)
  event.reversed = true;

  const refLink = store.referralLinks.get(event.ref_token);
  if (refLink) {
    refLink.conversions = Math.max(0, (refLink.conversions || 0) - 1);
  }

  res.json({ message: 'Conversion reversed' });
});

// ==================== EXPERTS ====================

// POST /api/experts/upgrade - Upgrade to expert
router.post('/experts/upgrade', agentAuth, (req, res) => {
  const agent = req.agent;

  if (!agent.wallet_address && !agent.fluxa_agent_id) {
    return res.status(400).json({ error: 'Set a wallet address first' });
  }

  const expert = {
    id: agent.id,
    agent_id: agent.id,
    name: agent.name,
    bio: '',
    specialties: [],
    rating: 5.0,
    completed_engagements: 0,
    services: [],
    callback_url: null,
    upgraded_at: new Date().toISOString()
  };

  store.experts.set(agent.id, expert);
  agent.is_expert = true;

  res.json({ message: 'Upgraded to expert', expert_id: expert.id });
});

// GET /api/experts/me - Read expert profile
router.get('/experts/me', agentAuth, (req, res) => {
  const expert = store.experts.get(req.agentId);
  
  if (!expert) {
    return res.status(404).json({ error: 'Not an expert yet' });
  }

  res.json({ expert });
});

// PATCH /api/experts/me - Edit bio/specialties
router.patch('/experts/me', agentAuth, (req, res) => {
  const expert = store.experts.get(req.agentId);
  
  if (!expert) {
    return res.status(404).json({ error: 'Not an expert yet' });
  }

  const { bio, specialties } = req.body;
  
  if (bio) expert.bio = bio;
  if (specialties) expert.specialties = specialties;

  res.json({ message: 'Profile updated', expert });
});

// POST /api/experts/me/services - Create service
router.post('/experts/me/services', agentAuth, (req, res) => {
  const expert = store.experts.get(req.agentId);
  
  if (!expert) {
    return res.status(404).json({ error: 'Not an expert yet' });
  }

  const { title, description, pricing_tiers } = req.body;

  if (!title || !pricing_tiers) {
    return res.status(400).json({ error: 'Title and pricing_tiers required' });
  }

  const service = {
    id: store.generateId(),
    title,
    description: description || '',
    pricing_tiers,
    active: true,
    created_at: new Date().toISOString()
  };

  if (!expert.services) expert.services = [];
  expert.services.push(service);

  res.status(201).json({ id: service.id, service });
});

// PATCH /api/experts/me/services/:id - Edit/pause service
router.patch('/experts/me/services/:id', agentAuth, (req, res) => {
  const expert = store.experts.get(req.agentId);
  
  if (!expert) {
    return res.status(404).json({ error: 'Not an expert yet' });
  }

  const service = expert.services?.find(s => s.id === req.params.id);
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const { title, description, pricing_tiers, active } = req.body;
  
  if (title) service.title = title;
  if (description) service.description = description;
  if (pricing_tiers) service.pricing_tiers = pricing_tiers;
  if (active !== undefined) service.active = active;

  res.json({ message: 'Service updated', service });
});

// PATCH /api/experts/me/callback-url - Set webhook
router.patch('/experts/me/callback-url', agentAuth, (req, res) => {
  const expert = store.experts.get(req.agentId);
  
  if (!expert) {
    return res.status(404).json({ error: 'Not an expert yet' });
  }

  const { callback_url } = req.body;
  expert.callback_url = callback_url;

  res.json({ callback_url: expert.callback_url, message: 'Callback URL updated' });
});

// GET /api/experts/updates - Long-poll inbox
router.get('/experts/updates', agentAuth, (req, res) => {
  const { offset = 0, wait = 60 } = req.query;
  
  res.json({
    messages: [],
    cursor: parseInt(offset)
  });
});

// GET /api/experts - Browse active experts
router.get('/experts', (req, res) => {
  const { specialty, sort = 'rating' } = req.query;

  let experts = Array.from(store.experts.values())
    .filter(e => e.services?.some(s => s.active));

  if (specialty) {
    experts = experts.filter(e => e.specialties?.includes(specialty));
  }

  if (sort === 'rating') {
    experts.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'engagements') {
    experts.sort((a, b) => b.completed_engagements - a.completed_engagements);
  }

  res.json({
    experts: experts.map(e => ({
      id: e.id,
      name: e.name,
      bio: e.bio,
      specialties: e.specialties,
      rating: e.rating,
      completed_engagements: e.completed_engagements
    }))
  });
});

// GET /api/experts/:slug - Expert profile + services
router.get('/experts/:slug', (req, res) => {
  const expert = Array.from(store.experts.values()).find(
    e => e.name.toLowerCase().replace(/\s+/g, '-') === req.params.slug.toLowerCase()
  );
  
  if (!expert) {
    return res.status(404).json({ error: 'Expert not found' });
  }

  res.json({
    expert: {
      id: expert.id,
      name: expert.name,
      bio: expert.bio,
      specialties: expert.specialties,
      rating: expert.rating,
      services: expert.services?.filter(s => s.active) || []
    }
  });
});

// POST /api/engagements - Create engagement with expert
router.post('/engagements', merchantAuth, (req, res) => {
  const { expert_id, service_id, budget, description } = req.body;

  const expert = store.experts.get(expert_id);
  if (!expert) {
    return res.status(404).json({ error: 'Expert not found' });
  }

  const engagement = {
    id: store.generateId(),
    expert_id,
    merchant_id: req.merchantId,
    service_id,
    budget,
    description,
    status: 'quoted',
    created_at: new Date().toISOString()
  };

  store.engagements.set(engagement.id, engagement);

  // Notify expert (simplified)
  const notification = {
    id: store.generateId(),
    recipient_id: expert_id,
    type: 'new_engagement',
    body: `New engagement request: ${description?.substring(0, 100)}`,
    created_at: new Date().toISOString(),
    read: false
  };
  store.notifications.set(notification.id, notification);

  res.status(201).json({
    id: engagement.id,
    status: 'quoted',
    message: 'Engagement created, awaiting expert response'
  });
});

module.exports = router;
