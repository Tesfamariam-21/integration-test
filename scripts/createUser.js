const mongoose = require("mongoose");
const User = require("../models/user.model");
const dotenv = require("dotenv");

dotenv.config();

async function createInitialUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const user = new User({
      username: "boa",
      password: "pa21",
    });

    await user.save();
    console.log("User created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating user:", error);
    process.exit(1);
  }
}

createInitialUser();
