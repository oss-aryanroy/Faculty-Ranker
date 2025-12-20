import { Router } from 'express';
import { Report } from '../models/Report.js';
import dotenv from 'dotenv'

import { requireAdminAccess, requireAuth } from '../helpers/functions.js';
import Professor from '../models/Professor.js';

dotenv.config();


const router = Router();

router.get('/admin/verify', requireAuth, async (req, res) => {
  res.json({ ok: true, isAdmin: req.user.isAdmin });
});


router.get('/admin/reports', requireAuth, requireAdminAccess, async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = status && status !== 'all' ? { status } : {};
  
  const reports = await Report.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const count = await Report.countDocuments(query);
  
  const stats = {
    pending: await Report.countDocuments({ status: 'pending' }),
    reviewed: await Report.countDocuments({ status: 'reviewed' }),
    resolved: await Report.countDocuments({ status: 'resolved' }),
    dismissed: await Report.countDocuments({ status: 'dismissed' })
  };
  
  res.json({
    ok: true,
    reports,
    totalPages: Math.ceil(count / limit),
    stats
  });
});

router.post('/admin/faculty-details', requireAuth, requireAdminAccess, async (req, res) => {
  const { facultyIds } = req.body;
  const faculties = await Professor.find({ emp_id: { $in: facultyIds } });
  
  const facultyMap = {};
  faculties.forEach(f => {
    facultyMap[f.emp_id] = {
      name: f.name,
      department: f.department
    };
  });
  
  res.json({ ok: true, facultyMap });
});

router.options('/admin/reports/:id', requireAuth, requireAdminAccess, async (req, res) => {
  const { status, reviewNotes } = req.body;
  
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    {
      status,
      reviewNotes,
      reviewedAt: new Date(),
      reviewedBy: req.session.user.email
    },
    { new: true }
  );
  
  res.json({ ok: true, report });
});

export default router;