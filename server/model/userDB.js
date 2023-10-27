const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullName: String,
    email: {
        type: String,
        unique: true  // Ensures email is unique across all documents in the collection
    },
    phoneNumber: {
        type: String,
        unique: true  // Ensures phone number is unique across all documents in the collection
    },
    password: String,
});


// Middleware to hash password before saving it
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;



// const isMatch = await bcrypt.compare(userEnteredPassword, storedHashedPassword);
// if (isMatch) {
//     // Passwords match
// } else {
//     // Passwords don't match
// }
