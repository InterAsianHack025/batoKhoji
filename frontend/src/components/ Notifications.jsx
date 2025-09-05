const express = require("express");
const router = express.Router();


let notifications = [];

router.post("/add", (req, res) => {
  const { userId, title, message, date } = req.body;
  const newNotification = {
    id: notifications.length + 1,
    userId,
    title,
    message,
    date,
    read: false,
    created_at: new Date(),
  };
  notifications.push(newNotification);
  res.json({ success: true, notification: newNotification });
});


router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const userNotifications = notifications.filter((n) => n.userId == userId);
  res.json(userNotifications);
});

module.exports = router;
