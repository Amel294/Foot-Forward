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
            variant: {
                type: ObjectId, // Reference to the variant within the product
                ref: 'ProductDB.variants', // Reference to the 'variants' subdocument within 'ProductDB'
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
