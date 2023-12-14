const mongoose = require("mongoose");
const uri  = 'mongodb+srv://admin:admin123@cluster0.l8fhcjl.mongodb.net/footforwardDB'
const connectDB = async () => {
  try {
    const con = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected`);
    // You can access connection details here if needed:
    // console.log(`MongoDB connected : ${con.connection.host}`);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

module.exports = connectDB;
