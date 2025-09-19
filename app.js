// app.js - single JS database (localStorage) shared across pages
const DB = {
  brands: [
    {id:'nike', name:'Nike'},
    {id:'puma', name:'Puma'},
    {id:'anta', name:'Anta'},
    {id:'adidas', name:'Adidas'},
    {id:'vans', name:'Vans'}
  ],
  products: [
    {id:'nike1', brand:'nike', name:'Nike Air Max', price:4500, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'},
    {id:'nike2', brand:'nike', name:'Nike Dunk Low', price:5200, img:'https://images.unsplash.com/photo-1542293787938-c9e299b88086?auto=format&fit=crop&w=800&q=80'},
    {id:'adidas1', brand:'adidas', name:'Adidas Ultraboost', price:6000, img:'https://images.unsplash.com/photo-1519741491516-4f8f9c3b2c1e?auto=format&fit=crop&w=800&q=80'},
    {id:'adidas2', brand:'adidas', name:'Adidas Superstar', price:4800, img:'https://images.unsplash.com/photo-1520975911082-3f3c7f4b4f3c?auto=format&fit=crop&w=800&q=80'},
    {id:'puma1', brand:'puma', name:'Puma RS-X', price:4300, img:'https://images.unsplash.com/photo-1585386959984-a415522c2b71?auto=format&fit=crop&w=800&q=80'},
    {id:'puma2', brand:'puma', name:'Puma Suede Classic', price:3500, img:'https://images.unsplash.com/photo-1600180758890-7b6d2f38bca4?auto=format&fit=crop&w=800&q=80'},
    {id:'anta1', brand:'anta', name:'Anta KT7', price:5800, img:'https://images.unsplash.com/photo-1600180758899-4c9f6b3b5a77?auto=format&fit=crop&w=800&q=80'},
    {id:'anta2', brand:'anta', name:'Anta Shockwave', price:5200, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'},
    {id:'vans1', brand:'vans', name:'Vans Old Skool', price:3200, img:'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?auto=format&fit=crop&w=800&q=80'},
    {id:'vans2', brand:'vans', name:'Vans Sk8-Hi', price:3800, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
  ]
};

// LocalStorage keys
const LS_USERS = 'shoeaway_users';
const LS_SESSION = 'shoeaway_session';
const LS_CART = 'shoeaway_cart';

// Helpers
function saveUsers(users){ localStorage.setItem(LS_USERS, JSON.stringify(users)); }
function loadUsers(){ return JSON.parse(localStorage.getItem(LS_USERS) || '{}'); }
function setSession(username){ localStorage.setItem(LS_SESSION, username); updateNavAccount(); }
function clearSession(){ localStorage.removeItem(LS_SESSION); updateNavAccount(); }
function currentUser(){ return localStorage.getItem(LS_SESSION); }
function loadCart(){ return JSON.parse(localStorage.getItem(LS_CART) || '[]'); }
function saveCart(cart){ localStorage.setItem(LS_CART, JSON.stringify(cart)); updateNavCart(); }
function currencyFormat(v){ return new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(v); }

// Update cart count in nav
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCountEl = document.getElementById('nav-cart-count');
  if (cartCountEl) cartCountEl.textContent = cart.length;
}

// Update account link in nav
function updateAccountNav() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navAccount = document.getElementById('nav-account');
  if (navAccount) {
    if (user && user.username) {
      navAccount.textContent = user.username;
      navAccount.href = "account.html";
    } else {
      navAccount.textContent = "Account";
      navAccount.href = "login.html";
    }
  }
}

// Init nav cart and account on all pages
function updateNavCart(){
  const count = loadCart().reduce((s,i)=>s+i.qty,0);
  const els = document.querySelectorAll('#nav-cart-count, #cart-count');
  els.forEach(e=>e.textContent = count);
  const navSubtotal = document.getElementById('cart-subtotal');
  if(navSubtotal){
    const subtotal = loadCart().reduce((s,i)=>{
      const p = DB.products.find(x=>x.id===i.id); return s + (p ? p.price * i.qty : 0);
    },0);
    navSubtotal.textContent = currencyFormat(subtotal);
  }
}
function updateNavAccount(){
  const acc = document.getElementById('nav-account');
  if(!acc) return;
  const user = currentUser();
  if(user){
    acc.textContent = user + ' (Logout)';
    acc.href = '#';
    acc.onclick = (e)=>{ e.preventDefault(); if(confirm('Logout?')){ clearSession(); } };
  } else {
    acc.textContent = 'Account';
    acc.href = 'login.html';
    acc.onclick = null;
  }
}

// Shop page: render products
function renderShop(){
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  const brandFilter = document.getElementById('brandFilter');
  DB.brands.forEach(b=>{
    const o = document.createElement('option'); o.value = b.id; o.textContent = b.name; brandFilter.appendChild(o);
  });
  const search = document.getElementById('search');
  function draw(){
    const q = search ? search.value.toLowerCase() : '';
    const brand = brandFilter ? brandFilter.value : '';
    grid.innerHTML='';
    const list = DB.products.filter(p=>{
      if(brand && p.brand !== brand) return false;
      if(!q) return true;
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    });
    for(const p of list){
      const card = document.createElement('div'); card.className = 'product';
      const img = document.createElement('div'); img.className='img'; img.style.backgroundImage = `url(${p.img})`;
      const title = document.createElement('h3'); title.textContent = p.name;
      const brandEl = document.createElement('div'); brandEl.className='brand'; brandEl.textContent = p.brand;
      const price = document.createElement('div'); price.className='price'; price.textContent = currencyFormat(p.price);
      const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Add to Cart';
      btn.onclick = ()=>{ addToCart(p.id); alert('Added to cart'); }
      card.appendChild(img); card.appendChild(title); card.appendChild(brandEl); card.appendChild(price); card.appendChild(btn);
      grid.appendChild(card);
    }
  }
  if(search) search.addEventListener('input', draw);
  if(brandFilter) brandFilter.addEventListener('change', draw);
  draw();
}

// Cart page
function renderCartPage(){
  const listEl = document.getElementById('cartList'); if(!listEl) return;
  const cart = loadCart();
  listEl.innerHTML='';
  let subtotal = 0;
  for(const it of cart){
    const p = DB.products.find(x=>x.id===it.id); if(!p) continue;
    const div = document.createElement('div'); div.className='cart-item';
    const thumb = document.createElement('div'); thumb.className='thumb'; thumb.style.backgroundImage = `url(${p.img})`;
    const info = document.createElement('div'); info.style.flex='1'; info.innerHTML = `<div style="font-weight:600">${p.name}</div><div style="color:#666">${p.brand}</div><div style="margin-top:6px">${currencyFormat(p.price)}</div>`;
    const qty = document.createElement('div'); qty.innerHTML = `<div>Qty: <button class="mini" data-id="${p.id}" data-op="dec">-</button> ${it.qty} <button class="mini" data-id="${p.id}" data-op="inc">+</button></div>`;
    const rem = document.createElement('button'); rem.className='btn ghost'; rem.textContent='Remove'; rem.onclick = ()=>{ removeFromCart(p.id); renderCartPage(); };
    div.appendChild(thumb); div.appendChild(info); div.appendChild(qty); div.appendChild(rem);
    listEl.appendChild(div);
    subtotal += p.price * it.qty;
  }
  const subtotalEl = document.getElementById('cart-subtotal'); if(subtotalEl) subtotalEl.textContent = currencyFormat(subtotal);
  // quantity buttons
  document.querySelectorAll('button.mini').forEach(b=>{
    b.addEventListener('click',()=>{
      const id = b.getAttribute('data-id'); const op = b.getAttribute('data-op');
      const c = loadCart(); const item = c.find(x=>x.id===id);
      if(!item) return;
      if(op==='inc') item.qty++; else item.qty = Math.max(1,item.qty-1);
      saveCart(c); renderCartPage();
    });
  });
}

// Orders page
function renderOrders(){
  const el = document.getElementById('ordersList'); if(!el) return;
  el.innerHTML='';
  const user = currentUser();
  if(!user){ el.innerHTML = '<div>Please login to view your orders. <a href="login.html">Login</a></div>'; return; }
  const users = loadUsers();
  const my = users[user] || {orders:[]};
  if(!my.orders || my.orders.length===0){ el.innerHTML = '<div>No orders yet.</div>'; return; }
  for(const o of my.orders.slice().reverse()){
    const card = document.createElement('div'); card.className='order-card';
    card.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>Order ${o.id}</strong><span>${new Date(o.created).toLocaleString()}</span></div>`;
    const items = document.createElement('div'); items.style.marginTop='8px';
    let total = 0;
    for(const it of o.items){
      const p = DB.products.find(x=>x.id===it.id); if(!p) continue;
      items.innerHTML += `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #eee"><div>${p.name} <small style="color:#666">(${p.brand})</small> x${it.qty}</div><div>${currencyFormat(p.price * it.qty)}</div></div>`;
      total += p.price * it.qty;
    }
    items.innerHTML += `<div style="text-align:right;font-weight:700;margin-top:8px">Total: ${currencyFormat(total)}</div>`;
    card.appendChild(items);
    el.appendChild(card);
  }
}

