// ============================================================
//  EL-MART — Application Logic
// ============================================================

// ─── STATE ───────────────────────────────────────────────────
let currentRole = 'customer';
let selectedRole = 'customer';
let viewHistory = [];
let currentChatName = '';
let deferredInstallPrompt = null;

// ─── SAMPLE DATA ─────────────────────────────────────────────
const POSTS = [
  {
    id:1, biz:'Okonkwo Electronics', bizInitials:'OE', cat:'Electronics',
    text:'🔥 Just got fresh stock of Samsung Galaxy A55! Super clear display, 50MP camera. Only ₦285,000. DM us now!',
    img:'📱', price:'₦285,000', stock:'in', time:'2m ago', sponsored:false,
    color:'#0A2540', likes:24, views:380
  },
  {
    id:2, biz:'FashionHub Lagos', bizInitials:'FL', cat:'Fashion',
    text:'New arrival! Premium Ankara blazers for corporate events. Available in sizes S–XXL. Wholesale available too 🎉',
    img:'👔', price:'₦18,500', stock:'in', time:'15m ago', sponsored:true,
    color:'#7C3AED', likes:61, views:910
  },
  {
    id:3, biz:'AgroFresh Farms', bizInitials:'AF', cat:'Agriculture',
    text:'Fresh tomatoes, peppers, and onions straight from our Kano farm 🍅 Order in bulk for wholesale rates.',
    img:'🍅', price:'₦5,500 / bag', stock:'in', time:'1hr ago', sponsored:false,
    color:'#059669', likes:18, views:142
  },
  {
    id:4, biz:'HealthPlus Pharmacy', bizInitials:'HP', cat:'Health',
    text:'⚠️ Vitamin C and Zinc supplements now back in stock! Get your immunity boosted this season.',
    img:'💊', price:'₦3,200', stock:'in', time:'2hr ago', sponsored:false,
    color:'#DC2626', likes:9, views:87
  },
  {
    id:5, biz:'TechKing Abuja', bizInitials:'TK', cat:'Electronics',
    text:'MacBook Air M2 — 16GB RAM, 512GB SSD. Now available. Limited units. Contact us ASAP.',
    img:'💻', price:'₦920,000', stock:'out', time:'3hr ago', sponsored:false,
    color:'#1D4ED8', likes:44, views:672
  }
];

const STORES = [
  { name:'Okonkwo Electronics', initials:'OE', cat:'Electronics', loc:'Lagos', type:'Retail & Wholesale', color:'#0A2540' },
  { name:'FashionHub Lagos', initials:'FL', cat:'Fashion', loc:'Lagos', type:'Retail', color:'#7C3AED' },
  { name:'AgroFresh Farms', initials:'AF', cat:'Agriculture', loc:'Kano', type:'Wholesale', color:'#059669' },
  { name:'HealthPlus Pharmacy', initials:'HP', cat:'Health', loc:'Abuja', type:'Retail', color:'#DC2626' },
  { name:'TechKing Abuja', initials:'TK', cat:'Electronics', loc:'Abuja', type:'Retail', color:'#1D4ED8' },
];

const PRODUCTS = [
  { id:1, name:'Samsung Galaxy A55', cat:'Electronics', price:285000, wprice:260000, stock:'In Stock', emoji:'📱' },
  { id:2, name:'iPhone 14 Pro (Black)', cat:'Electronics', price:720000, wprice:690000, stock:'In Stock', emoji:'📱' },
  { id:3, name:'Samsung Galaxy A55', cat:'Electronics', price:285000, wprice:null, stock:'In Stock', emoji:'📱' },
  { id:4, name:'JBL Speaker Flip 6', cat:'Electronics', price:48000, wprice:43000, stock:'In Stock', emoji:'🔊' },
  { id:5, name:'MacBook Air M2', cat:'Electronics', price:920000, wprice:890000, stock:'Out of Stock', emoji:'💻' },
  { id:6, name:'Adidas Joggers (M)', cat:'Fashion', price:12500, wprice:null, stock:'In Stock', emoji:'👖' },
];

