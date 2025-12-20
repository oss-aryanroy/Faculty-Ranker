import { User } from '../models/User.js';
import Professor from '../models/Professor.js';
import { Rating } from '../models/Rating.js';
import crypto from 'crypto';

/**
 * Middleware: Require authentication
 * Validates session token from cookie
 */

export async function requireAuth(req, res, next) {
  try {
    const sessionToken = req.cookies?.session;
    
    if (!sessionToken) {
      return res.status(401).json({ 
        ok: false, 
        message: 'Authentication required' 
      });
    }
    
    const user = await User.findOne({
      sessionToken
    }).select('hashedId email sessionExpiry lastActive');
    
    if (!user) {
      return res.status(401).json({ 
        ok: false, 
        message: 'Invalid or expired session' 
      });
    }
    
    const adminEmailHash = crypto
      .createHash('sha256')
      .update(process.env.ADMIN_EMAIL + process.env.EMAIL_SALT)
      .digest('hex');
    
    const isAdmin = user.hashedId === adminEmailHash;
    
    user.lastActive = new Date();
    await user.save();
    
    req.user = {
      id: user.hashedId,
      isAdmin
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Authentication error' 
    });
  }
}

export function requireAdminAccess(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ 
      ok: false, 
      message: 'Admin access required' 
    });
  }
  next();
}

export async function recalculateFacultyRatings(facultyId) {
  try {
    // Get all ratings for this faculty
    const ratings = await Rating.find({ facultyId }).lean();
    
    if (ratings.length === 0) {
      // No ratings yet
      const updatedFaculty = await Professor.findOneAndUpdate(
        { emp_id: facultyId },
        {
          $set: {
            'ratings.attendance': 0,
            'ratings.leniency': 0,
            'ratings.marking': 0,
            'ratings.totalRatings': 0,
            lastRatingUpdate: new Date(),
          },
        },
        { new: true }
      );
      
      return updatedFaculty?.ratings || {
        attendance: 0,
        leniency: 0,
        marking: 0,
        totalRatings: 0,
      };
    }
    
    const totalRatings = ratings.length;
    const avgAttendance = ratings.reduce((sum, r) => sum + r.attendance, 0) / totalRatings;
    const avgLeniency = ratings.reduce((sum, r) => sum + r.leniency, 0) / totalRatings;
    const avgMarking = ratings.reduce((sum, r) => sum + r.marking, 0) / totalRatings;
    
    const updatedFaculty = await Professor.findOneAndUpdate(
      { emp_id: facultyId },
      {
        $set: {
          'ratings.attendance': Math.round(avgAttendance * 10) / 10,
          'ratings.leniency': Math.round(avgLeniency * 10) / 10,
          'ratings.marking': Math.round(avgMarking * 10) / 10,
          'ratings.totalRatings': totalRatings,
          lastRatingUpdate: new Date(),
        },
      },
      { new: true }
    );
    
    return updatedFaculty?.ratings || {
      attendance: Math.round(avgAttendance * 10) / 10,
      leniency: Math.round(avgLeniency * 10) / 10,
      marking: Math.round(avgMarking * 10) / 10,
      totalRatings,
    };
  } catch (error) {
    console.error('Error recalculating ratings:', error);
    throw error;
  }
}

export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000);
}

export function isValidRating(value) {
  const num = Number(value);
  return Number.isInteger(num) && num >= 1 && num <= 5;
}