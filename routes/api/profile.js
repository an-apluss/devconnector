const express = require("express");
const { check, validationResult } = require("express-validator");
const config = require("config");
const request = require("request");

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

    return res.status(500).json({ msg: `Server Error: ${error.message}` });
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
      return res.status(500).json({ msg: `Server Error: ${error.message}` });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("users", ["name", "avatar"]);

    return res.status(200).json(profiles);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: `Server Error: ${error.message}` });
  }
});

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("users", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "Profile not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId")
      return res.status(400).json({ msg: "Profile not found" });
    return res.status(500).json({ msg: `Server Error: ${error.message}` });
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    await Profile.deleteOne({ user: req.user.id });

    await User.deleteOne({ _id: req.user.id });

    return res.status(200).json({ msg: "Profile successfully deleted" });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({ msg: `Server Error: ${error.message}` });
  }
});

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      } = req.body;

      const newExperience = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };

      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExperience);

      await profile.save();

      return res.status(200).json(profile);
    } catch (error) {
      console.error(error.message);

      return res.status(500).json({ msg: `Server Error: ${error.message}` });
    }
  }
);

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    return res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({ msg: "Server Error" });
  }
});

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      } = req.body;

      const newEducation = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };

      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEducation);

      await profile.save();

      return res.status(200).json(profile);
    } catch (error) {
      console.error(error.message);

      return res.status(500).json({ msg: `Server Error: ${error.message}` });
    }
  }
);

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    return res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({ msg: "Server Error" });
  }
});

router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientID"
      )}/client_secret=${config.get("githubClientSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.error("error:", error);

      if (response.statusCode !== 200) {
        return res.status(400).json({ msg: "No github profile found" });
      }

      return res.status(200).json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: `Server Error: ${error.message}` });
  }
});

module.exports = router;
