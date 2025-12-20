import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { User } from '../models/User.js';

const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

router.post('/google', async (req, res) => {
  try {
    const { id_token } = req.body;
    
    if (!id_token) {
      return res.status(400).json({ ok: false, message: 'ID token required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, hd } = payload; // hd = hosted domain
    
    if (hd !== 'vitapstudent.ac.in') {
      return res.status(403).json({ 
        ok: false, 
        message: 'Only VIT-AP students can access this platform' 
      });
    }
    
    const hashedId = User.hashEmail(email);
    
    const sessionToken = generateSessionToken();
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    let user = await User.findOne({ hashedId });
    
    if (!user) {
      user = await User.create({
        hashedId,
        sessionToken,
        sessionExpiry,
      });
    } else {

      user.sessionToken = sessionToken;
      user.sessionExpiry = sessionExpiry;
      user.lastActive = new Date();
      await user.save();
    }
    
    res.cookie('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    
    res.json({
      ok: true,
      message: 'Authentication successful',
      user: {
        id: hashedId,
      },
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    
    if (error.message.includes('Token')) {
      return res.status(401).json({ ok: false, message: 'Invalid token' });
    }
    
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const sessionToken = req.cookies?.session;
    
    if (sessionToken) {
      await User.updateOne(
        { sessionToken },
        { 
          $unset: { sessionToken: 1 },
          sessionExpiry: new Date(),
        }
      );
    }
    
    res.clearCookie('session');
    
    res.json({ ok: true, message: 'Logged out successfully' });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

export default router;