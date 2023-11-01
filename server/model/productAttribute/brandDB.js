const mongoose = require("mongoose");
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
});
const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand