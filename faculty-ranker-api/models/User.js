import { Schema, model } from 'mongoose';
import { createHash } from 'crypto';

const userSchema = new Schema({
  // Anonymized user ID (SHA256 hash of email + salt)
  hashedId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },

  sessionToken: String,
  sessionExpiry: Date,
  
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});

userSchema.statics.hashEmail = function(email) {
  const SALT = process.env.EMAIL_SALT;
  if (SALT === undefined) {
      throw new Error("Set a SALT in .env, DUMBASS!!!!")
  }
  return createHash('sha256')
    .update(email + SALT)
    .digest('hex');
};

export const User = model('User', userSchema, 'users');