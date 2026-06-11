const express = require("express");
const Document = require("../models/Document");
const User = require("../models/User");

const router = express.Router();

router.post("/:id/share", async (req, res) => {
  try {
    const { ownerId, userIdToShareWith } = req.body;

    if (!ownerId || !userIdToShareWith) {
      return res.status(400).json({ message: "ownerId and userIdToShareWith are required" });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document was not found" });
    }

    if (document.owner.toString() !== ownerId) {
      return res.status(403).json({ message: "Only the owner can share this document" });
    }

    if (document.owner.toString() === userIdToShareWith) {
      return res.status(400).json({ message: "Owner already has access" });
    }

    const userToShareWith = await User.findById(userIdToShareWith);

    if (!userToShareWith) {
      return res.status(404).json({ message: "User to share with was not found" });
    }

    if (!document.sharedWith.some((userId) => userId.toString() === userIdToShareWith)) {
      document.sharedWith.push(userIdToShareWith);
      await document.save();
    }

    const updatedDocument = await document.populate("sharedWith", "name email");
    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: "Failed to share document" });
  }
});

module.exports = router;
