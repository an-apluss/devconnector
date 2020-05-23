const express = require("express");
const { check, validationResult } = require("express-validator");

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

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      linkedin,
      facebook,
      twitter,
      instagram,
      youtube,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    profileFields.social = {};
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (youtube) profileFields.social.youtube = youtube;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.status(201).json(profile);
      }

      profile = new Profile(profileFields);
      await profile.save();

      return res.status(200).json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        msg: "Server Error",
      });
    }
  }
);

module.exports = router;
