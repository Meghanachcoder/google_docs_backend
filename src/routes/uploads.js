const express = require("express");
const fs = require("fs/promises");
const Document = require("../models/Document");
const Attachment = require("../models/Attachment");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { ownerId, documentId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "A .txt or .md file is required" });
    }

    if (!ownerId) {
      return res.status(400).json({ message: "ownerId is required" });
    }

    const importedContent = await fs.readFile(req.file.path, "utf8");

    let document;

    if (documentId) {
      document = await Document.findById(documentId);

      if (!document) {
        return res.status(404).json({ message: "Document was not found" });
      }

      const canEdit =
        document.owner.toString() === ownerId ||
        document.sharedWith.some((sharedUserId) => sharedUserId.toString() === ownerId);

      if (!canEdit) {
        return res.status(403).json({ message: "You do not have access to import into this document" });
      }

      document.content = `${document.content || ""}<p>${importedContent}</p>`;
    } else {
      document = await Document.create({
        title: req.file.originalname.replace(/\.(txt|md)$/i, ""),
        content: `<p>${importedContent}</p>`,
        owner: ownerId,
      });
    }

    const attachment = await Attachment.create({
      document: document._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    document.attachments.push(attachment._id);
    await document.save();

    res.status(201).json({ document, attachment });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to upload file" });
  }
});

module.exports = router;
