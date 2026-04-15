const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    type: {
      type: String,
      enum: ["text", "image", "audio", "file"],
      default: "text",
    },
    fileUrl: { type: String },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageModel);

module.exports = Message;
