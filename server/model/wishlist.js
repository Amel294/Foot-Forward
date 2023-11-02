const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const wishlistSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: ObjectId,
      ref: 'ProductDB',
      required: true
    },
    variant: {
      type: ObjectId,
      ref: 'ProductDB.variants',
      required: true
    }
  }]
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
