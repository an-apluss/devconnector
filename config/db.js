const mongoose = require("mongoose");
require("dotenv/config");

const db = process.env.mongoURI;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    console.log("MongoDB connected successfully...");
  } catch (error) {
    console.error(error.message);

    //Exist process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
