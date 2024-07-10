const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.json("From BackEnd Side");
});

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Farooq",
  database: "test",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    throw err;
  }
  console.log("Connected to MySQL database");
});

const JWT_SECRET = "Pass!23#";

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (users.length > 0) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);
    await db
      .promise()
      .query("INSERT INTO users (username, password) VALUES (?, ?)", [
        username,
        hashedPassword,
      ]);

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({ success: "User registered successfully.", token });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (users.length === 0) {
      console.log("No user found with username:", username);
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = users[0];
    console.log("User from DB:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch);

    if (!isMatch) {
      console.log("Password does not match for username:", username);
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ success: "Login successful.", token });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ error: "Invalid token." });
    }

    res.status(200).json({ success: "Token is valid." });
  });
});

app.listen(8081, () => {
  console.log("Server listening on port 8081");
});
