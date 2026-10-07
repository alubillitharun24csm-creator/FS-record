# Student Registration – MERN CRUD App

React (Vite) + Express + Mongoose + MongoDB (database `studentdb`, collection `students`).

## Run it
1. Start MongoDB (service or `mongod`) on the default port 27017.
2. Backend:
   cd server && npm install && npm start      # http://localhost:5000
3. Frontend (new terminal):
   cd client && npm install && npm run dev    # http://localhost:5173

## API
| Method | URL            | Purpose              |
|--------|----------------|----------------------|
| GET    | /students      | Retrieve all students|
| POST   | /students      | Register a student   |
| PUT    | /students/:id  | Update a student     |
| DELETE | /students/:id  | Delete a student     |

Note: passwords are stored as plain text for lab simplicity and are never sent back
to the browser. In Edit mode, leave the password blank to keep the existing one.
