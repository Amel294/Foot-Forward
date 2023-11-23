const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;



const offerSchema = new mongoose.Schema({
    offerName: {
        type: String,
        required: true
    },
    offerDescription: {
        type: String,
        required: true
    },
    offerType: {
        type: String,
        enum: ['Category', 'Product'],
        required: true
    },
    offerCategory: { // Assuming this is needed based on your initial script
        type: ObjectId,
        ref: 'Category',
        unique:true
    },
    offerProduct: { // Assuming this is needed based on your initial script
        type: ObjectId,
        ref: 'ProductDB',
        unique:true
    },
    offerDiscount: {
        type: Number,
        required: true
    },
    offerValidUntil: {
        type: Date,
        required : true
    },
    offerMaxUses: {
        type: Number,
        default: null // For unlimited uses
    },
    offerEnable: {
        type: Boolean,
        default: false
    },
});
const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
