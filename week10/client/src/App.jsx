import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  gender: "",
  country: "",
  languages: [],
};

function App() {
  const [form, setForm] = useState(emptyForm);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [editId, setEditId] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  function showMessage(text, error = false) {
    setMessage(text);
    setIsError(error);
  }

  // READ
  function loadStudents() {
    fetch(API + "/students")
      .then((response) => response.json())
      .then((data) => setStudents(data))
      .catch(() => showMessage("Could not reach the server. Start Express first.", true));
  }

  // text, email, password, radio, select
  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  // checkbox
  function handleLanguage(event) {
    const { value, checked } = event.target;
    const languages = checked
      ? [...form.languages, value]
      : form.languages.filter((item) => item !== value);
    setForm({ ...form, languages });
  }

  // CREATE or UPDATE
  function saveStudent(event) {
    event.preventDefault();

    if (form.gender === "") {
      showMessage("Please select a gender", true);
      return;
    }

    const url = editId === "" ? API + "/students" : API + "/students/" + editId;
    const method = editId === "" ? "POST" : "PUT";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async (response) => {
        const data = await response.json();
        showMessage(data.message, !response.ok);
        if (response.ok) {
          setForm(emptyForm);
          setEditId("");
          loadStudents();
        }
      })
      .catch(() => showMessage("Could not connect to Express", true));
  }

  // EDIT: password is left blank; blank keeps the stored one
  function editStudent(student) {
    setForm({
      name: student.name,
      email: student.email,
      password: "",
      gender: student.gender,
      country: student.country,
      languages: student.languages,
    });
    setEditId(student._id);
    showMessage("Edit the details, then click Update. Leave password blank to keep it.");
  }

  // DELETE
  function deleteStudent(id) {
    if (!window.confirm("Delete this student?")) return;

    fetch(API + "/students/" + id, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        showMessage(data.message);
        if (editId === id) {
          setForm(emptyForm);
          setEditId("");
        }
        loadStudents();
      })
      .catch(() => showMessage("Could not connect to Express", true));
  }

  // RESET
  function resetForm() {
    setForm(emptyForm);
    setEditId("");
    setMessage("");
  }

  return (
    <div className="page">
      <section className="form-box">
        <h1>Student Registration</h1>

        <form onSubmit={saveStudent}>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required={editId === ""}
          />

          <span className="label">Gender</span>
          <div className="row">
            {["Male", "Female"].map((g) => (
              <label key={g} className="choice">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={form.gender === g}
                  onChange={handleChange}
                />
                {g}
              </label>
            ))}
          </div>

          <label htmlFor="country">Country</label>
          <select id="country" name="country" value={form.country} onChange={handleChange} required>
            <option value="">Select country</option>
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Australia">Australia</option>
          </select>

          <span className="label">Languages</span>
          <div className="row">
            {["English", "Hindi", "Telugu"].map((lang) => (
              <label key={lang} className="choice">
                <input
                  type="checkbox"
                  value={lang}
                  checked={form.languages.includes(lang)}
                  onChange={handleLanguage}
                />
                {lang}
              </label>
            ))}
          </div>

          <div className="buttons">
            <button type="submit" className="primary">
              {editId === "" ? "Register" : "Update"}
            </button>
            <button type="button" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>

        {message && (
          <div className={isError ? "message error" : "message"} role="status">
            {message}
          </div>
        )}
      </section>

      <section className="data-box">
        <h2>Registered Students</h2>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Country</th>
                <th>Languages</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty">
                    No students yet. Register one using the form.
                  </td>
                </tr>
              )}
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.gender}</td>
                  <td>{student.country}</td>
                  <td>{student.languages.join(", ")}</td>
                  <td className="actions">
                    <button onClick={() => editStudent(student)}>Edit</button>
                    <button className="danger" onClick={() => deleteStudent(student._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
