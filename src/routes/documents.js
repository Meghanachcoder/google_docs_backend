const express = require("express");
const mongoose = require("mongoose");
const Document = require("../models/Document");
const User = require("../models/User");

const router = express.Router();

function toObjectId(id, label = "userId") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return new mongoose.Types.ObjectId(id);
}

async function populateDocument(documentId) {
  return Document.findById(documentId)
    .populate("owner", "name email")
    .populate("sharedWith", "name email")
    .populate("attachments");
}

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const userObjectId = toObjectId(userId);

    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const owned = await Document.find({ owner: userObjectId })
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    const shared = await Document.find({
      owner: { $ne: userObjectId },
      sharedWith: userObjectId,
    })
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    res.json({ owned, shared });
  } catch (error) {
    res.status(500).json({ message: "Failed to load documents" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, content = "", ownerId } = req.body;

    if (!ownerId) {
      return res.status(400).json({ message: "ownerId is required" });
    }

    const owner = await User.findById(ownerId);

    if (!owner) {
      return res.status(404).json({ message: "Owner user was not found" });
    }

    const ownerObjectId = toObjectId(ownerId, "ownerId");

    if (!ownerObjectId) {
      return res.status(400).json({ message: "Invalid ownerId" });
    }

    const document = await Document.create({
      title: title || "Untitled document",
      content,
      owner: ownerObjectId,
    });

    const populatedDocument = await populateDocument(document._id);
    res.status(201).json(populatedDocument);
  } catch (error) {
    res.status(500).json({ message: "Failed to create document" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { userId } = req.query;
    const userObjectId = toObjectId(userId);

    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const document = await populateDocument(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document was not found" });
    }

    const canAccess =
      document.owner._id.toString() === userObjectId.toString() ||
      document.sharedWith.some((user) => user._id.toString() === userObjectId.toString());

    if (!canAccess) {
      return res.status(403).json({ message: "You do not have access to this document" });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: "Failed to load document" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const userObjectId = toObjectId(userId);

    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document was not found" });
    }

    const canEdit =
      document.owner.toString() === userObjectId.toString() ||
      document.sharedWith.some(
        (sharedUserId) => sharedUserId.toString() === userObjectId.toString()
      );

    if (!canEdit) {
      return res.status(403).json({ message: "You do not have access to edit this document" });
    }

    if (title !== undefined) {
      document.title = title || "Untitled document";
    }

    if (content !== undefined) {
      document.content = content;
    }

    await document.save();
    const populatedDocument = await populateDocument(document._id);
    res.json(populatedDocument);
  } catch (error) {
    res.status(500).json({ message: "Failed to save document" });
  }
});

module.exports = router;
