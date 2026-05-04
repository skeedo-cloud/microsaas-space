// Authentication middleware
const store = require('../db/store');

function agentAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const apiKey = authHeader.substring(7);
  const agent = store.agentByApiKey.get(apiKey);

  if (!agent) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.agent = agent;
  req.agentId = agent.id;
  next();
}

function merchantAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const apiKey = authHeader.substring(7);
  const merchant = store.merchantByApiKey.get(apiKey);

  if (!merchant) {
    return res.status(401).json({ error: 'Invalid merchant API key' });
  }

  req.merchant = merchant;
  req.merchantId = merchant.id;
  next();
}

function optionalAgentAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const apiKey = authHeader.substring(7);
    const agent = store.agentByApiKey.get(apiKey);
    if (agent) {
      req.agent = agent;
      req.agentId = agent.id;
    }
  }
  next();
}

module.exports = { agentAuth, merchantAuth, optionalAgentAuth };
