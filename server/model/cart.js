const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

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
            quantity: {
                type: Number,
                required: true
            },
            selectedColor: {
                type: ObjectId, // Reference to Color object ID
                ref: 'Color',   // Reference to the 'Color' model
                required: true
            },
            selectedSize: {
                type: ObjectId, // Reference to Size object ID
                ref: 'Size',    // Reference to the 'Size' model
                required: true
            }
        }
    ]
});

// Create a Cart model
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
