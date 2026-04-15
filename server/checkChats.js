const mongoose = require("mongoose");
const Chat = require("./models/chatModel");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chat_app").then(async () => {
  const chats = await Chat.find().populate("users");
  console.log("Total chats in DB: " + chats.length);
  if(chats.length > 0) {
      console.log("Chat 1 Users count: " + chats[0].users.length);
      console.log("Chat 1 User 1: " + chats[0].users[0].email);
      console.log("Chat 1 User 2: " + chats[0].users[1].email);
  }
  process.exit();
});
