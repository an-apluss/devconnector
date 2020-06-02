const express = require("express");
const cors = require("cors");

const app = express();
const connectDB = require("./config/db");

//connect to database
connectDB();

app.use(express.json({ extended: true }));

const whitelist = ["http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.get("/", cors(corsOptions), (req, res) => res.send("API running..."));

//define routes
app.use("/api/v1/users", cors(corsOptions), require("./routes/api/users"));
app.use("/api/v1/auth", cors(corsOptions), require("./routes/api/auth"));
app.use("/api/v1/profile", cors(corsOptions), require("./routes/api/profile"));
app.use("/api/v1/posts", cors(corsOptions), require("./routes/api/posts"));

const PORT = process.env.PORT || "5050";

app.listen(PORT, () =>
  console.log(`server started! Listening to port:${PORT}...`)
);