// Auth: register/login/checkout
function registerUser(username,password,fullname=''){
  if(!username || !password) { alert('Enter username and password'); return false; }
  const users = loadUsers();
  if(users[username]){ alert('Username already exists'); return false; }
  users[username] = { password: btoa(password), fullname: fullname || username, orders: [] };
  saveUsers(users); setSession(username); alert('Registered and logged in as ' + username); window.location = 'shop.html'; return true;
}
function loginUser(username,password){
  const users = loadUsers();
  if(!users[username] || users[username].password !== btoa(password)){ alert('Invalid credentials'); return false; }
  setSession(username); alert('Welcome back, ' + username); window.location = 'shop.html'; return true;
}
function checkout(){
  const user = currentUser(); if(!user){ if(confirm('You must be logged in to checkout. Login now?')) window.location='login.html'; return; }
  const cart = loadCart(); if(cart.length===0){ alert('Cart is empty'); return; }
  const users = loadUsers(); if(!users[user]){ alert('User not found'); return; }
  const order = { id: 'ORD' + Date.now(), items: cart, created: new Date().toISOString() };
  users[user].orders.push(order); saveUsers(users);
  // clear cart
  saveCart([]);
  alert('Purchase successful! Order ID: ' + order.id);
  window.location = 'orders.html';
}

