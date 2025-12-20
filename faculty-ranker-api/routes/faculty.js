import { Router } from "express";
import Professor from "../models/Professor.js";
import { Rating } from "../models/Rating.js";
import { requireAuth, recalculateFacultyRatings } from "../helpers/functions.js";
import { Comment } from '../models/Comment.js';

const router = Router();

router.get('/allFaculty', async (req, res) => {
  try {
    const faculties = await Professor.find({});

    const facultyIds = faculties.map(f => f.emp_id);

    const reviewCounts = await Rating.aggregate([
      { $match: { facultyId: { $in: facultyIds } } },
      {
        $group: {
          _id: '$facultyId',
          count: { $sum: 1 }
        }
      }
    ]);

    const commentCounts = await Comment.aggregate([
      { $match: { facultyId: { $in: facultyIds } } },
      {
        $group: {
          _id: '$facultyId',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingsData = await Rating.aggregate([
      { $match: { facultyId: { $in: facultyIds } } },
      {
        $group: {
          _id: '$facultyId',
          attendance: { $avg: '$attendance' },
          leniency: { $avg: '$leniency' },
          marking: { $avg: '$marking' }
        }
      }
    ]);

    const reviewCountMap = {};
    reviewCounts.forEach(item => {
      reviewCountMap[item._id] = item.count;
    });

    const commentCountMap = {};
    commentCounts.forEach(item => {
      commentCountMap[item._id] = item.count;
    });

    const ratingsMap = {};
    ratingsData.forEach(item => {
      ratingsMap[item._id] = {
        attendance: Number(item.attendance.toFixed(1)) || 0,
        leniency: Number(item.leniency.toFixed(1)) || 0,
        marking: Number(item.marking.toFixed(1)) || 0
      };
    });

    const enrichedFaculties = faculties.map(faculty => ({
      ...faculty.toObject(),
      ratings: ratingsMap[faculty.emp_id] || {
        attendance: 0,
        leniency: 0,
        marking: 0
      },
      reviewCount: reviewCountMap[faculty.emp_id] || 0,
      commentCount: commentCountMap[faculty.emp_id] || 0
    }));

    res.json({
      ok: true,
      data: enrichedFaculties
    });

  } catch (error) {
    console.error('Fetch all faculty error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to fetch faculty' 
    });
  }
});

router.post('/faculty/rate', requireAuth, async (req, res) => {
  try {
    const { facultyId, ratings } = req.body;
    const userId = req.user.id;
    
    if (!facultyId || !ratings) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }
    
    const { attendance, leniency, marking } = ratings;
    
    if (!attendance || !leniency || !marking) {
      return res.status(400).json({ ok: false, message: 'All ratings are required' });
    }
    
    if ([attendance, leniency, marking].some(r => r < 1 || r > 5)) {
      return res.status(400).json({ ok: false, message: 'Ratings must be between 1 and 5' });
    }
    
    const faculty = await Professor.findOne({ emp_id: facultyId });
    if (!faculty) {
      return res.status(404).json({ ok: false, message: 'Faculty not found' });
    }
    
    const existingRating = await Rating.findOne({ facultyId, userId });
    const isUpdate = !!existingRating;
    
    const rating = await Rating.findOneAndUpdate(
      { facultyId, userId },
      {
        facultyId,
        userId,
        attendance: attendance,
        leniency: leniency,
        marking: marking,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    
    const updatedRatings = await recalculateFacultyRatings(facultyId);
    const reviewCount = await Rating.countDocuments({ facultyId });
    
    res.json({
      ok: true,
      message: isUpdate ? 'Rating updated successfully' : 'Rating submitted successfully',
      rating,
      updatedRatings,
      reviewCount,
      isUpdate
    });
    
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

router.get("/faculty/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Professor.findOne({
      $or: [
        { emp_id: id },
      ],
    }).lean();

    if (!faculty) {
      return res.status(404).json({ ok: false });
    }

    const facultyIdInt = parseFloat(id);

    const reviewCount = await Rating.countDocuments({ facultyId: facultyIdInt });

    const ratingsData = await Rating.aggregate([
      { $match: { facultyId: facultyIdInt } },
      {
        $group: {
          _id: null,
          attendance: { $avg: '$attendance' },
          leniency: { $avg: '$leniency' },
          marking: { $avg: '$marking' }
        }
      }
    ]);

    const ratings = ratingsData.length > 0 ? {
      attendance: Number(ratingsData[0].attendance.toFixed(1)) || 0,
      leniency: Number(ratingsData[0].leniency.toFixed(1)) || 0,
      marking: Number(ratingsData[0].marking.toFixed(1)) || 0
    } : {
      attendance: 0,
      leniency: 0,
      marking: 0
    };

    const totalComments = await Comment.countDocuments({ facultyId: facultyIdInt });

    console.log(`Faculty ${facultyIdInt}: ${reviewCount} reviews, ${totalComments} comments`);

    res.json({ 
      ok: true, 
      data: {
        ...faculty,
        ratings,
        reviewCount,
        totalComments
      }
    });

  } catch (error) {
    console.error('Fetch faculty error:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});


router.get('/my-rating', requireAuth, async (req, res) => {
  try {
    console.log(req.query.facultyId);
    const facultyId = parseFloat(req.query.facultyId);
    const userId = req.user.id;
    
    const rating = await Rating.findOne({ facultyId, userId });
    console.log(typeof facultyId)
    if (!rating) {
      return res.json({ ok: true, hasRated: false });
    }
    
    res.json({
      ok: true,
      hasRated: true,
      rating: {
        attendance: rating.attendance,
        leniency: rating.leniency,
        marking: rating.marking,
      },
    });
    
  } catch (error) {
    console.error('Fetch user rating error:', error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

export default router;