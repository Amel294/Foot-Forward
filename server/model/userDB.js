const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Counter = require('./counterDB'); // Import the Counter model

const userSchema = new mongoose.Schema({
    userId: Number, // Auto-incremented userId
    fullName: String,
    email: {
        type: String,
        unique: true,
    },
    phoneNumber: {
        type: String,
        unique: true,
    },
    password: String,
});

// Middleware to auto-increment the userId and hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password

        if (!this.userId) {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'userId' },
                { $inc: { sequence_value: 1 } },
                { new: true, upsert: true }
            );

            this.userId = counter.sequence_value;
        }

        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model('Users', userSchema);

module.exports = User;
