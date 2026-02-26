import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

dotenv.config();

<<<<<<< HEAD
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Successfully"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String, enum: ['superadmin', 'shopadmin'], default: 'shopadmin' }
});
const User = mongoose.model("User", userSchema);
=======
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected Successfully"))
  .catch((err) => console.log("failed to connect"));
>>>>>>> f60f8512695e2522f1053a48b9644508188c92cb

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
<<<<<<< HEAD
  sup_no: { type: Number, required: true},
  shoptype: { type: String, required: true},
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } 
=======
>>>>>>> f60f8512695e2522f1053a48b9644508188c92cb
});
const Item = mongoose.model("Item", itemSchema);

const app = express();
const PORT = 5000;
const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key"; 

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
const createSuperAdmin = async () => {
  const adminExists = await User.findOne({ username: "admin" });
  if (!adminExists) {
    await User.create({ username: "admin", password: "adminpassword", role: "superadmin" });
    console.log("Super Admin account created! Username: admin | Password: adminpassword");
  }
};
createSuperAdmin();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};


app.post("/backend/server", async (req, res) => {
=======
const Users = [
  { id: 1, username: "a", password: "a" },
  { id: 2, username: "b", password: "b" },
  { id: 3, username: "c", password: "c" },
  { id: 4, username: "d", password: "d" },
  { id: 5, username: "e", password: "e" },
];

app.post("/backend/server", (req, res) => {
>>>>>>> f60f8512695e2522f1053a48b9644508188c92cb
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role},
        SECRET_KEY,
        { expiresIn: "8h" }
      );
      res.status(200).json({ message: "Login Successful!", token, role: user.role });
    } else {
      res.status(400).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error });
  }
});

<<<<<<< HEAD
app.get('/app/inventory', authenticateToken, async (req, res) => {
  try {
    let items;
    if (req.user.role === 'superadmin') {
      items = await Item.find().populate('owner', 'username'); 
    } else {
      items = await Item.find({ owner: req.user.id });
    }
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Can't find the items", error });
  }
});

app.post('/app/inventory', authenticateToken, async (req, res) => {
  try {
      const { name, price, quantity,sup_no,shoptype } = req.body;
      const newItem = new Item({ name, price, quantity, sup_no,shoptype, owner: req.user.id });
      const savedItem = await newItem.save();
      res.status(200).json(savedItem);
  } catch (error) {
=======
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
>>>>>>> f60f8512695e2522f1053a48b9644508188c92cb
    res.status(500).json({ message: "Error saving item", error });
  }
});

<<<<<<< HEAD
app.put('/app/inventory/:id', authenticateToken, async (req, res) => {
  try {
    const foundItem = await Item.findById(req.params.id);
    if (!foundItem) return res.status(404).json("Item not found");

    if (foundItem.owner.toString() !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json("You do not have permission to edit this item.");
    }

    foundItem.quantity += req.body.amount;
    if (foundItem.quantity < 0) foundItem.quantity = 0;
    
    await foundItem.save();
    res.status(200).json(foundItem);
  } catch (error) {
    res.status(500).json({ message: "FAILED TO FIND THE PRODUCT", error });
  }
});

app.post('/app/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: "Only Super Admins can create users." });
  }

  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password, role: 'shopadmin' });
    await newUser.save();
    res.status(201).json({ message: `Shop Admin '${username}' created successfully!` });
  } catch (error) {
    res.status(500).json({ message: "Error creating user. Username might already exist.", error });
=======
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
>>>>>>> f60f8512695e2522f1053a48b9644508188c92cb
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});