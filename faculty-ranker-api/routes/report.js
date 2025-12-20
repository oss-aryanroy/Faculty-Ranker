import express from 'express';
import { Report } from '../models/Report.js';
import { requireAuth } from '../helpers/functions.js';


const router = express.Router();

router.post('/report', requireAuth, async (req, res) => {
  try {
    const { facultyId, reason, additionalInfo } = req.body;
    const userId = req.user.id;

    if (!facultyId || typeof facultyId !== 'number') {
      return res.status(400).json({ 
        ok: false, 
        message: 'Valid faculty ID is required' 
      });
    }

    if (!reason || !['wrong_image', 'inconsistent_info'].includes(reason)) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Valid reason is required' 
      });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const existingReport = await Report.findOne({
      facultyId,
      userId,
      reason,
      createdAt: { $gte: sevenDaysAgo }
    });

    if (existingReport) {
      return res.status(429).json({ 
        ok: false, 
        message: 'You have already reported this issue recently.' 
      });
    }

    const report = new Report({
      facultyId,
      userId,
      reason,
      additionalInfo: additionalInfo?.trim() || ''
    });

    await report.save();

    res.json({ 
      ok: true, 
      message: 'Report submitted successfully',
      reportId: report._id 
    });

  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to submit report' 
    });
  }
});

export default router;