const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = async (req, res) => {
  const { content, chatId, type, fileUrl } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    type: type || "text",
    fileUrl: fileUrl,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    message = await User.populate(message, {
      path: "chat.groupAdmin",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    // Mark messages from others as 'delivered' if they are currently 'sent'
    const unreadMessageIds = messages
      .filter(m => m.sender._id.toString() !== req.user._id.toString() && m.status === "sent")
      .map(m => m._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $set: { status: "delivered" } }
      );
      // Note: We might want to notify the sender via socket here, 
      // but since this is a REST call, we'd need to emit from the controller or handle it client-side.
      // For now, let's just update the DB. The sender will see it when they refresh or via other socket events.
    }
    
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const updateMessageStatus = async (req, res) => {
  const { messageIds, status } = req.body;

  if (!messageIds || !status) {
    return res.status(400).send("Invalid data");
  }

  try {
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $set: { status: status } }
    );
    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).send({ message: "Message not found" });
    }

    // Only allow sender to delete message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .send({ message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

module.exports = { allMessages, sendMessage, deleteMessage, updateMessageStatus };
