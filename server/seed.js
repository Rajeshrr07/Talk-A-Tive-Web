const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/userModel");

dotenv.config();

const users = [
  {
    name: "Guest User",
    email: "guest@example.com",
    password: "password123",
    pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    pic: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    pic: "https://randomuser.me/api/portraits/women/44.jpg",
  },
];

const seedDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chat_app";
    await mongoose.connect(MONGO_URI);
    
    console.log("Connected to MongoDB...");
    
    await User.deleteMany(); // Clear existing users just in case
    console.log("Existing users cleared.");
    
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} dummy users forcefully inserted!`);
    
    process.exit();
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedDatabase();
