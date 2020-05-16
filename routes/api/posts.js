const express = require("express");

const router = express.Router();

router.get("/", (req, res) => res.send("Posts router here..."));

module.exports = router;
