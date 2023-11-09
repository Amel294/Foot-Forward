const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;
const Product = require('./productDB'); // Adjust the path to where your Product model is located

// Define possible order status values
const OrderStatus = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// Define the order schema
const orderSchema = new Schema({
  user: {
    type: ObjectId, // Reference to the user who placed the order
    ref: 'User',    // Reference to the 'User' model
    required: true,
  },
  items: [
    {
      product: {
        type: ObjectId, // Reference to the product
        ref: 'ProductDB', // Reference to the 'ProductDB' model
        required: true
    },
      variant: {
        type: ObjectId, // Reference to the variant within the product
        ref: 'ProductDB.variants', // Reference to the 'variants' subdocument within 'ProductDB'
        required: true
    },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1.'],
        max: [10, 'Quantity cannot be more than 10.'],
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'PayOnline'], // Payment method options
    required: true,
  },
  shippingAddress: {
    // Define the shipping address structure
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    mobile: String,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderStatus: {
    type: String,
    enum: Object.values(OrderStatus), // Use the defined order status values
    default: OrderStatus.PENDING, // Default status is "Pending"
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