// ─── NAVIGATION ───────────────────────────────────────────────
function showView(id) {
  const current = document.querySelector('.view.active');
  if (current && current.id !== id) viewHistory.push(current.id);
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const next = document.getElementById(id);
  if (next) {
    next.classList.add('active');
    window.scrollTo(0, 0);
  }
  // Init views
  if (id === 'view-customer') initCustomerFeed();
  if (id === 'view-explore') initExplore();
  if (id === 'view-biz-products') initProductsTable();
}

function goBack() {
  if (viewHistory.length > 0) {
    showView(viewHistory.pop());
  } else {
    showView('view-customer');
  }
}

// ─── SIGNUP ───────────────────────────────────────────────────
function setRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + role).classList.add('active');
  const extras = ['biz-extra','biz-cat-wrap','biz-type-wrap','biz-loc-wrap'];
  extras.forEach(id => {
    document.getElementById(id).style.display = role === 'business' ? 'block' : 'none';
  });
}

function showSignup(role) {
  showView('view-signup');
  setRole(role);
}

function handleSignup() {
  const name = document.getElementById('su-name').value.trim();
  if (!name) { toast('Please enter your full name'); return; }
  toast('Account created! Welcome to El-Mart 🎉');
  setTimeout(() => {
    if (selectedRole === 'business') {
      showView('view-business');
    } else {
      showView('view-customer');
    }
  }, 1000);
}

function handleLogin() {
  toast('Logged in successfully!');
  setTimeout(() => showView('view-customer'), 800);
}

function loginAs(role) {
  currentRole = role;
  toast(role === 'business' ? 'Welcome back, CEO 👑' : 'Welcome back! 👋');
  setTimeout(() => {
    showView(role === 'business' ? 'view-business' : 'view-customer');
  }, 600);
}

// ─── CUSTOMER FEED ────────────────────────────────────────────
function initCustomerFeed() {
  renderPosts(POSTS);
  renderStores(STORES);
}

function renderPosts(posts) {
  const feed = document.getElementById('posts-feed');
  if (!feed) return;
  feed.innerHTML = posts.map(p => `
    <div class="post-card">
      <div class="post-header">
        <div class="post-biz-avatar" style="background:${p.color}">${p.bizInitials}</div>
        <div class="post-biz-info">
          <div class="post-biz-name" onclick="openStore('${p.biz}','${p.bizInitials}','${p.cat}','${p.color}')">${p.biz}</div>
          <div class="post-biz-cat">📍 ${p.cat}</div>
        </div>
        <div class="post-time">${p.time}</div>
        ${p.sponsored ? '<div class="post-sponsored">Sponsored</div>' : ''}
      </div>
      <div class="post-body">${p.text}</div>
      <div class="post-img">${p.img}</div>
      <div class="post-product-bar">
        <div class="post-price">${p.price}</div>
        <div class="post-stock ${p.stock}">${p.stock === 'in' ? '✅ In Stock' : '❌ Out of Stock'}</div>
      </div>
      <div class="post-actions-bar">
        <div class="post-action" onclick="toast('Liked!')">❤️ ${p.likes}</div>
        <div class="post-action" onclick="openChat('${p.biz}','${p.bizInitials}')">💬 Chat Store</div>
        <div class="post-action">👁 ${p.views} views</div>
        <div class="post-action" onclick="toast('Shared!')">🔗 Share</div>
      </div>
    </div>
  `).join('');
}

function renderStores(stores) {
  const list = document.getElementById('stores-list');
  if (!list) return;
  list.innerHTML = stores.map(s => `
    <div class="store-card" onclick="openStore('${s.name}','${s.initials}','${s.cat}','${s.color}')">
      <div class="store-card-avatar" style="background:${s.color}">${s.initials}</div>
      <div class="store-card-info">
        <div class="store-card-name">${s.name}</div>
        <div class="store-card-meta">📍 ${s.loc} · ${s.cat}</div>
      </div>
      <span class="store-card-badge ${s.type.includes('Wholesale') ? 'badge-whole' : 'badge-retail'}">${s.type.includes('Wholesale') ? 'WS' : 'RT'}</span>
    </div>
  `).join('');
}

