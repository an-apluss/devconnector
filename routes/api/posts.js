const express = require("express");
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");

const router = express.Router();

router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(200).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };

      const post = new Post(newPost);
      await post.save();

      return res.status(200).json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: error.message });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Server Error: ${error.message}` });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    if (error.kind == "ObjectId")
      return res.status(404).json({ msg: "Post not found" });
    res.status(500).json({ msg: `Server Error: ${error.message}` });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ msg: "You are unauthorized to delete this post" });
    }

    await Post.deleteOne({ _id: req.params.id });

    return res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    console.error(error);

    if (error.kind == "ObjectId")
      return res.status(404).json({ msg: "Post not found" });

    res.status(500).json({ msg: `Server Error: ${error.message}` });
  }
});

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();

    return res.status(200).json(post.likes);
  } catch (error) {
    console.error(error);

    if (error.kind == "ObjectId")
      return res.status(404).json({ msg: "Post not found" });

    res.status(500).json({ msg: `Server Error: ${error.message}` });
  }
});

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not been liked" });
    }

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();

    return res.status(200).json(post.likes);
  } catch (error) {
    console.error(error);

    if (error.kind == "ObjectId")
      return res.status(404).json({ msg: "Post not found" });

    res.status(500).json({ msg: `Server Error: ${error.message}` });
  }
});

module.exports = router;
