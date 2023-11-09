const Address = require("../model/address")
const bcrypt = require('bcrypt');
const User = require('../model/userDB');






exports.addAddress = async (req, res) => {
  try {
    const addressData = {
      userId: req.session.user.id, // Assuming this is how you get the logged-in user's ID
      fullName: req.body.fullName,
      address: {
        street: req.body.address.street,
        city: req.body.address.city,
        state: req.body.address.state,
        zipCode: req.body.address.zipCode,
      },
      mobile: req.body.mobile,
    };

    // Create a new address using the Address model
    const newAddress = new Address(addressData);

    // Save the new address to the database
    await newAddress.save();

    // Send a response back to the client
    res.status(201).json({ message: 'New address saved successfully!', data: newAddress });
  } catch (error) {
    console.error('Error saving address:', error); // Log the error
    res.status(400).json({ message: 'Error saving address', error: error });
  }
};






exports.editProfile = async (req, res) => {
  try {
    const userId = req.session.user.id; // Make sure you're getting the correct user ID from the session
    const { name, email, phone, password } = req.body;

    const updates = {};
    if (name) updates.fullName = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (password) {
      // Hash the new password before saving
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    // Update the user document
    const user = await User.findOneAndUpdate({ _id: userId }, updates, { new: true });
    
    // You should handle the case when the user is not found or the update fails
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Respond with the updated user details (excluding sensitive information like password)
    res.send({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      // Do not send back the password
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send({ message: 'Internal server error.' });
  }
}


