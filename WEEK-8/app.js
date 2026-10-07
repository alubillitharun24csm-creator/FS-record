const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, "users.json");

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ---------- Helpers ----------
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return data.trim() ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading users.json:", err);
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function generateTokenNumber(department) {
  // Simple deterministic-ish token: DEPTCODE + random 3-digit number
  const code = department.substring(0, 3).toUpperCase();
  const num = Math.floor(100 + Math.random() * 900);
  return `${code}-${num}`;
}

// ---------- Page Routes ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ---------- Registration ----------
app.post("/register", (req, res) => {
  const {
    name,
    age,
    dob,
    gender,
    email,
    mobile,
    username,
    password,
    address,
    bloodGroup,
    emergencyContact,
    preferredDepartment
  } = req.body;

  if (!name || !email || !username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Name, email, username and password are required." });
  }

  const users = readUsers();

  const alreadyExists = users.some(
    (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
  );

  if (alreadyExists) {
    return res
      .status(409)
      .json({ success: false, message: "A patient with this username or email already exists." });
  }

  const newPatient = {
    id: Date.now(),
    name,
    age,
    dob,
    gender,
    email,
    mobile,
    username,
    password, // NOTE: stored in plain text for this teaching demo only
    address,
    bloodGroup,
    emergencyContact,
    preferredDepartment,
    registeredAt: new Date().toISOString()
  };

  users.push(newPatient);
  writeUsers(users);

  res.status(201).json({ success: true, message: "Registration successful! You can now log in." });
});

// ---------- Login ----------
app.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "Username/email and password are required." });
  }

  const users = readUsers();

  const user = users.find(
    (u) =>
      (u.username.toLowerCase() === identifier.toLowerCase() ||
        u.email.toLowerCase() === identifier.toLowerCase()) &&
      u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid username/email or password." });
  }

  // Don't send password back to the client
  const { password: _pw, ...safeUser } = user;

  res.json({ success: true, message: "Login successful!", user: safeUser });
});

// ---------- Queue token (dashboard feature) ----------
app.post("/queue", (req, res) => {
  const { department } = req.body;

  if (!department) {
    return res.status(400).json({ success: false, message: "Department is required." });
  }

  const token = generateTokenNumber(department);
  res.json({ success: true, token, department });
});

// ---------- Start server ----------
const server = app.listen(PORT, () => {
  console.log(`CareQueue HMS server running at http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPort ${PORT} is already in use — another instance of this server (or something else) is already running.\n` +
      `Either close that process, or change PORT in app.js to a free port (e.g. 3001) and run again.\n`
    );
    process.exit(1);
  } else {
    throw err;
  }
});
