import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected Successfully"))
  .catch((err) => console.log("failed to connect"));

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const Item = mongoose.model("Item", itemSchema);

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

app.get("/app/inventory", async (req, res) => {
  try {
    await Item.find();
    res.status(200).json(Item);
  } catch {
    res.status(500).json({ message: "Can't find the item", error });
  }
});

app.post("/app/inventory", async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    const newItem = new Item({ name, price, quantity });
    await newItem.save();
    res.status(200).json("Saved item successfully");
  } catch {
    res.status(500).json({ message: "Error saving item", error });
  }
});

app.put("/app/inventory", async (req, res) => {
  try {
    const item = await item.findById(req.params.id);
    if (!item) return res.status(400).json({ message: "item not found" });

    item.quantity += req.body.amount;
    if (item.quantity < 0) item.quantity = 0;
    await item.save();
    res.status(200).json(item);
  } catch (error) {
    req.status(500).json({ message: "Error updating quantity", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
