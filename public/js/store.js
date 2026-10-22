// --- CREAMY.IN STORE ENGINE ---

// Global Drawer Toggle
function toggleDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);
  if (drawer) {
    drawer.classList.toggle('hidden');
  }
}

// 1. Wishlist Logic
let wishlist = JSON.parse(localStorage.getItem('creamy_wishlist') || '[]');

function toggleWish(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(item => item !== id);
  } else {
    wishlist.push(id);
  }
  localStorage.setItem('creamy_wishlist', JSON.stringify(wishlist));
  updateUI();
}

// 2. Cart Logic
let cart = JSON.parse(localStorage.getItem('creamy_cart') || '[]');

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: id, qty: 1 });
  }
  localStorage.setItem('creamy_cart', JSON.stringify(cart));
  updateUI();
  
  // Automatically open cart drawer after clicking 'Add'
  toggleDrawer('cartDrawer');
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }
  localStorage.setItem('creamy_cart', JSON.stringify(cart));
  updateUI();
}

// 3. UI Sync (Updates Badges, Cart List & Wishlist List)
function updateUI() {
  // Get raw menu data embedded in index.ejs
  const menuDataEl = document.getElementById('menu-data');
  const items = menuDataEl ? JSON.parse(menuDataEl.textContent || '[]') : [];

  // Update Header Badges
  const wishCountEl = document.getElementById('wishCount');
  const cartCountEl = document.getElementById('cartCount');
  
  if (wishCountEl) wishCountEl.innerText = wishlist.length;
  
  const totalCartQty = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCountEl) cartCountEl.innerText = totalCartQty;

  // Render Cart Drawer
  const cartList = document.getElementById('cartItemsList');
  const totalDisplay = document.getElementById('cartTotalDisplay');
  let grandTotal = 0;

  if (cartList) {
    if (cart.length === 0) {
      cartList.innerHTML = `<p class="text-center text-wine/60 py-6">Your cart is empty 🍰</p>`;
    } else {
      cartList.innerHTML = cart.map(c => {
        const prod = items.find(p => p._id === c.id) || { title: 'Bakery Item', price: 0, image: '/images/bread.jpg' };
        const itemTotal = prod.price * c.qty;
        grandTotal += itemTotal;

        return `
          <div class="flex items-center justify-between border-b border-burgundy/10 pb-3">
            <div class="flex items-center gap-3">
              <img src="${prod.image}" class="w-12 h-12 object-cover rounded-xl" onerror="this.src='/images/bread.jpg'" />
              <div>
                <h4 class="font-bold text-sm text-burgundy">${prod.title}</h4>
                <p class="text-xs text-wine/70">₹${prod.price} x${c.qty}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="updateQty('${c.id}', -1)" class="w-7 h-7 bg-sand text-burgundy font-bold rounded-full grid place-items-center">-</button>
              <span class="text-sm font-bold">${c.qty}</span>
              <button onclick="updateQty('${c.id}', 1)" class="w-7 h-7 bg-burgundy text-cream font-bold rounded-full grid place-items-center">+</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (totalDisplay) {
    totalDisplay.innerText = `₹${grandTotal}`;
  }

  // Render Wishlist Drawer
  const wishList = document.getElementById('wishlistItemsList');
  if (wishList) {
    if (wishlist.length === 0) {
      wishList.innerHTML = `<p class="text-center text-wine/60 py-6">No favorites added yet ❤️</p>`;
    } else {
      wishList.innerHTML = wishlist.map(wId => {
        const prod = items.find(p => p._id === wId) || { title: 'Bakery Item', price: 0, image: '/images/bread.jpg' };
        return `
          <div class="flex items-center justify-between border-b border-burgundy/10 pb-3">
            <div class="flex items-center gap-3">
              <img src="${prod.image}" class="w-12 h-12 object-cover rounded-xl" onerror="this.src='/images/bread.jpg'" />
              <div>
                <h4 class="font-bold text-sm text-burgundy">${prod.title}</h4>
                <p class="text-xs font-bold text-burgundy">₹${prod.price}</p>
              </div>
            </div>
            <button onclick="addToCart('${prod._id}')" class="bg-burgundy text-cream text-xs font-bold px-3 py-1.5 rounded-full">Add 🛒</button>
          </div>
        `;
      }).join('');
    }
  }
}

// 4. Smart Checkout Integration (Handles UPI and COD for both Desktop & Mobile)
function checkoutOrder() {
  const totalText = document.getElementById('cartTotalDisplay')?.innerText || '₹0';
  const numericTotal = totalText.replace(/[^0-9]/g, '') || '0';
  
  if (numericTotal === '0') {
    alert("Your cart is empty! Please add items before placing an order.");
    return;
  }

  // Determine selected payment method from radio buttons
  const selectedMethodEl = document.querySelector('input[name="payMethod"]:checked');
  const paymentMethod = selectedMethodEl ? selectedMethodEl.value : 'UPI';

  // Build itemized list summary for WhatsApp receipt
  const menuDataEl = document.getElementById('menu-data');
  const items = menuDataEl ? JSON.parse(menuDataEl.textContent || '[]') : [];
  const itemsSummary = cart.map(c => {
    const prod = items.find(p => p._id === c.id);
    return `${prod ? prod.title : 'Item'} (x${c.qty})`;
  }).join(', ');

  const upiID = "shahulrayan03@okioki";
  const payeeName = "Creamy.in Bakery";
  const adminWhatsApp = "917845550886";

  // Check device type
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (paymentMethod === 'UPI') {
    const message = `🎂 *NEW ORDER (Pre-Paid via UPI)* 🎂\n\n*Items:* ${itemsSummary}\n*Total Amount:*${totalText}\n*UPI ID:* ${upiID}\n*Payee:*${payeeName}\n\nPlease confirm my order! ✨`;
    const whatsappLink = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;

    if (isMobile) {
      // Mobile: Open UPI app deep-link, then WhatsApp
      const upiLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(payeeName)}&am=${numericTotal}&cu=INR`;
      window.location.href = upiLink;
      setTimeout(() => {
        window.open(whatsappLink, '_blank');
      }, 2000);
    } else {
      // Desktop: Open WhatsApp directly with UPI info so testing works seamlessly
      window.open(whatsappLink, '_blank');
    }

  } else {
    // Cash on Delivery (COD) WhatsApp Message
    const message = `🎂 *NEW ORDER (Cash on Delivery)* 🎂\n\n*Items:* ${itemsSummary}\n*Total Amount:*${totalText}\n*Payment Method:* 💵 Cash on Delivery (COD)\n\nPlease accept and prepare my order! ✨`;
    const whatsappLink = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;

    window.open(whatsappLink, '_blank');
  }
}

// Backward compatibility helper
function checkoutWithGPay() {
  checkoutOrder();
}

// Run UI initialization when DOM loads
document.addEventListener('DOMContentLoaded', updateUI);