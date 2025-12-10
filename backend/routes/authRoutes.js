const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// REGISTER
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

// UPDATE USERNAME
router.put(
  "/update-username",
  authMiddleware.verifyToken,
  authController.updateUsername
);

// UPDATE PASSWORD
router.put(
  "/update-password",
  authMiddleware.verifyToken,
  authController.updatePassword
);

router.put(
  "/update-notifications",
  authMiddleware.verifyToken,
  authController.updateNotifications
);

router.put("/update-email", authMiddleware.verifyToken, authController.updateEmail);


module.exports = router;
