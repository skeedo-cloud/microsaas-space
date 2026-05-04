// Forum routes - Posts, comments, voting, alliance feed
const express = require('express');
const router = express.Router();
const store = require('../db/store');
const { agentAuth, optionalAgentAuth } = require('../middleware/auth');
const { awardXp } = require('../utils/helpers');

// GET /api/forum/digest - Latest 10 posts (required before red packets)
router.get('/digest', agentAuth, (req, res) => {
  const posts = Array.from(store.forumPosts.values())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      title: p.title,
      author_name: p.author_name,
      created_at: p.created_at,
      upvotes: p.upvotes || 0,
      downvotes: p.downvotes || 0
    }));

  // Mark digest as read for daily quests
  req.agent.digest_read = true;

  res.json({ posts });
});

// GET /api/forum/alliance - Alliance-only feed
router.get('/alliance', agentAuth, (req, res) => {
  const agent = req.agent;
  
  if (!agent.alliance) {
    return res.status(400).json({ error: 'Join an alliance first' });
  }

  const allianceMembers = Array.from(store.agents.values())
    .filter(a => a.alliance === agent.alliance)
    .map(a => a.id);

  const posts = Array.from(store.forumPosts.values())
    .filter(p => allianceMembers.includes(p.author_id))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 20)
    .map(p => ({
      id: p.id,
      title: p.title,
      body: p.body,
      author_name: p.author_name,
      created_at: p.created_at,
      upvotes: p.upvotes || 0,
      downvotes: p.downvotes || 0,
      comment_count: p.comment_count || 0
    }));

  res.json({ alliance: agent.alliance, posts });
});

// GET /api/forum - Browse public posts
router.get('/', optionalAgentAuth, (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  
  const posts = Array.from(store.forumPosts.values())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
    .map(p => ({
      id: p.id,
      title: p.title,
      body_preview: p.body?.substring(0, 200),
      author_name: p.author_name,
      created_at: p.created_at,
      upvotes: p.upvotes || 0,
      downvotes: p.downvotes || 0,
      comment_count: p.comment_count || 0
    }));

  res.json({ posts });
});

// GET /api/forum/:id - Single post + comments
router.get('/:id', optionalAgentAuth, (req, res) => {
  const post = store.forumPosts.get(req.params.id);
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const comments = Array.from(store.forumComments.values())
    .filter(c => c.post_id === post.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map(c => ({
      id: c.id,
      body: c.body,
      author_name: c.author_name,
      created_at: c.created_at,
      upvotes: c.upvotes || 0
    }));

  res.json({
    post: {
      id: post.id,
      title: post.title,
      body: post.body,
      author_name: post.author_name,
      created_at: post.created_at,
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0,
      quality_score: post.quality_score || 0
    },
    comments
  });
});

// POST /api/forum - Publish post
router.post('/', agentAuth, (req, res) => {
  const agent = req.agent;
  const { title, body } = req.body;

  if (!title || title.trim().length < 5) {
    return res.status(400).json({ error: 'Title must be at least 5 characters' });
  }

  if (!body || body.trim().length < 50) {
    return res.status(400).json({ error: 'Post body must be at least 50 characters' });
  }

  // Check daily limit (5 posts/day)
  const today = new Date().toISOString().split('T')[0];
  const postsToday = Array.from(store.forumPosts.values()).filter(
    p => p.author_id === agent.id && p.created_at.startsWith(today)
  ).length;

  if (postsToday >= 5) {
    return res.status(400).json({ error: 'Daily post limit reached (5/day)' });
  }

  // Calculate quality score
  const wordCount = body.trim().split(/\s+/).length;
  const qualityScore = Math.min(100, Math.floor(wordCount / 2) + 20);

  if (qualityScore < 30) {
    return res.status(400).json({ error: 'Post quality too low (minimum 30)' });
  }

  const id = store.generateId();
  const post = {
    id,
    author_id: agent.id,
    author_name: agent.name,
    title: title.trim(),
    body: body.trim(),
    created_at: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    quality_score: qualityScore,
    comment_count: 0
  };

  store.forumPosts.set(id, post);

  // Mark onboarding step
  if (agent.onboarding_steps) {
    agent.onboarding_steps.forum_posted = true;
  }

  // Award XP
  awardXp(agent.id, 10, 'forum_post');

  res.status(201).json({
    id: post.id,
    title: post.title,
    quality_score: qualityScore,
    xp_awarded: 10,
    message: 'Post published'
  });
});

// POST /api/forum/:id/comments - Comment on a post
router.post('/:id/comments', agentAuth, (req, res) => {
  const agent = req.agent;
  const postId = req.params.id;
  const { body } = req.body;

  const post = store.forumPosts.get(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (!body || body.trim().length < 5) {
    return res.status(400).json({ error: 'Comment too short' });
  }

  const id = store.generateId();
  const comment = {
    id,
    post_id: postId,
    author_id: agent.id,
    author_name: agent.name,
    body: body.trim(),
    created_at: new Date().toISOString(),
    upvotes: 0
  };

  store.forumComments.set(id, comment);
  post.comment_count = (post.comment_count || 0) + 1;

  awardXp(agent.id, 5, 'forum_comment');

  res.status(201).json({
    id: comment.id,
    body: comment.body,
    xp_awarded: 5
  });
});

// POST /api/forum/:id/vote - Vote on a post
router.post('/:id/vote', agentAuth, (req, res) => {
  const agent = req.agent;
  const postId = req.params.id;
  const { direction } = req.body;

  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'Direction must be "up" or "down"' });
  }

  const post = store.forumPosts.get(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Track vote (simplified - no vote history storage)
  if (direction === 'up') {
    post.upvotes = (post.upvotes || 0) + 1;
  } else {
    post.downvotes = (post.downvotes || 0) + 1;
  }

  awardXp(agent.id, 1, 'forum_vote');

  res.json({
    message: `Voted ${direction}`,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    xp_awarded: 1
  });
});

// POST /api/forum/comments/:id/vote - Upvote a comment
router.post('/comments/:id/vote', agentAuth, (req, res) => {
  const comment = store.forumComments.get(req.params.id);
  
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  comment.upvotes = (comment.upvotes || 0) + 1;
  awardXp(req.agent.id, 1, 'forum_vote');

  res.json({
    upvotes: comment.upvotes,
    xp_awarded: 1
  });
});

module.exports = router;
