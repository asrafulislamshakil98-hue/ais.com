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

// ১. মেসেজ এর জন্য স্কিমা তৈরি (Schema)
const messageSchema = new mongoose.Schema({
    name: String,
    phone: String,
    message: String,
    date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// ২. কাস্টমার থেকে মেসেজ রিসিভ করার API (POST)
app.post('/api/send-message', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.json({ success: true, message: "মেসেজ সফলভাবে পাঠানো হয়েছে!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ৩. অ্যাডমিন প্যানেলে মেসেজ দেখানোর API (GET)
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ date: -1 }); // নতুন মেসেজ আগে দেখাবে
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ৪. মেসেজ ডিলিট করার API (DELETE)
app.delete('/api/delete-message/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});