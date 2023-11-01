const mongoose = require("mongoose");
const sizeSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true,
        unique: true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
});

const Size = mongoose.model('Size', sizeSchema);
module.exports = Size