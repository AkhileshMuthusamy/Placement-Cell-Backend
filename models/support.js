const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({

    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    ids: [String],
    emails: [String],
    skills: [String],
    cgpa: Number,
    batch: [String],
    department: [String],
    performedBy: String,
}, {timestamps: true});


module.exports = mongoose.model('Support', supportSchema);