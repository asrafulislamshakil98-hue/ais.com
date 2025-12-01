const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const dbURI = 'mongodb+srv://shakilkhan:aYyn9sr.ZZgPG.Z@cluster0.hwgbutt.mongodb.net/?appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log(err));

// --- Product Schema ---
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    category: String
});
const Product = mongoose.model('Product', productSchema);

// --- Order Schema (নতুন) ---
const orderSchema = new mongoose.Schema({
    customerName: String,
    address: String,
    phone: String,
    email: String,
    totalPrice: Number,
    items: Array, // কার্টের আইটেমগুলো এখানে থাকবে
    orderDate: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);


// --- API Routes ---

// Products APIs
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/api/add-product', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json({ message: "Product Added Successfully!" });
});

app.delete('/api/delete-product/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product Deleted!" });
});

// Orders APIs (নতুন)
app.post('/api/place-order', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.json({ success: true, message: "Order Placed Successfully!", orderId: savedOrder._id });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error placing order" });
    }
});

app.get('/api/orders', async (req, res) => {
    const orders = await Order.find().sort({ orderDate: -1 }); // নতুন অর্ডার আগে দেখাবে
    res.json(orders);
});

app.delete('/api/delete-order/:id', async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order Deleted!" });
});

// Server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});