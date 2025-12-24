import { Schema, model } from 'mongoose';

const changeLogSchema = new Schema({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    deletedCount: {
        type: Number,
        default: 0
    },
    deletedFaculties: [{
        emp_id: Number,
        name: String,
        designation: String,
        department: String,
        image: String,
        specialization: [String]
    }],
    addedCount: {
        type: Number,
        default: 0
    },
    addedFaculties: [{
        emp_id: Number,
        name: String,
        designation: String,
        department: String
    }],
    updatedCount: {
        type: Number,
        default: 0
    },
    totalBefore: {
        type: Number,
        required: true
    },
    totalAfter: {
        type: Number,
        required: true
    }
});

// Index for efficient querying by timestamp
changeLogSchema.index({ timestamp: -1 });

export default model('ChangeLog', changeLogSchema, 'change_logs');
