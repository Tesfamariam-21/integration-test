const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const router = express.Router();

router.post("/token/access", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/token/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

module.exports = router;
