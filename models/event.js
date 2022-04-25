const mongoose = require('mongoose');
const agenda = require("../modules/scheduler/index");

const eventSchema = new mongoose.Schema({
    
    date: {
        type: Date,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    minCgpa: {
        type: Number,
        required: true
    },
    minHSMark: {
        type: Number,
        required: true
    },
    jd: String,
    skills: [String],
    batch: [String],
    department: [String],
    remindAt: Date,
    reminderJob: mongoose.ObjectId
}, {timestamps: true});

eventSchema.pre('deleteOne', { document: true, query: false }, function(next) {

    if (this.reminderJob) {
        agenda.cancel({'_id': this.reminderJob}).then(result => {
            // 1 => cancelled
            // 0 => Failed to cancel
            console.log('Old job canceled', result);
        });
    }
    next();
});

module.exports = mongoose.model('Event', eventSchema);