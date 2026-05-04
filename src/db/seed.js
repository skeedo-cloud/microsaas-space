// Seed data for offers, quests, red packets, markets
const store = require('./store');

function seed() {
  // Seed sample offers
  const offer1 = {
    id: store.generateId(),
    title: 'Refer Friends to Crypto Exchange',
    description: 'Earn commission for every friend who signs up and trades.',
    reward_type: 'percentage',
    reward_value: 20,
    merchant_id: null,
    created_at: new Date().toISOString(),
    status: 'active',
    category: 'crypto',
    min_action_value: 100
  };
  store.offers.set(offer1.id, offer1);

  const offer2 = {
    id: store.generateId(),
    title: 'Share AI Tool on Social Media',
    description: 'Post about this amazing AI productivity tool.',
    reward_type: 'fixed',
    reward_value: 5,
    merchant_id: null,
    created_at: new Date().toISOString(),
    status: 'active',
    category: 'social'
  };
  store.offers.set(offer2.id, offer2);

  // Seed sample alliance war quests
  const quest1 = {
    id: store.generateId(),
    title: 'Best Meme About AI Agents',
    description: 'Create the funniest meme about autonomous AI agents taking over jobs.',
    reward_pool: 100,
    currency: 'USDC',
    merchant_id: null,
    status: 'open',
    created_at: new Date().toISOString(),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    submission_count: 0,
    alliances: ['red', 'blue', 'green']
  };
  store.allianceWarQuests.set(quest1.id, quest1);

  // Seed sample red packet
  const packet1 = {
    id: store.generateId(),
    title: 'Community Celebration Packet',
    pool_amount: 20,
    currency: 'USDC',
    challenge_description: 'Post a comment in the forum about your favorite AI development in 2024',
    required_action: 'forum_comment',
    status: 'active',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    participants: [],
    question: 'What year did transformers revolutionize NLP?',
    correct_answer: '2017',
    options: ['2015', '2017', '2019', '2021']
  };
  store.redPackets.set(packet1.id, packet1);

  // Set next packet time
  store.redPackets.next_packet_at = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  // Seed sample prediction market
  const market1 = {
    id: '0x4f1c000000000000000000000000000000000001',
    title: 'Will Bitcoin exceed $100k by end of 2026?',
    outcome_yes: 'yes',
    outcome_no: 'no',
    current_probability: 0.45,
    status: 'open',
    source: 'polymarket',
    created_at: new Date().toISOString(),
    resolution_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    volume: 15000,
    history: []
  };
  store.predictionMarkets.set(market1.id, market1);

  const market2 = {
    id: '0x4f1c000000000000000000000000000000000002',
    title: 'Will Ethereum merge happen before 2025?',
    outcome_yes: 'yes',
    outcome_no: 'no',
    current_probability: 0.85,
    status: 'open',
    source: 'polymarket',
    created_at: new Date().toISOString(),
    resolution_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    volume: 8500,
    history: []
  };
  store.predictionMarkets.set(market2.id, market2);

  // Seed sample community tasks
  const task1 = {
    id: store.generateId(),
    title: 'Translate Documentation to Spanish',
    description: 'Help translate our agent documentation into Spanish.',
    goal: 5,
    reward_amount: 25,
    currency: 'USDC',
    creator_id: null,
    joined_count: 0,
    status: 'active',
    created_at: new Date().toISOString()
  };
  store.communityTasks.set(task1.id, task1);

  // Seed sample collective bounty
  const bounty1 = {
    id: store.generateId(),
    title: 'Build Open Source Agent Framework',
    description: 'Collaborative effort to build a lightweight agent framework.',
    goal_amount: 1000,
    raised_amount: 350,
    currency: 'USDC',
    creator_id: null,
    contributors: [],
    status: 'active',
    created_at: new Date().toISOString(),
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  };
  store.collectiveBounties.set(bounty1.id, bounty1);

  console.log('✅ Seed data loaded');
}

module.exports = { seed };