function handleSearch() {
  const q = document.getElementById('search-input').value.toLowerCase();
  if (!q) { renderPosts(POSTS); return; }
  const filtered = POSTS.filter(p =>
    p.biz.toLowerCase().includes(q) ||
    p.cat.toLowerCase().includes(q) ||
    p.text.toLowerCase().includes(q)
  );
  renderPosts(filtered);
}

function filterCat(btn, cat) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  if (cat === 'all') { renderPosts(POSTS); return; }
  const filtered = POSTS.filter(p => p.cat.toLowerCase().includes(cat));
  renderPosts(filtered.length ? filtered : []);
}

function setBottomNav(btn, tab) {
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ─── EXPLORE ─────────────────────────────────────────────────
function initExplore() {
  handleExploreSearch();
}

function handleExploreSearch() {
  const q = (document.getElementById('explore-search')?.value || '').toLowerCase();
  const cat = (document.getElementById('exp-cat')?.value || '').toLowerCase();
  const loc = (document.getElementById('exp-loc')?.value || '').toLowerCase();
  const type = (document.getElementById('exp-type')?.value || '').toLowerCase();

  let results = [...STORES];
  if (q) results = results.filter(s => s.name.toLowerCase().includes(q) || s.cat.toLowerCase().includes(q));
  if (cat) results = results.filter(s => s.cat.toLowerCase().includes(cat));
  if (loc) results = results.filter(s => s.loc.toLowerCase().includes(loc));
  if (type) results = results.filter(s => s.type.toLowerCase().includes(type));

  const grid = document.getElementById('explore-results');
  if (!grid) return;

  if (!results.length) {
    grid.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);grid-column:1/-1">No stores found. Try a different filter.</div>';
    return;
  }
  grid.innerHTML = results.map(s => `
    <div class="explore-card" onclick="openStore('${s.name}','${s.initials}','${s.cat}','${s.color}')">
      <div class="explore-card-img" style="background:${s.color}20">${s.initials}</div>
      <div class="explore-card-body">
        <div class="explore-card-name">${s.name}</div>
        <div class="explore-card-meta">📍 ${s.loc} · ${s.cat}</div>
        <div class="explore-card-meta">${s.type}</div>
      </div>
    </div>
  `).join('');
}

