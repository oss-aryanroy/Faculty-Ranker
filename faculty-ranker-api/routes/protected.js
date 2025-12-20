// routes/protected.js
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

import { config } from 'dotenv';
config();

const router = Router();

function requireAuth(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = payload;
    next();
  });
}

router.get('/me', async (req, res) => {
  try {
    const sessionToken = req.cookies?.session;
    
    if (!sessionToken) {
      return res.status(401).json({ ok: false, message: 'Not authenticated' });
    }
    
    const user = await User.findOne({
      sessionToken,
      sessionExpiry: { $gt: new Date() },
    });
    
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Invalid or expired session' });
    }
    
    user.lastActive = new Date();
    await user.save();
    
    res.json({
      ok: true,
      user: {
        id: user.hashedId,
      },
    });
    
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// example protected endpoint
router.get('/profile', requireAuth, async (req, res) => {
  const u = await User.findById(req.user.userId);
  res.json({ ok: true, profile: { name: u.name, email: u.email, picture: u.picture } });
});

export default router;
