const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

const handleSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", async (userData) => {
      socket.join(userData._id);
      socket.emit("connected");

      // Mark pending messages as delivered when user goes online
      try {
        // Find all chats this user is part of
        const chats = await Chat.find({ users: userData._id });
        const chatIds = chats.map(c => c._id);

        // Find all "sent" messages in those chats NOT sent by this user
        const pendingMessages = await Message.find({
          chat: { $in: chatIds },
          sender: { $ne: userData._id },
          status: "sent"
        });

        if (pendingMessages.length > 0) {
          const messageIds = pendingMessages.map(m => m._id);
          await Message.updateMany(
            { _id: { $in: messageIds } },
            { $set: { status: "delivered" } }
          );

          // Notify each sender
          pendingMessages.forEach(m => {
            socket.in(m.sender.toString()).emit("message status update", {
              messageId: m._id,
              status: "delivered",
              chatId: m.chat
            });
          });
        }
      } catch (error) {
        console.error("Error in setup catch-up:", error);
      }
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    socket.on("typing", (data) => {
      if (typeof data === 'object' && data !== null) {
        socket.in(data.room).emit("typing", data.userName);
      } else {
        socket.in(data).emit("typing");
      }
    });
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id == newMessageRecieved.sender._id) return;

        socket.in(user._id).emit("message recieved", newMessageRecieved);
      });
    });

    socket.on("message delivered", async (data) => {
      try {
        await Message.findByIdAndUpdate(data.messageId, { status: "delivered" });
        socket.in(data.senderId).emit("message status update", {
          messageId: data.messageId,
          status: "delivered",
          chatId: data.chatId
        });
      } catch (error) {
        console.error("Error updating delivery status:", error);
      }
    });

    socket.on("message read", async (data) => {
      try {
        if (data.messageId) {
          await Message.findByIdAndUpdate(data.messageId, { status: "read" });
          socket.in(data.senderId).emit("message status update", {
            messageId: data.messageId,
            status: "read",
            chatId: data.chatId
          });
        } else if (data.chatId && data.userId) {
          // Mark all messages in this chat as read for this user
          await Message.updateMany(
            { chat: data.chatId, sender: { $ne: data.userId }, status: { $ne: "read" } },
            { status: "read" }
          );
          
          // Notify other users in the chat that messages are read
          socket.in(data.chatId).emit("messages seen", {
            chatId: data.chatId,
            userId: data.userId,
            status: "read"
          });
        }
      } catch (error) {
        console.error("Error updating read status:", error);
      }
    });

    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  });
};

module.exports = { handleSocketEvents };
