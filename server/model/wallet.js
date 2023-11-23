const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

// Define the Wallet Schema
const walletSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: 'User', // Reference to the user who owns the wallet
    required: true,
  },
  balance: {
    type: Number,
    default: 0, // Default balance is set to 0
    required: true,
  },
  transactions: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      description: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
});

// Create and export the Wallet model
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
