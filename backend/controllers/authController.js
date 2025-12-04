const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getMySQLPool } = require("../config/mysql");

module.exports = {

  // REGISTER USER WITH ROLE (user or artist)
  register: async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
      const pool = getMySQLPool();

      // Validate role
      const finalRole = ["user", "artist"].includes(role) ? role : "user";

      // Check if email exists
      const [existing] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into MySQL
      await pool.query(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
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

      // Check email
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const user = rows[0];

      // Compare password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Create token INCLUDING ROLE + USERNAME
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

      // Send login info
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

};
