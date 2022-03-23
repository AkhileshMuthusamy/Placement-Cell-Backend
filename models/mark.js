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
        type: [new mongoose.Schema({ subject: String, mark: Number })],
        required: [true, 'Field cannot be empty'],
    },
    previousGpa: [Number],
    previousGpaHeader: [String],
    sgpa: Number,
    cgpa: Number,
}, {timestamps: true});


module.exports = mongoose.model('Mark', markSchema);