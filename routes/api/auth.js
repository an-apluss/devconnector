const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");

router.get("/", auth, async (req, res) => {
  try {
    // console.log(req.user)
    // return
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({ user });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      msg: "Server Error: Unknown user",
    });
  }
});

module.exports = router;
