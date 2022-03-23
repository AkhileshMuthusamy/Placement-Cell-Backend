const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    title: String,
    
    date: {
        type: Date,
        required: false
    }
}, {timestamps: true})