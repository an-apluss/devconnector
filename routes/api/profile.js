const express = require("express");

const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("users", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({
        msg: "No profile is available for this user",
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    
    res.status(500).json({
      msg: "Server Error",
    });
  }
});

module.exports = router;