// ─── STORE VIEW ───────────────────────────────────────────────
function openStore(name, initials, cat, color) {
  const storePage = document.getElementById('store-page');
  const storeProd = PRODUCTS.slice(0, 5);

  storePage.innerHTML = `
    <div class="store-page-wrap">
      <div class="store-hero" style="background: linear-gradient(135deg, ${color}, ${color}cc)">
        <button class="store-back-btn" onclick="goBack()">← Back</button>
        <div class="store-hero-overlay"></div>
        <div class="store-hero-content">
          <div class="store-logo-big" style="background:${color === '#0A2540' ? '#FF6B35' : color}">${initials}</div>
          <div>
            <div class="store-hero-name">${name}</div>
            <div class="store-hero-cat">📍 Lagos · ${cat}</div>
          </div>
        </div>
      </div>
      <div class="store-action-bar">
        <button class="btn-primary sm" onclick="openChat('${name}','${initials}')">💬 Chat</button>
        <button class="btn-ghost sm" onclick="toast('📞 Calling ${name}...')">📞 Call</button>
        <button class="btn-ghost sm" onclick="toast('📹 Starting video call...')">📹 Video</button>
        <button class="btn-ghost sm" onclick="toast('❤️ Now following ${name}')">❤️ Follow</button>
        <button class="btn-ghost sm" onclick="toast('📍 Location shared in chat!')">📍 Location</button>
      </div>
      <div class="store-content">
        <p class="store-about-text">Welcome to ${name} — your trusted partner for quality products. We pride ourselves on reliable service and competitive pricing for all customers, whether retail or wholesale.</p>
        <div class="section-title">📦 Products</div>
        <div class="store-products-grid">
          ${storeProd.map(p => `
            <div class="product-mini-card" onclick="toast('Product detail coming soon!')">
              <div class="product-mini-img">${p.emoji}</div>
              <div class="product-mini-body">
                <div class="product-mini-name">${p.name}</div>
                <div class="product-mini-price">₦${p.price.toLocaleString()}</div>
                ${p.wprice ? `<div style="font-size:0.72rem;color:var(--text-muted)">WS: ₦${p.wprice.toLocaleString()}</div>` : ''}
                <div class="product-mini-stock ${p.stock === 'In Stock' ? 'in' : 'out'}">${p.stock === 'In Stock' ? '✅ In Stock' : '❌ Out of Stock'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  showView('view-store');
}

// ─── CHAT ─────────────────────────────────────────────────────
function openChat(name, initials) {
  currentChatName = name;
  document.getElementById('chat-avatar-disp').textContent = initials;
  document.getElementById('chat-name-disp').textContent = name;
  document.getElementById('chat-messages-area').innerHTML = `
    <div class="msg bot"><div class="msg-bubble">Hi! 👋 Welcome to <strong>${name}</strong>. How can we help you today? (Chatbot)</div></div>
  `;
  showView('view-chat-open');
}

function sendChatMsg() {
  const input = document.getElementById('chat-msg-input');
  const msg = input.value.trim();
  if (!msg) return;
  const area = document.getElementById('chat-messages-area');
  area.innerHTML += `<div class="msg me"><div class="msg-bubble">${msg}</div></div>`;
  input.value = '';
  area.scrollTop = area.scrollHeight;

  // Bot reply
  setTimeout(() => {
    const replies = [
      "Thanks for reaching out! 😊 Our team will get back to you shortly.",
      "Great question! Let me check that for you. One moment please.",
      "We have that item available! Would you like to know the price?",
      "You can also call us directly for faster assistance 📞",
      "We offer both retail and wholesale pricing. What quantity do you need?"
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    area.innerHTML += `<div class="msg bot"><div class="msg-bubble">🤖 ${reply}</div></div>`;
    area.scrollTop = area.scrollHeight;
  }, 1000);
}

// ─── AI ADVISOR ───────────────────────────────────────────────
function askAI() {
  const input = document.getElementById('ai-input');
  const q = input.value.trim();
  const resp = document.getElementById('ai-response');
  if (!q) return;

  resp.textContent = '🤖 Thinking...';
  input.value = '';

  setTimeout(() => {
    let answer = '';
    const ql = q.toLowerCase();
    if (ql.includes('iphone') || ql.includes('samsung') || ql.includes('phone')) {
      answer = '📊 Based on current Nigerian market data, that price seems fair. iPhone 11 typically ranges ₦180,000–₦250,000 depending on storage. I recommend checking 2–3 sellers before buying.';
    } else if (ql.includes('macbook') || ql.includes('laptop')) {
      answer = '💡 MacBook M2 prices in Nigeria currently range ₦850,000–₦1.1M new. If you see one under ₦700,000 ensure it\'s genuine — check IMEI and warranty.';
    } else if (ql.includes('fair') || ql.includes('price') || ql.includes('₦')) {
      answer = '🔍 To evaluate a fair price, I\'d compare: ① Official retail price ② Market resale value ③ Condition (new/Tokunbo) ④ Warranty status. Want me to analyze a specific item?';
    } else {
      answer = '🤖 I can help you evaluate product value, compare prices, and identify genuine goods. Try asking: "Is ₦45,000 fair for an iPhone 11?" or "What\'s the market price of a 65-inch TV in Lagos?"';
    }
    resp.textContent = answer;
  }, 1200);
}

// ─── BUSINESS: STORE EDITOR ───────────────────────────────────
function updatePreview() {
  const name = document.getElementById('store-name-input')?.value || 'Your Store';
  const tagline = document.getElementById('store-tagline')?.value || 'Your tagline here';
  const about = document.getElementById('store-about')?.value || '';
  const color1 = document.getElementById('store-color1')?.value || '#0A2540';

  const el = id => document.getElementById(id);
  if (el('sp-name')) el('sp-name').textContent = name;
  if (el('sp-tagline')) el('sp-tagline').textContent = tagline;
  if (el('sp-about')) el('sp-about').textContent = about;
  if (el('sp-header')) el('sp-header').style.background = color1;
}

function previewStore() {
  openStore(
    document.getElementById('store-name-input')?.value || 'My Store',
    'MS', 'Electronics', document.getElementById('store-color1')?.value || '#0A2540'
  );
}

// ─── BUSINESS: PRODUCTS ───────────────────────────────────────
let bizProducts = [...PRODUCTS];

function initProductsTable() {
  renderProductsTable();
}

function renderProductsTable() {
  const wrap = document.getElementById('products-table');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="products-table">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Retail Price</th>
            <th>Wholesale</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${bizProducts.map(p => `
            <tr>
              <td><span class="prod-name-cell">${p.emoji} ${p.name}</span></td>
              <td>${p.cat}</td>
              <td class="prod-price-cell">₦${p.price.toLocaleString()}</td>
              <td>${p.wprice ? '₦'+p.wprice.toLocaleString() : '—'}</td>
              <td>
                <span class="post-stock ${p.stock === 'In Stock' ? 'in' : 'out'}">
                  ${p.stock === 'In Stock' ? '✅ In Stock' : '❌ Out of Stock'}
                </span>
              </td>
              <td>
                <button class="btn-ghost xs" onclick="toggleStock(${p.id})">
                  ${p.stock === 'In Stock' ? 'Mark Out of Stock' : 'Mark In Stock'}
                </button>
                <button class="btn-ghost xs" onclick="toast('Edit feature coming soon!')">Edit</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function toggleStock(id) {
  const p = bizProducts.find(x => x.id === id);
  if (!p) return;
  p.stock = p.stock === 'In Stock' ? 'Out of Stock' : 'In Stock';
  renderProductsTable();
  toast(`${p.name} marked as ${p.stock}`);
}

function showAddProduct() {
  document.getElementById('add-product-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('add-product-modal').style.display = 'none';
}

function addProduct() {
  const name = document.getElementById('np-name')?.value?.trim();
  const price = parseFloat(document.getElementById('np-price')?.value || 0);
  const wprice = parseFloat(document.getElementById('np-wprice')?.value || 0) || null;
  const cat = document.getElementById('np-cat')?.value;
  const stock = document.getElementById('np-stock')?.value || 'In Stock';

  if (!name || !price) { toast('Please fill in product name and price'); return; }

  bizProducts.push({
    id: bizProducts.length + 1,
    name, cat, price, wprice, stock,
    emoji: cat === 'Electronics' ? '📱' : cat === 'Fashion' ? '👕' : cat === 'Food' ? '🍎' : '📦'
  });
  closeModal();
  renderProductsTable();
  toast(`${name} added to your store! 🎉`);
}

// ─── BUSINESS TAB ─────────────────────────────────────────────
function bizTab(btn, tab) {
  document.querySelectorAll('.biz-nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ─── TOAST ────────────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ─── PWA INSTALL ─────────────────────────────────────────────
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallBanner();
});

function showInstallBanner() {
  if (document.getElementById('pwa-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'pwa-banner';
  banner.className = 'pwa-banner';
  banner.innerHTML = `
    <div class="pwa-banner-text">
      <strong>📲 Install El-Mart</strong>
      Add to your home screen for the best experience
    </div>
    <button class="pwa-install-btn" onclick="installPWA()">Install</button>
    <button class="pwa-dismiss" onclick="dismissBanner()">✕</button>
  `;
  document.body.appendChild(banner);
}

function installPWA() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then(() => {
    deferredInstallPrompt = null;
    dismissBanner();
  });
}

function dismissBanner() {
  const b = document.getElementById('pwa-banner');
  if (b) b.remove();
}

// Show demo install banner after 3s on landing
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!deferredInstallPrompt && document.querySelector('#view-landing.active')) {
      showInstallBanner();
    }
  }, 3000);
});

// ─── KEYBOARD ─────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const chatInput = document.getElementById('chat-msg-input');
    if (document.activeElement === chatInput) { sendChatMsg(); return; }
    const aiInput = document.getElementById('ai-input');
    if (document.activeElement === aiInput) { askAI(); return; }
  }
});
