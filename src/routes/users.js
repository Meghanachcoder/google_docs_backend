const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ email: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load users" });
  }
});

module.exports = router;
