const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getMySQLPool } = require("../config/mysql");
const { sendEmail } = require("../utils/sendEmail");

module.exports = {

  // REGISTER USER
  register: async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
      const pool = getMySQLPool();

      const finalRole = ["user", "artist"].includes(role) ? role : "user";

      // Check if email exists
      const [existing] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user — include email_notifications default 0
      await pool.query(
        "INSERT INTO users (username, email, password, role, email_notifications) VALUES (?, ?, ?, ?, 0)",
        [username, email, hashedPassword, finalRole]
      );

      res.json({ message: "Registration successful" });

    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // LOGIN USER
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const pool = getMySQLPool();

      const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const user = rows[0];

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          email_notifications: user.email_notifications,
        },
      });

    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // UPDATE USERNAME
  updateUsername: async (req, res) => {
    const { username } = req.body;
    const userId = req.user.id;

    try {
      const pool = getMySQLPool();

      await pool.query(
        "UPDATE users SET username = ? WHERE id = ?",
        [username, userId]
      );

      const [updatedUser] = await pool.query(
        "SELECT id, username, email, role, email_notifications FROM users WHERE id = ?",
        [userId]
      );

      const user = updatedUser[0];

      // 🔥 SEND EMAIL NOTIFICATION IF ENABLED
      if (user.email_notifications === 1) {
        sendEmail(
          user.email,
          "Your Music Mode username was changed",
          `Your username has been updated to: ${username}`
        );
      }

      res.json({
        message: "Username updated successfully",
        user
      });

    } catch (err) {
      console.error("Update username error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // UPDATE EMAIL
updateEmail: async (req, res) => {
  const { newEmail, password } = req.body;
  const userId = req.user.id;

  try {
    const pool = getMySQLPool();

    // Get user
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    const user = rows[0];

    // Verify password before changing email
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND id != ?",
      [newEmail, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Update email
    await pool.query("UPDATE users SET email = ? WHERE id = ?", [newEmail, userId]);

    // Send notification if enabled
    if (user.email_notifications === 1) {
      await sendEmail(
        newEmail,
        "Music Mode — Your Email Was Updated",
        `Your Music Mode email has been successfully changed to: ${newEmail}`
      );
    }

    res.json({ message: "Email updated successfully", newEmail });

  } catch (err) {
    console.error("Update email error:", err);
    res.status(500).json({ message: "Server error" });
  }
},


  // UPDATE PASSWORD
  updatePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
      const pool = getMySQLPool();

      const [rows] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );

      const user = rows[0];

      // Validate current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const newHashed = await bcrypt.hash(newPassword, 10);

      await pool.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [newHashed, userId]
      );

      // 🔥 SEND EMAIL NOTIFICATION IF ENABLED
      if (user.email_notifications === 1) {
        sendEmail(
          user.email,
          "Your Music Mode password was changed",
          "Your password has been successfully updated. If this was NOT you, please reset your password immediately."
        );
      }

      res.json({ message: "Password updated successfully" });

    } catch (err) {
      console.error("Update password error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // UPDATE EMAIL NOTIFICATION SETTING
  updateNotifications: async (req, res) => {
    const { enabled } = req.body;
    const userId = req.user.id;

    try {
      const pool = getMySQLPool();

      await pool.query(
        "UPDATE users SET email_notifications = ? WHERE id = ?",
        [enabled ? 1 : 0, userId]
      );

      res.json({
        message: "Notification settings updated",
        enabled: enabled ? 1 : 0
      });

    } catch (err) {
      console.error("Notification update error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

};
