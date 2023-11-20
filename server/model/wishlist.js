const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;
const Product = require('./productDB'); // Adjust the path to where your Product model is located

const wishlistSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: ObjectId,
    ref: 'ProductDB',
    required: true
  }],
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
