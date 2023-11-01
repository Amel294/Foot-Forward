const mongoose = require("mongoose");
const colorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    hex: {
        type: String,
        required: true,
        unique: true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
});

const Color = mongoose.model('Color', colorSchema);
module.exports = Color