console.log("JavaScript সফলভাবে লোড হয়েছে!");

// গ্লোবাল ভেরিয়েবল
let products = []; 
let cart = JSON.parse(localStorage.getItem('ecommerceCart')) || [];

// -------------------- DOM Elements --------------------
const productListDiv = document.getElementById('product-list');
const cartCountSpan = document.getElementById('cart-count');
const navCartCountSpan = document.getElementById('nav-cart-count');
const cartItemsDiv = document.getElementById('cart-items');
const cartTotalSpan = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutSection = document.getElementById('checkout-section');
const checkoutForm = document.getElementById('checkout-form');
const orderConfirmation = document.getElementById('order-confirmation');
const confName = document.getElementById('conf-name');
const confOrderId = document.getElementById('order-id');
const confAddress = document.getElementById('conf-address');
const continueShoppingBtn = document.getElementById('continue-shopping-btn');
const productSection = productListDiv; 
const categoryFilter = document.getElementById('category-filter');
const sortBy = document.getElementById('sort-by');
const searchInput = document.getElementById('search-input');

// -------------------- সার্ভার থেকে ডাটা ফেচ করা --------------------
async function fetchProducts() {
    try {
        const res = await fetch('https://ais-com.onrender.com/api/products');
        const data = await res.json();
        products = data;
        displayProducts(products);
        populateCategories();
    } catch (error) {
        console.error("Failed to fetch products:", error);
        productListDiv.innerHTML = '<p>সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না।</p>';
    }
}

