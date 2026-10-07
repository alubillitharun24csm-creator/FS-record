const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;


const data = fs.readFileSync("students.json", "utf8");
const students = JSON.parse(data);

app.get("/", (req, res) => {
    res.send("Student Course Management System");
});


app.get("/students", (req, res) => {
    res.json(students);
});


app.get("/students/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const student = students.find(s => s.id === id);

    if (student) {
        res.json(student);
    } else {
        res.status(404).json({
            message: "Student not found"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});