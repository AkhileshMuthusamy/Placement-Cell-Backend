const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'Field cannot be empty'],
    },
    name: {
        type: String,
        required: [true, 'Field cannot be empty'],
    },
    semester: {
        type: Number,
        required: [true, 'Field cannot be empty'],
    },
    marks: {
        type: [new mongoose.Schema({ subject: String, mark: Number, credit: Number })],
        required: [true, 'Field cannot be empty'],
    },
    previousGpa: [Number],
    previousGpaHeader: [String],
    sgpa: Number,
    cgpa: Number,
    uploadedBy: String,
    uploadedAt: String,
}, {timestamps: true});

markSchema.pre('insertMany', function(next, docs) {
    const current_date = new Date();

    if (Array.isArray(docs) && docs.length) {
        docs = docs.map(mark => {
            mark.uploadedAt = current_date.toISOString();
        });
        next();
    } else {
        next(new Error("No documents to insert"));
    }
});

module.exports = mongoose.model('Mark', markSchema);