import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection (database: studentdb)
mongoose
  .connect("mongodb://127.0.0.1:27017/studentdb")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error.message));

// Schema: structure of the data stored in the "students" collection
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  country: { type: String, required: true },
  languages: { type: [String], default: [] },
});

// Model -> collection "students"
const Student = mongoose.model("Student", studentSchema);

// Test route
app.get("/", (req, res) => {
  res.send("Express server is working");
});

// READ: all students (password is not sent to the browser)
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Could not load students" });
  }
});

// CREATE
app.post("/students", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json({ message: "Registration successful" });
  } catch (error) {
    res.status(400).json({ message: "Registration failed: " + error.message });
  }
});

// UPDATE (blank password keeps the old one)
app.put("/students/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.password) delete data.password;

    const updated = await Student.findByIdAndUpdate(req.params.id, data, {
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Student updated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Update failed: " + error.message });
  }
});

// DELETE
app.delete("/students/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Delete failed: " + error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
