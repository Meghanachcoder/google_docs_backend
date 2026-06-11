require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/users");
const documentRoutes = require("./routes/documents");
const sharingRoutes = require("./routes/sharing");
const uploadRoutes = require("./routes/uploads");

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/documents", sharingRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ message: error.message || "Request failed" });
  }

  next();
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start backend", error);
    process.exit(1);
  });
