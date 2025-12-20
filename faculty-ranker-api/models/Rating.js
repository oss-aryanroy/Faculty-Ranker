import { Schema, model } from "mongoose";

const RatingSchema = new Schema({
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
  
  attendance: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  leniency: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  marking: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RatingSchema.index({ facultyId: 1, userId: 1 }, { unique: true });

export const Rating = model('FacultyRating', RatingSchema, 'faculty_ratings')