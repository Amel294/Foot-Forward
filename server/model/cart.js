const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;
const Product = require('./productDB'); // Adjust the path to where your Product model is located

// Define the cart schema
const cartSchema = new Schema({
    user: {
        type: ObjectId, // Reference to the user who owns the cart
        ref: 'User',    // Reference to the 'User' model
        required: true
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
                max: [10, 'Quantity cannot be more than 1   0.']
            }
        }
    ],
    total: {
        type: Number,
        default: 0
    },
    coupon: {
        type: String,
        required: false // Coupon is not required
    }
});

// Middleware to calculate the total price
cartSchema.pre('save', async function (next) {
    let total = 0;
    
    // Loop through each item and calculate the total
    for (const item of this.items) {
        const productPrice = await Product.getPriceById(item.product);
        if (productPrice) {
            total += productPrice * item.quantity;
        } else {
            // Handle the case where the product price is not found
            console.error('Product price not found for product ID:', item.product);
        }
    }
    
    this.total = total;
    next();
});
cartSchema.methods.clearCart = async function () {
    this.items = []; // Clear the items array
    this.total = 0;  // Reset the total to 0
    await this.save(); // Save the updated cart
  };
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;