// -------------------- পণ্য লিস্ট তৈরি (Display) --------------------
function displayProducts(productList = products) {
    productListDiv.innerHTML = '';
    if (productList.length === 0) {
        productListDiv.innerHTML = '<p style="text-align: center; width: 100%;">কোনো পণ্য পাওয়া যায়নি।</p>';
        return;
    }
    productList.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150'">
            <h3>${product.name}</h3>
            <p>${product.description ? product.description.substring(0, 60) + '...' : ''}</p>
            <p class="price">${product.price} টাকা</p>
            <button class="add-to-cart-btn" data-id="${product._id}">কার্টে যোগ করুন</button>
        `;
        card.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(product._id));
        productListDiv.appendChild(card);
    });
}

// -------------------- কার্ট ফাংশন --------------------
function addToCart(id) {
    const product = products.find(p => p._id === id);
    if (!product) return;
    const item = cart.find(i => i._id === id);
    if (item) {
        item.quantity++;
        alert(`${product.name} - এর পরিমাণ বাড়ানো হয়েছে।`);
    } else {
        cart.push({ ...product, quantity: 1 });
        alert(`${product.name} কার্টে যোগ হয়েছে!`);
    }
    updateCartUI();
    saveCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i._id !== id);
    updateCartUI();
    saveCart();
}

function changeQuantity(id, change) {
    const item = cart.find(i => i._id === id);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        updateCartUI();
        saveCart();
    }
}

function saveCart() {
    localStorage.setItem('ecommerceCart', JSON.stringify(cart));
}

function updateCartUI() {
    cartItemsDiv.innerHTML = '';
    let total = 0, totalItems = 0;
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>কার্ট খালি।</p>';
        cartCountSpan.textContent = '0';
        navCartCountSpan.textContent = '0';
        cartTotalSpan.textContent = '0';
        checkoutBtn.disabled = true;
        return;
    }
    cart.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.style.borderBottom = '1px solid #ddd';
        div.style.padding = '10px 0';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.innerHTML = `
            <div class="item-info">
                <strong>${item.name}</strong>
                <div class="quantity-control" style="margin-top: 5px;">
                    <button class="quantity-btn decrease" data-id="${item._id}">-</button>
                    <span style="margin: 0 10px;">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item._id}">+</button>
                </div>
            </div>
            <div class="item-actions">
                <span>${item.price * item.quantity} টাকা</span>
                <button class="remove-item-btn" data-id="${item._id}" style="color:red; margin-left:10px;">x</button>
            </div>
        `;
        cartItemsDiv.appendChild(div);
        total += item.price * item.quantity;
        totalItems += item.quantity;
    });
    cartTotalSpan.textContent = total;
    cartCountSpan.textContent = totalItems;
    navCartCountSpan.textContent = totalItems;
    checkoutBtn.disabled = false;

    document.querySelectorAll('.remove-item-btn').forEach(btn => btn.addEventListener('click', () => removeFromCart(btn.dataset.id)));
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => btn.addEventListener('click', () => changeQuantity(btn.dataset.id, -1)));
    document.querySelectorAll('.quantity-btn.increase').forEach(btn => btn.addEventListener('click', () => changeQuantity(btn.dataset.id, 1)));
}

// -------------------- চেকআউট এবং সার্ভারে অর্ডার পাঠানো --------------------
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return alert('কার্ট খালি!');
    productSection.style.display = 'none';
    document.getElementById('cart-section').style.display = 'none';
    checkoutSection.style.display = 'block';
});

checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ফর্ম ডাটা সংগ্রহ
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const totalPrice = parseInt(cartTotalSpan.textContent);

    // অর্ডার অবজেক্ট তৈরি
    const orderData = {
        customerName: name,
        email: email,
        address: address,
        phone: phone,
        totalPrice: totalPrice,
        items: cart // কার্টের সব আইটেম
    };

    try {
        // সার্ভারে পাঠানো
        const response = await fetch('https://ais-com.onrender.com/api/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            // সফল হলে কনফার্মেশন দেখানো
            confName.textContent = name;
            confOrderId.textContent = result.orderId;
            confAddress.textContent = address;

            checkoutForm.style.display = 'none';
            orderConfirmation.style.display = 'block';
            
            // কার্ট খালি করা
            cart = [];
            saveCart();
            updateCartUI();
        } else {
            alert('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('সার্ভার এরর!');
    }
});

continueShoppingBtn.addEventListener('click', () => {
    orderConfirmation.style.display = 'none';
    checkoutForm.style.display = 'block';
    checkoutSection.style.display = 'none';
    productSection.style.display = 'grid';
    document.getElementById('cart-section').style.display = 'block';
    checkoutForm.reset();
});

// -------------------- ফিল্টার এবং স্লাইডার (বাকি অংশ অপরিবর্তিত) --------------------
function populateCategories() {
    categoryFilter.innerHTML = '<option value="all">সব</option>';
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(cat => {
        if(cat) {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        }
    });
}
function applyFiltersAndSort() {
    let filtered = [...products];
    const selectedCat = categoryFilter.value;
    if (selectedCat !== 'all') filtered = filtered.filter(p => p.category === selectedCat);
    if (searchInput.value) {
        const searchText = searchInput.value.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchText));
    }
    if (sortBy.value === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sortBy.value === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    displayProducts(filtered);
}
categoryFilter.addEventListener('change', applyFiltersAndSort);
sortBy.addEventListener('change', applyFiltersAndSort);
searchInput.addEventListener('input', applyFiltersAndSort);

const slides = document.querySelectorAll('.slider-image');
const prevBtn = document.querySelector('.prev-slide');
const nextBtn = document.querySelector('.next-slide');
let currentSlide = 0;
function showSlide(index) {
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
}
function nextSlide() { currentSlide = (currentSlide + 1) % slides.length; showSlide(currentSlide); }
function prevSlide() { currentSlide = (currentSlide - 1 + slides.length) % slides.length; showSlide(currentSlide); }
if (slides.length > 0) {
    if(nextBtn) nextBtn.addEventListener('click', nextSlide);
    if(prevBtn) prevBtn.addEventListener('click', prevSlide);
    setInterval(nextSlide, 5000);
}
const yearSpan = document.getElementById('current-year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

fetchProducts(); 
updateCartUI();

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('msgName').value,
        phone: document.getElementById('msgPhone').value,
        message: document.getElementById('msgText').value
    };

    try {
        const res = await fetch('https://ais-com.onrender.com/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        if (result.success) {
            alert('ধন্যবাদ! আপনার মেসেজ পাঠানো হয়েছে।');
            e.target.reset(); // ফর্ম খালি করে দেবে
        } else {
            alert('সমস্যা হয়েছে, আবার চেষ্টা করুন।');
        }
    } catch (error) {
        console.error(error);
        alert('সার্ভার এরর!');
    }
    
});

