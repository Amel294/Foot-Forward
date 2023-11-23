const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

// Define the referral schema
const referralSchema = new Schema({
    referralCode: {
        type: String,
        required: true,
        unique: true
    },
    ownedBy: {
        type: ObjectId, // Reference to the user who owns the referral code
        ref: 'User',
        required: true
    },
    usedBy: [{
        type: ObjectId, // Array of users who have used the referral code
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the model
const ReferralModel = mongoose.model('Referral', referralSchema);

module.exports = ReferralModel;
