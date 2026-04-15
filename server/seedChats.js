const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/userModel");
const Chat = require("./models/chatModel");
const Message = require("./models/messageModel");

dotenv.config();

const seedChats = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chat_app";
    await mongoose.connect(MONGO_URI);
    
    console.log("Connected to MongoDB...");
    
    await Chat.deleteMany(); 
    await Message.deleteMany();
    
    const users = await User.find();
    if (users.length < 3) {
        console.log("Not enough users to create chats");
        return process.exit();
    }

    const guestUser = users.find(u => u.email === "guest@example.com");
    const johnUser = users.find(u => u.email === "john@example.com");
    const janeUser = users.find(u => u.email === "jane@example.com");

    const chat1 = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [guestUser._id, johnUser._id],
    });

    const chat2 = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [guestUser._id, janeUser._id],
    });

    const msg1 = await Message.create({
      sender: johnUser._id,
      content: "Hey from John! Welcome to Talk-A-Tive.",
      chat: chat1._id
    });

    const msg2 = await Message.create({
      sender: janeUser._id,
      content: "Hi Guest, looking forward to chatting!",
      chat: chat2._id
    });

    chat1.latestMessage = msg1._id;
    await chat1.save();

    chat2.latestMessage = msg2._id;
    await chat2.save();

    console.log("Successfully securely seeded chats and messages!");
    process.exit();
  } catch (error) {
    console.error("Error seeding chats:", error);
    process.exit(1);
  }
};

seedChats();
