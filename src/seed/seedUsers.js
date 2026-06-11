require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const users = [
  {
    name: "Meghana Ch",
    email: "meghana@example.com",
  },
  {
    name: "Ajaia Reviewer",
    email: "reviewer@example.com",
  },
  {
    name: "Teammate User",
    email: "teammate@example.com",
  },
];

async function seedUsers() {
  try {
    await connectDB();

    for (const user of users) {
      await User.findOneAndUpdate({ email: user.email }, user, {
        upsert: true,
        new: true,
      });
    }

    console.log("Seed users created");
  } catch (error) {
    console.error("Failed to seed users", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedUsers();
