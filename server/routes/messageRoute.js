const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  allMessages,
  deleteMessage,
} = require("../controllers/messageController");

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:messageId").delete(protect, deleteMessage);
router.route("/:chatId").get(protect, allMessages);

module.exports = router;
