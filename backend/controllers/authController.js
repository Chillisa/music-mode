const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getMySQLPool } = require("../config/mysql");

module.exports = {

  // REGISTER USER
  register: async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
      const pool = getMySQLPool();

      // Check if email already exists
      const [existing] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      await pool.query(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, role || "user"]
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
      const [users] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (users.length === 0) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const user = users[0];

      // Compare password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
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
        }
      });

    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

};
