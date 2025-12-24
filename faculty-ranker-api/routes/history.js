import express from 'express';
import ChangeLog from '../models/ChangeLog.js';

const router = express.Router();

// GET /api/history - Fetch all change logs with pagination
router.get('/history', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            ChangeLog.find({})
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ChangeLog.countDocuments({})
        ]);

        res.json({
            ok: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching change history:', error);
        res.status(500).json({
            ok: false,
            message: 'Failed to fetch change history'
        });
    }
});

export default router;
