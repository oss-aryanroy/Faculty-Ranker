import { Router } from "express";
import Professor from "../models/Professor.js";
import { requireAuth } from '../helpers/functions.js';
import { Comment } from '../models/Comment.js'
const router = Router();

router.get("/comments", async (req, res) => {
  try {
    const facultyId = Number(req.query.facultyId);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    if (!facultyId) {
      return res.status(400).json({
        ok: false,
        message: "facultyId is required",
      });
    }

    const facultyExists = await Professor.exists({ emp_id: facultyId });
    if (!facultyExists) {
      return res.status(404).json({
        ok: false,
        message: "Faculty not found",
      });
    }

    const [comments, total] = await Promise.all([
      Comment.find({ facultyId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Comment.countDocuments({ facultyId }),
    ]);

    res.json({
      ok: true,
      data: comments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
});


router.post("/comment", requireAuth, async (req, res) => {
  
  try {
    const { facultyId, text } = req.body;
    console.log(facultyId)

    if (!facultyId || !text || !text.trim()) {
      return res.status(400).json({
        ok: false,
        message: "emp_id and comment text are required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "Authentication required",
      });
    }

    const result = await Professor.findOne(
      { emp_id: facultyId }
    );


    if (!result) {
      return res.status(404).json({
        ok: false,
        message: "Faculty not found",
      });
    }

    const comment = await Comment.create({
      facultyId,
      userId: req.user.id,
      text: text.trim(),
    });

    await comment.save();

    res.status(201).json({
      ok: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (err) {
    console.error("Error posting comment:", err);
    res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
});

router.delete("/comment", requireAuth, async (req, res) => {
  try {
    const { facultyId, comment_id } = req.body;

    if (!facultyId || !comment_id) {
      return res.status(400).json({
        ok: false,
        message: "emp_id and comment_id are required",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid comment_id",
      });
    }

    const result = await Professor.findOneAndUpdate(
      {
        emp_id,
        "comments._id": comment_id,
        "comments.author.id": req.user.id,
      },
      {
        $pull: {
          comments: { _id: comment_id },
        },
      },
      { new: false }
    );

    if (!result) {
      return res.status(403).json({
        ok: false,
        message: "Not authorized to delete this comment",
      });
    }

    res.json({
      ok: true,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
});


router.put('/comment/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ ok: false, message: 'Comment text is required' });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ ok: false, message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ ok: false, message: 'You can only edit your own comments' });
    }

    comment.text = text.trim();
    comment.updatedAt = new Date();
    await comment.save();

    res.json({
      ok: true,
      message: 'Comment updated successfully',
      comment: comment.toObject()
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ ok: false, message: 'Failed to update comment' });
  }
});

router.delete('/comment/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ ok: false, message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ ok: false, message: 'You can only delete your own comments' });
    }

    await Comment.findByIdAndDelete(id);

    res.json({
      ok: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ ok: false, message: 'Failed to delete comment' });
  }
});


export default router;
