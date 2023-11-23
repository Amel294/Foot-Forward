const mongoose = require('mongoose');

const referralOfferSchema = new mongoose.Schema({
    isEnabled: {
        type: Boolean,
        required: true
    },
    reward: {
        type: Number,
        required: true,
        min: 0, // Assuming reward is a non-negative value
        max:1000
    },
});

const ReferralOffer = mongoose.model('ReferralOffer', referralOfferSchema);

module.exports = ReferralOffer;
