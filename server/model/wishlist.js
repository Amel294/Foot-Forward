const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const wishlistSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: ObjectId,
    ref: 'Product',
    required: true
  }],
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
