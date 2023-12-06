const mongoose = require('mongoose');

// Define the schema for the coupon model
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, // Ensure that each coupon code is unique
    default: null,
  },
  discount: {
    type: Number,
    required: true,
    default :0
  },
  type: {
    type: String,
    enum: ['Flat rate', 'Percent'],
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  minimumOrderAmount: {
    type: Number,
    required: true,
    default: 0, // Minimum order amount is 0 by default
  },
  maxUses: {
    type: Number,
    default: null, // Unlimited uses by default, set a number to limit uses
  },
  currentUses: {
    type: Number,
    default: 0, // The current number of times the coupon has been used
  },
  active:{
    type:Boolean,
    require:true,
  },
  couponDeleted :{
    type : Boolean,
    default:false
  },
  Description : {
    type:String,
    required:true
  }
});



// Middleware to validate coupon data before saving
couponSchema.pre('save', function (next) {
  if (this.type === 'Percent') {
    // Check if discount is between 1 and 100 for percent type
    if (this.discount < 1 || this.discount > 100) {
      return next(new Error('Percent discount should be between 1 and 100.'));
    }
  } else if (this.type === 'Flat rate') {
    // Check if minimum order amount is greater than 10 and not exceeding discount for flat rate type
    if (this.discount <= 1 || this.discount > this.minimumOrderAmount) {
      return next(new Error('Minimum dicount amount should be greater than 0 and should not exceed the flat rate discount.'));
    }
  }

  // Check if the validUntil date and time are in the future
  const currentDate = new Date();
  if (this.validUntil <= currentDate) {
    return next(new Error('Coupon expiry date and time must be in the future.'));
  }

  next();
});
// Create the Coupon model using the schema
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
