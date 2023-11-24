const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;
const Product = require('./productDB'); // Adjust the path to where your Product model is located

// Define possible order status values
const OrderStatus = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  RETURN : "Return",
  ADMINCANCELLED: 'Cancelled By Admin',
  USERCANCELED : 'Cancelled By User'
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
      itemTotal: {
        type: Number,
        required: true,
         default: 0,
      },
      orderID:{
        type: String
      }
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
    type:ObjectId,
    ref: 'Address', // Reference to the 'ProductDB' model
    required: true
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

orderSchema.pre('save', async function(next) {
  try {
    for (const item of this.items) {
      console.log(`Fetching product for ID: ${item.product}`);
      const product = await Product.findById(item.product);
      
      if (!product) {
        console.log(`Product not found for ID: ${item.product}`);
        throw new Error('Product not found');
      }

      console.log(`Product price for ID: ${item.product} is ${product.price}`);
      item.itemTotal = product.price * item.quantity; // Set itemTotal for each item
    }

    // Calculate the total based on the updated itemTotal values
    this.total = this.items.reduce((acc, item) => acc + item.itemTotal, 0);
    next();
  } catch (error) {
    console.error('Error in pre-save:', error);
    next(error);
  }
});




const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
