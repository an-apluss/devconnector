const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv/config");
const { check, validationResult } = require("express-validator");

const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({ user });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      msg: "Server Error: Unknown user",
    });
  }
});

router.post(
  "/",
  [
    check("email", "Please provide valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          errors: [
            { msg: "Authentication Failed: Invalid credential provided" },
          ],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [
            { msg: "Authentication Failed: Invalid credential provided" },
          ],
        });
      }

      const payload = {
        user: {
          id: user.id,
          email: user.email,
        },
      };

      jwt.sign(
        payload,
        process.env.jwtPrivateKey,
        { expiresIn: '6d' },
        (error, token) => {
          if (error) {
            throw error;
          }

          return res.status(200).json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        msg: "Server Error: User cannot be logged in",
      });
    }
  }
);

module.exports = router;
