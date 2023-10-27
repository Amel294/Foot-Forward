const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const NewSchema = new Schema({
    Category: { type: String, required: true, enum: ['Men', 'Women', 'Unisex'] },
    Subcategory: { type: String, required: true},
});

const Category = mongoose.model('Category', NewSchema);


module.exports = Category;

