import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  facultyId: {
    type: Number,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    type: String,
    enum: ['wrong_image', 'inconsistent_info'],
    required: true
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: String
  },
  reviewNotes: {
    type: String
  }
});

reportSchema.index({ facultyId: 1, userId: 1 });

export const Report = mongoose.model('Report', reportSchema);