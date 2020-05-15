const express = require("express");

const app = express();
const connectDB = require('./config/db');

//connect to database
connectDB();

app.get("/", (req, res) => res.send("API running..."));

const PORT = process.env.PORT || "5050";

app.listen(PORT, () => console.log(`server started! Listening to port:${PORT}...`));