// Cart helpers
function addToCart(productId){
  const cart = loadCart();
  const it = cart.find(x=>x.id===productId);
  if(it) it.qty++; else cart.push({id:productId, qty:1});
  saveCart(cart);
}
function removeFromCart(productId){
  let cart = loadCart();
  cart = cart.filter(x=>x.id!==productId);
  saveCart(cart);
}

// Page-specific bindings
document.addEventListener('DOMContentLoaded', ()=>{
  updateNavCart(); updateNavAccount();
  // if on shop page
  if(document.body.contains(document.getElementById('productsGrid'))){
    renderShop();
  }
  // cart page
  if(document.body.contains(document.getElementById('cartList'))){
    renderCartPage();
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
  }
  // orders page
  if(document.body.contains(document.getElementById('ordersList'))){
    renderOrders();
  }
  // login page bindings
  if(document.body.contains(document.getElementById('login-username'))){
    document.getElementById('loginBtn').addEventListener('click', ()=>{
      const u = document.getElementById('login-username').value.trim();
      const p = document.getElementById('login-password').value;
      loginUser(u,p);
    });
  }
  // register page bindings
  if(document.body.contains(document.getElementById('reg-username'))){
    document.getElementById('registerBtn').addEventListener('click', ()=>{
      const u = document.getElementById('reg-username').value.trim();
      const p = document.getElementById('reg-password').value;
      const f = document.getElementById('reg-fullname').value.trim();
      registerUser(u,p,f);
    });
  }
  // quick actions for adding to cart from other pages (delegation)
  document.body.addEventListener('click', (e)=>{
    if(e.target && e.target.matches && e.target.matches('[data-add-to]')){
      const id = e.target.getAttribute('data-add-to'); addToCart(id); alert('Added to cart'); updateNavCart();
    }
  });
  // Update cart count and account nav on page load
  updateCartCount();
  updateAccountNav();
});