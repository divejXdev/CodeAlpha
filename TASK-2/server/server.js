require("dotenv").config();
const express = require("express"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  helmet = require("helmet"),
  sanitize = require("express-mongo-sanitize"),
  morgan = require("morgan"),
  jwt = require("jsonwebtoken"),
  { body, param, validationResult } = require("express-validator"),
  path = require("path");
const User = require("./models/User"),
  Post = require("./models/Post"),
  Comment = require("./models/Comment"),
  Follower = require("./models/Follower"),
  { protect, upload } = require("./middleware");
const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());
app.use(sanitize());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const valid = (req, res, next) => {
  const e = validationResult(req);
  return e.isEmpty()
    ? next()
    : res.status(400).json({
        message: e
          .array()
          .map((x) => x.msg)
          .join(" "),
      });
};
const send = (u) => ({
  token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  }),
  user: u,
});
const pop = (q) => q.populate("author", "username fullName profilePicture");
app.post(
  "/api/auth/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body("fullName").trim().isLength({ min: 2, max: 80 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
  ],
  valid,
  async (req, res, next) => {
    try {
      res.status(201).json(send(await User.create(req.body)));
    } catch (e) {
      next(e);
    }
  },
);
app.post(
  "/api/auth/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  valid,
  async (req, res, next) => {
    try {
      const u = await User.findOne({ email: req.body.email }).select(
        "+password",
      );
      if (!u || !(await u.comparePassword(req.body.password)))
        return res.status(401).json({ message: "Invalid email or password." });
      u.password = undefined;
      res.json(send(u));
    } catch (e) {
      next(e);
    }
  },
);
app.post("/api/auth/logout", (_q, res) => res.json({ message: "Logged out." }));
app.get("/api/users/profile", protect, (req, res) =>
  res.json({ user: req.user }),
);
app.put(
  "/api/users/profile",
  protect,
  upload.single("profilePicture"),
  [
    body("fullName").optional().trim().isLength({ min: 2, max: 80 }),
    body("bio").optional().trim().isLength({ max: 300 }),
  ],
  valid,
  async (req, res, next) => {
    try {
      const d = {};
      ["fullName", "bio"].forEach((k) => {
        if (req.body[k] !== undefined) d[k] = req.body[k];
      });
      if (req.file) d.profilePicture = "/uploads/" + req.file.filename;
      res.json({
        user: await User.findByIdAndUpdate(req.user._id, d, {
          new: true,
          runValidators: true,
        }),
      });
    } catch (e) {
      next(e);
    }
  },
);
app.get(
  "/api/users/:id",
  protect,
  [param("id").isMongoId()],
  valid,
  async (req, res, next) => {
    try {
      const u = await User.findById(req.params.id);
      if (!u) return res.status(404).json({ message: "User not found." });
      res.json({
        user: u,
        posts: await pop(Post.find({ author: u._id })).sort({ createdAt: -1 }),
        isFollowing: !!(await Follower.exists({
          follower: req.user._id,
          following: u._id,
        })),
      });
    } catch (e) {
      next(e);
    }
  },
);
app.post(
  "/api/users/:id/follow",
  protect,
  [param("id").isMongoId()],
  valid,
  async (req, res, next) => {
    try {
      if (req.params.id === String(req.user._id))
        return res.status(400).json({ message: "You cannot follow yourself." });
      const u = await User.findById(req.params.id);
      if (!u) return res.status(404).json({ message: "User not found." });
      const old = await Follower.findOne({
        follower: req.user._id,
        following: u._id,
      });
      let following;
      if (old) {
        await old.deleteOne();
        await Promise.all([
          User.findByIdAndUpdate(req.user._id, { $inc: { following: -1 } }),
          User.findByIdAndUpdate(u._id, { $inc: { followers: -1 } }),
        ]);
        following = false;
      } else {
        await Follower.create({ follower: req.user._id, following: u._id });
        await Promise.all([
          User.findByIdAndUpdate(req.user._id, { $inc: { following: 1 } }),
          User.findByIdAndUpdate(u._id, { $inc: { followers: 1 } }),
        ]);
        following = true;
      }
      res.json({
        following,
        followers: (await User.findById(u._id)).followers,
      });
    } catch (e) {
      next(e);
    }
  },
);
app.get("/api/posts", protect, async (_q, res, next) => {
  try {
    res.json({ posts: await pop(Post.find()).sort({ createdAt: -1 }) });
  } catch (e) {
    next(e);
  }
});
app.post(
  "/api/posts",
  protect,
  upload.single("image"),
  [body("content").trim().isLength({ min: 1, max: 1000 })],
  valid,
  async (req, res, next) => {
    try {
      const p = await Post.create({
        author: req.user._id,
        content: req.body.content,
        image: req.file ? "/uploads/" + req.file.filename : "",
      });
      res.status(201).json({ post: await pop(Post.findById(p._id)) });
    } catch (e) {
      next(e);
    }
  },
);
app.put(
  "/api/posts/:id",
  protect,
  upload.single("image"),
  [
    param("id").isMongoId(),
    body("content").trim().isLength({ min: 1, max: 1000 }),
  ],
  valid,
  async (req, res, next) => {
    try {
      const p = await Post.findById(req.params.id);
      if (!p) return res.status(404).json({ message: "Post not found." });
      if (String(p.author) !== String(req.user._id))
        return res
          .status(403)
          .json({ message: "You can only edit your own posts." });
      p.content = req.body.content;
      if (req.file) p.image = "/uploads/" + req.file.filename;
      await p.save();
      res.json({ post: await pop(Post.findById(p._id)) });
    } catch (e) {
      next(e);
    }
  },
);
app.delete(
  "/api/posts/:id",
  protect,
  [param("id").isMongoId()],
  valid,
  async (req, res, next) => {
    try {
      const p = await Post.findById(req.params.id);
      if (!p) return res.status(404).json({ message: "Post not found." });
      if (String(p.author) !== String(req.user._id))
        return res
          .status(403)
          .json({ message: "You can only delete your own posts." });
      await Promise.all([p.deleteOne(), Comment.deleteMany({ post: p._id })]);
      res.json({ message: "Post deleted." });
    } catch (e) {
      next(e);
    }
  },
);
app.post(
  "/api/posts/:id/like",
  protect,
  [param("id").isMongoId()],
  valid,
  async (req, res, next) => {
    try {
      const p = await Post.findById(req.params.id);
      if (!p) return res.status(404).json({ message: "Post not found." });
      const i = p.likes.findIndex((x) => String(x) === String(req.user._id));
      const liked = i < 0;
      if (liked) {
        p.likes.push(req.user._id);
        p.likesCount++;
      } else {
        p.likes.splice(i, 1);
        p.likesCount--;
      }
      await p.save();
      res.json({ liked, likesCount: p.likesCount });
    } catch (e) {
      next(e);
    }
  },
);
app.get(
  "/api/comments/:postId",
  protect,
  [param("postId").isMongoId()],
  valid,
  async (req, res, next) => {
    try {
      res.json({
        comments: await Comment.find({ post: req.params.postId })
          .populate("author", "username fullName profilePicture")
          .sort({ createdAt: -1 }),
      });
    } catch (e) {
      next(e);
    }
  },
);
app.post(
  "/api/comments/:postId",
  protect,
  [
    param("postId").isMongoId(),
    body("comment").trim().isLength({ min: 1, max: 500 }),
  ],
  valid,
  async (req, res, next) => {
    try {
      const p = await Post.findById(req.params.postId);
      if (!p) return res.status(404).json({ message: "Post not found." });
      const c = await Comment.create({
        post: p._id,
        author: req.user._id,
        comment: req.body.comment,
      });
      p.commentsCount++;
      await p.save();
      await c.populate("author", "username fullName profilePicture");
      res.status(201).json({ comment: c, commentsCount: p.commentsCount });
    } catch (e) {
      next(e);
    }
  },
);
app.delete(
  "/api/comments/:id",
  protect,
  [param("id").isMongoId()],
  valid,
  async (req, res, next) => {
    try {
      const c = await Comment.findById(req.params.id);
      if (!c) return res.status(404).json({ message: "Comment not found." });
      if (String(c.author) !== String(req.user._id))
        return res
          .status(403)
          .json({ message: "You can only delete your own comments." });
      await Promise.all([
        c.deleteOne(),
        Post.findByIdAndUpdate(c.post, { $inc: { commentsCount: -1 } }),
      ]);
      res.json({ message: "Comment deleted." });
    } catch (e) {
      next(e);
    }
  },
);
app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((e, _q, res, _n) => {
  console.error(e);
  if (e.code === 11000)
    return res
      .status(409)
      .json({ message: Object.keys(e.keyValue)[0] + " is already in use." });
  res.status(e.status || 500).json({ message: e.message || "Server error." });
});
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(process.env.PORT || 5000, () => console.log("Server running")),
  )
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
