import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = 5000;
const SECRET_KEY = process.env.SECRET_KEY;
app.use(cors());
app.use(express.json());

const Users = [
  { id: 1, username: "a", password: "a" },
  { id: 2, username: "b", password: "b" },
  { id: 3, username: "c", password: "c" },
  { id: 4, username: "d", password: "d" },
  { id: 5, username: "e", password: "e" },
];

app.post("/backend/server", (req, res) => {
  const { username, password } = req.body;
  const validUser = Users.find(
    (user) => user.username === username && user.password === password,
  );

  if (validUser) {
    const token = jwt.sign(
      { id: validUser.id, username: validUser.username },
      SECRET_KEY,
      { expiresIn: "2h" },
    );
    res.status(200).json({ message: "Login Sucessful!", token });
  } else {
    res.status(400).json({ message: "Invalid username or password" });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
