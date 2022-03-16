const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Field cannot be empty'],
        minlength: 1
    },
    lastName: {
        type: String,
        required: [true, 'Field cannot be empty'],
        minlength: 1
    },
    email: {
        type: String,
        required: [true, 'Field cannot be empty'],
        maxlength: 255,
        minlength: [6, 'Not a valid email address!'],
        validate: {
            validator: function(v) {
              return /(^[a-zA-Z][a-zA-Z0-9._\-]+@[a-zA-Z0-9]+(\.[a-zA-Z0-9._\-]{2,3})+$)/.test(v);
            },
            message: `Not a valid email address!`  // message: props => `${props.value} is not a valid email address!`
        },
        unique: true
    },
    password: {
        type: String,
        required: false,
        maxlength: [255, 'Cannot exceed 255 characters'],
        minlength: [6, 'Must be at least 6 character, got {VALUE}']
    },
    id: {
        type: String,
        required: [true, 'Field cannot be empty'],
        max: 255,
        unique: true
    },
    dateOfBirth: {
        type: Date,
        required: false
    },
    gender: {
        type: String,
        required: [true, 'Field cannot be empty'],
        enum: {
            values: ['MALE', 'FEMALE', 'OTHER'],
            message: '{VALUE} is not supported'
        }
    },
    role: {
        type: String,
        required: [true, 'Field cannot be empty'],
        enum: {
            values: ['ADMIN', 'FACULTY', 'PLACEMENT', 'STUDENT'],
            message: '{VALUE} is not supported'
        }
    },
    phone: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    postcode: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    skills: [String],
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    },
    hasNotified: {
        type: Boolean,
        required: false
    }
}, {timestamps: true});

userSchema.pre('save', function(next) {
    const user = this;
    // Check if its new user registration
    if (this.isNew) {
        this.resetPasswordToken = '';
        this.hasNotified = false;
    }
    // If password NOT modified then return
    if (!user.isModified('password')) return next();
    // Hash password
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

userSchema.methods.generatePasswordReset = function() {
    this.hasNotified = false;
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

module.exports = mongoose.model('User', userSchema);