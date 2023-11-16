const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI, {
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
