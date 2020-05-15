const mongoose = require("mongoose");
const config = require("config");

const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("MongoDB connected successfully...");
  } catch (error) {
    console.error(error.message);

    //Exist process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
