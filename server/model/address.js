const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

// Define the Address schema
const AddressSchema = new Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true // User ID is required
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'] // Full name is required
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'] // Street is required
    },
    city: {
      type: String,
      required: [true, 'City is required'] // City is required
    },
    state: {
      type: String,
      required: [true, 'State is required'] // State is required
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'] // Zip code is required
    }
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'] // Mobile number is required
  },
});

// Define the User model
const Address = mongoose.model('Address', AddressSchema);

module.exports = Address;
