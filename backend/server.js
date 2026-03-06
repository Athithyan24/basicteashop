import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

dotenv.config();
const app = express();
const PORT = 5000;
const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key"; 

app.use(cors());
app.use(express.json());
   
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Successfully"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shoptype: { type: String, required: true }, 
  role: { type: String, enum: ['superadmin', 'shopadmin'], default: 'shopadmin' }
});
const User = mongoose.model("User", userSchema);

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sup_no: { type: Number, required: true},
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } 
});
const Item = mongoose.model("Item", itemSchema);


// --- INIT ---
const createSuperAdmin = async () => {
  const adminExists = await User.findOne({ username: "admin" });
  if (!adminExists) {
    await User.create({ username: "admin", password: "adminpassword", role: "superadmin", shoptype: "Headquarters" });
    console.log("Super Admin account created! Username: admin | Password: adminpassword");
  }
};
createSuperAdmin();


// --- MIDDLEWARE ---
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


// --- ROUTES ---

// Login
app.post("/backend/server", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        SECRET_KEY,
        { expiresIn: "8h" }
      );
      res.status(200).json({ 
        message: "Login Successful!", 
        token, 
        role: user.role,
        username: user.username,
        shoptype: user.shoptype 
      });
    } else {
      res.status(400).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error });
  }
});

// Checkout (Billing)
app.post('/app/checkout', authenticateToken, async (req, res) => {
  const { billItems } = req.body; 

  if (!billItems || billItems.length === 0) {
    return res.status(400).json({ message: "No items in the bill." });
  }

  try {
    for (let item of billItems) {
      const dbItem = await Item.findById(item._id);
      
      if (!dbItem) {
        return res.status(404).json({ message: `Item ${item.name} not found.` });
      }

      if (dbItem.quantity < item.billQty) {
        return res.status(400).json({ 
          message: `Not enough stock for ${item.name}. Only ${dbItem.quantity} left.` 
        });
      }

      dbItem.quantity -= item.billQty;
      await dbItem.save();
    }

    res.status(200).json({ message: "Checkout successful, stock deducted!" });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Server error during checkout", error });
  }
});

// Get Inventory
app.get('/app/inventory', authenticateToken, async (req, res) => {
  try {
    let items;
    if (req.user.role === 'superadmin') {
      // FIX: Added shoptype to populate for superadmin
      items = await Item.find().populate('owner', 'username shoptype'); 
    } else {
      // FIX: Added populate for shopadmin so frontend can display item.owner.shoptype
      items = await Item.find({ owner: req.user.id }).populate('owner', 'username shoptype');
    }
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Can't find the items", error });
  }
});

// Add Item
app.post('/app/inventory', authenticateToken, async (req, res) => {
  try {
      const { name, price, quantity, sup_no } = req.body;
      const newItem = new Item({ name, price, quantity, sup_no, owner: req.user.id });
      const savedItem = await newItem.save();
      res.status(200).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: "Error saving item", error });
  }
});

// Update Item Quantity
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

// Create Shop Admin User
app.post('/app/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: "Only Super Admins can create users." });
  }

  try {
    const { username, password, shoptype } = req.body;
    const newUser = new User({ username, password, shoptype, role: 'shopadmin' });
    await newUser.save();
    res.status(201).json({ message: `Shop Admin '${username}' created successfully!` });
  } catch (error) {
    res.status(500).json({ message: "Error creating user. Username might already exist.", error });
  }
});

// Get Shop Admin Users
app.get('/app/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: "Only Super Admins can view users." });
  }

  try {
    const users = await User.find({ role: 'shopadmin' }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

// Get My Profile
app.get('/app/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if(!user) return res.status(404).json({message: "User not found"});

    res.status(200).json({
      username: user.username,
      shoptype: user.shoptype
    });
  }
  catch(error){
    res.status(500).json({message: "Error fetching user profile", error})
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});