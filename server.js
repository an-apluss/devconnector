const express = require("express");
const cors = require("cors");

const app = express();
const connectDB = require("./config/db");

//connect to database
connectDB();

app.use(express.json({ extended: true }));

app.use(cors());

app.get("/", (req, res) => res.send("API running..."));

//define routes
app.use("/api/v1/users", require("./routes/api/users"));
app.use("/api/v1/auth", require("./routes/api/auth"));
app.use("/api/v1/profile", require("./routes/api/profile"));
app.use("/api/v1/posts", require("./routes/api/posts"));

const PORT = process.env.PORT || "5050";

app.listen(PORT, () =>
  console.log(`server started! Listening to port:${PORT}...`)
);
