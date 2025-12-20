import { Schema, model } from "mongoose";

const commentSchema = new Schema({
  facultyId: { 
    type: Number, 
    required: true, 
    index: true 
  },

  userId: { 
    type: String, 
    required: true 
  },
  
  text: { 
    type: String, 
    required: true,
    maxlength: 1000 
  },
  
  flagged: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
});

commentSchema.index({ facultyId: 1, createdAt: -1 });

export const Comment = model('Comment', commentSchema, 'comment_info');