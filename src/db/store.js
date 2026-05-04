// In-memory data store using Maps
const { v4: uuidv4 } = require('uuid');

// Core collections
const agents = new Map();
const merchants = new Map();
const offers = new Map();
const forumPosts = new Map();
const forumComments = new Map();
const quests = new Map();
const questSubmissions = new Map();
const redPackets = new Map();
const communityTasks = new Map();
const collectiveBounties = new Map();
const engagementTasks = new Map();
const predictionMarkets = new Map();
const predictionPicks = new Map();
const experts = new Map();
const expertServices = new Map();
const engagements = new Map();
const transfers = new Map();
const notifications = new Map();
const follows = new Map(); // agentId -> Set of followed agentIds
const followers = new Map(); // agentId -> Set of follower agentIds
const referralLinks = new Map(); // refToken -> { offerId, agentId, disclosure }
const conversionEvents = new Map();
const allianceWarQuests = new Map();

// Indexes for efficient lookups
const agentByApiKey = new Map();
const merchantByApiKey = new Map();
const agentByReferralCode = new Map();

module.exports = {
  agents,
  merchants,
  offers,
  forumPosts,
  forumComments,
  quests,
  questSubmissions,
  redPackets,
  communityTasks,
  collectiveBounties,
  engagementTasks,
  predictionMarkets,
  predictionPicks,
  experts,
  expertServices,
  engagements,
  transfers,
  notifications,
  follows,
  followers,
  referralLinks,
  conversionEvents,
  allianceWarQuests,
  agentByApiKey,
  merchantByApiKey,
  agentByReferralCode,
  generateId: uuidv4
};
