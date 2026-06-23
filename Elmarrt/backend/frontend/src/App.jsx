import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './index.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ─── Tiny toast helper ───────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState({ msg: '', show: false });
  const timer = useRef(null);
  const show = useCallback((msg) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ msg, show: true });
    timer.current = setTimeout(() => setToast({ msg: '', show: false }), 2800);
  }, []);
  return [toast, show];
}

// ─── Nigerian states list ────────────────────────────────────────────────────
const NG_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT (Abuja)','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara'
];

// ─── Loading spinner ─────────────────────────────────────────────────────────
function Spinner({ size = 20 }) {
  return (
    <span className="spinner" style={{ width: size, height: size }} aria-label="Loading" />
  );
}

export default function App() {

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [view, setView]           = useState('landing');
  const [role, setRole]           = useState('customer');
  const showView = useCallback((v) => { window.scrollTo(0, 0); setView(v); }, []);

  // ── Auth / Profile ──────────────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData]   = useState({ email:'', password:'', fullName:'', bizName:'', bizCat:'', location:'', sellerType:'retail', newsletter:false });
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword]   = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [authLoading, setAuthLoading]   = useState(false);

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const [stats, setStats]           = useState({ productCount:0, viewCount:0, messageCount:0, followerCount:0 });
  const [recentProducts, setRecentProducts] = useState([]);
  const [quickPost, setQuickPost]   = useState('');
  const [dashLoading, setDashLoading] = useState(false);

  // ── Products ────────────────────────────────────────────────────────────────
  const [productData, setProductData] = useState({ name:'', price:'', stock:'', category:'Electronics', description:'' });
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  // ── Social feed ─────────────────────────────────────────────────────────────
  const [posts, setPosts]           = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [activeCatFilter, setActiveCatFilter] = useState('All');

  // ── Search / Explore ────────────────────────────────────────────────────────
  const [searchMode, setSearchMode] = useState('product');
  const [searchData, setSearchData] = useState({ name:'', location:'', product:'' });
  const [stores, setStores]         = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Chat ────────────────────────────────────────────────────────────────────
  const [chatList, setChatList]     = useState([]);
  const [activeChat, setActiveChat] = useState({ id:null, name:'', initials:'' });
  const [messages, setMessages]     = useState([]);
  const [chatInput, setChatInput]   = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef                  = useRef(null);

  // ── Floating AI bot ─────────────────────────────────────────────────────────
  const [botOpen, setBotOpen]       = useState(false);
  const [botMessages, setBotMessages] = useState([{ sender:'bot', text:"Hi! I'm your El-Mart Advisor 🤖 Ask me if a price is fair or what to buy!" }]);
  const [botInput, setBotInput]     = useState('');
  const [botLoading, setBotLoading] = useState(false);
  const botEndRef                   = useRef(null);

  // ── AI Advisor (sidebar) ────────────────────────────────────────────────────
  const [aiQuery, setAiQuery]       = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading]   = useState(false);

  // ── Notifications ───────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen]     = useState(false);
  const notifRef = useRef(null);

  // ── Newsletter ──────────────────────────────────────────────────────────────
  const [subscribers, setSubscribers] = useState([]);
  const [campaignText, setCampaignText] = useState('');

  // ── UI toggles ──────────────────────────────────────────────────────────────
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [activeSettingTab, setActiveSettingTab] = useState('branding');
  const [toast, showToast]            = useToast();

  // ── Selected store for view-store ────────────────────────────────────────────
  const [viewingStore, setViewingStore] = useState(null);

  // ── Derived helpers ─────────────────────────────────────────────────────────
  const token = () => localStorage.getItem('token');
  const authH = () => ({ headers: { Authorization: `Token ${token()}` } });
  const avatarLetter = (userProfile?.business_name?.[0] || userProfile?.full_name?.[0] || userProfile?.fullName?.[0] || userProfile?.username?.[0] || 'U').toUpperCase();

  // ══════════════════════════════════════════════════════════════════════
  //  CLOSE NOTIFICATION DROPDOWN ON OUTSIDE CLICK
  // ══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ══════════════════════════════════════════════════════════════════════
  //  RESTORE SESSION ON MOUNT
  // ══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedProfile = localStorage.getItem('profile');
    if (savedToken && savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        const resolvedRole = savedRole || (profile.is_business ? 'business' : profile.role || 'customer');
        setUserProfile(profile);
        setRole(resolvedRole);
        window.scrollTo(0, 0);
        setView(resolvedRole === 'business' ? 'business-dash' : 'customer-home');
      } catch {}
    }
  }, []);

  // ══════════════════════════════════════════════════════════════════════
  //  DATA FETCHING
  // ══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (view === 'customer-home' || view === 'social-feed') fetchFeed();
    if (view === 'business-dash') fetchDashboard();
    if (view === 'biz-inventory') fetchDashboard();
    if (view === 'chat') fetchChatList();
    if (view === 'newsletter') fetchSubscribers();
    if (view === 'explore' && stores.length === 0) handleMultiSearch();
  }, [view, handleMultiSearch]);

  useEffect(() => { if (userProfile) fetchNotifications(); }, [userProfile]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);
  useEffect(() => { botEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [botMessages]);

  const fetchFeed = async () => {
    setFeedLoading(true);
    try {
      const r = await axios.get(`${API}/api/posts/`, authH());
      setPosts(Array.isArray(r.data) ? r.data : []);
    } catch {
      setPosts([]);
    } finally {
      setFeedLoading(false);
    }
  };

  const fetchDashboard = async () => {
    if (!token()) return;
    setDashLoading(true);
    try {
      const r = await axios.get(`${API}/api/my-products/`, authH());
      const count = r.data.count ?? (Array.isArray(r.data.products) ? r.data.products.length : 0);
      setStats(s => ({ ...s, productCount: count }));
      if (Array.isArray(r.data.products)) setRecentProducts(r.data.products);
      else if (Array.isArray(r.data)) setRecentProducts(r.data);
    } catch {}
    finally { setDashLoading(false); }
  };

  const fetchChatList = async () => {
    setChatLoading(true);
    try {
      const r = await axios.get(`${API}/api/messages/`, authH());
      const msgs = Array.isArray(r.data) ? r.data : [];
      const seen = {};
      msgs.forEach(m => {
        const isMe = m.sender === userProfile?.id;
        const otherId = isMe ? m.receiver : m.sender;
        const otherName = isMe ? `User ${m.receiver}` : (m.sender_email || `User ${m.sender}`);
        if (!seen[otherId]) {
          seen[otherId] = { id: otherId, name: otherName, last_message: m.content, unread_count: (!isMe && !m.is_read) ? 1 : 0, is_business: false };
        } else if (!isMe && !m.is_read) {
          seen[otherId].unread_count += 1;
          seen[otherId].last_message = m.content;
        }
      });
      setChatList(Object.values(seen));
    } catch {
      setChatList([]);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const r = await axios.get(`${API}/api/notifications/`, authH());
      setNotifications(Array.isArray(r.data) ? r.data : []);
    } catch {
      setNotifications([]);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const r = await axios.get(`${API}/api/newsletter/subscribers/`, authH());
      setSubscribers(Array.isArray(r.data) ? r.data : []);
    } catch {
      setSubscribers([]);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  AUTH
  // ══════════════════════════════════════════════════════════════════════

  const handleLogin = async () => {
    if (!formData.email || !formData.password) return showToast('Please enter your email and password.');
    setAuthLoading(true);
    try {
      const r = await axios.post(`${API}/api/login/`, { email: formData.email, password: formData.password });
      const { user, token: tok } = r.data;
      const profile = {
        ...user,
        full_name: user.fullName || user.full_name || '',
        business_name: user.bizName || user.business_name || '',
      };
      localStorage.setItem('token', tok);
      localStorage.setItem('role', user.role);
      localStorage.setItem('profile', JSON.stringify(profile));
      setUserProfile(profile);
      setRole(user.role);
      showView(user.role === 'business' ? 'business-dash' : 'customer-home');
    } catch (e) {
      showToast(e.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.email || !formData.password || !formData.fullName) return showToast('Please fill all required fields.');
    if (formData.password.length < 8) return showToast('Password must be at least 8 characters.');
    setAuthLoading(true);
    try {
      await axios.post(`${API}/api/signup/`, {
        email: formData.email, password: formData.password, fullName: formData.fullName,
        role, bizName: formData.bizName, bizCat: formData.bizCat,
        location: formData.location, sellerType: formData.sellerType, newsletter: formData.newsletter
      });
      showToast('Account created! Please log in.');
      showView('login');
    } catch (e) {
      showToast(e.response?.data?.error || 'Signup failed. Try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserProfile(null);
    setPosts([]);
    setRecentProducts([]);
    setChatList([]);
    setNotifications([]);
    setStores([]);
    showView('landing');
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) return showToast('Fill both password fields.');
    if (newPassword.length < 8) return showToast('New password must be at least 8 characters.');
    try {
      await axios.post(`${API}/api/change-password/`, { old_password: oldPassword, new_password: newPassword }, authH());
      showToast('Password updated successfully!');
      setOldPassword(''); setNewPassword('');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to update password.');
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  PRODUCTS
  // ══════════════════════════════════════════════════════════════════════

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedMedia(p => [...p, ...files]);
    setMediaPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeMedia = (i) => {
    setSelectedMedia(p => p.filter((_,x) => x !== i));
    setMediaPreviews(p => p.filter((_,x) => x !== i));
  };

  const handleAddProduct = async () => {
    if (!productData.name || !productData.price) return showToast('Product name and price are required.');
    setProductLoading(true);
    try {
      await axios.post(`${API}/api/my-products/`, {
        name: productData.name,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock || 0),
        category: productData.category,
        description: productData.description,
      }, authH());
      showToast('Product listed! 🚀');
      setProductData({ name:'', price:'', stock:'', category:'Electronics', description:'' });
      setSelectedMedia([]); setMediaPreviews([]);
      fetchDashboard();
      showView('biz-inventory');
    } catch (e) {
      showToast(e.response?.data ? JSON.stringify(e.response.data) : 'Error listing product.');
    } finally {
      setProductLoading(false);
    }
  };

  const handleQuickPost = async () => {
    if (!quickPost.trim()) return showToast('Write something first!');
    showToast('Post published to your feed! 📢');
    setQuickPost('');
  };

  const saveStoreSettings = async () => {
    try {
      const r = await axios.patch(`${API}/api/profile/update/`, {
        business_name: userProfile.business_name,
        business_category: userProfile.business_category,
        tagline: userProfile.tagline,
        description: userProfile.description,
        location_state: userProfile.location_state
      }, authH());
      const updated = { ...userProfile, ...r.data };
      setUserProfile(updated);
      localStorage.setItem('profile', JSON.stringify(updated));
      showToast('Store settings saved!');
    } catch {
      showToast('Could not save settings. Check your connection.');
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  SEARCH / EXPLORE
  // ══════════════════════════════════════════════════════════════════════

  const handleMultiSearch = useCallback(async () => {
    const params = new URLSearchParams();
    if (searchMode === 'product' && searchData.product) params.set('product', searchData.product);
    if (searchMode === 'business' && searchData.name) params.set('name', searchData.name);
    if (searchMode === 'location' && searchData.location) params.set('location', searchData.location);
    if (searchMode !== 'location' && searchData.location) params.set('location', searchData.location);
    if (userLocation) { params.set('lat', userLocation.lat); params.set('lng', userLocation.lng); }

    setSearchLoading(true);
    try {
      const r = await axios.get(`${API}/api/discover/?${params}`);
      setStores(Array.isArray(r.data) ? r.data : []);
    } catch {
      // Fallback demo data so the UI never shows broken
      setStores([
        { id:1, business_name:'Lagos Tech Hub', business_category:'Electronics', location_state:'Lagos', tagline:'Best gadgets in town', distance_km:1.4, matched_products:[{name:'iPhone 14',price:'350000'}] },
        { id:2, business_name:'Kemi Fashion Closet', business_category:'Fashion', location_state:'Lagos', tagline:'Affordable luxury wear', distance_km:2.8, matched_products:[] },
        { id:3, business_name:'Mama Nkechi Groceries', business_category:'Food & Groceries', location_state:'Enugu', tagline:'Fresh daily from the farm', distance_km:4.1, matched_products:[{name:'Rice (50kg)',price:'65000'}] },
      ]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchMode, searchData, userLocation]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return showToast("Location not supported on this browser.");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const geo = await res.json();
        const label = geo.address?.state || geo.address?.city || 'Your Location';
        setUserLocation({ lat: latitude, lng: longitude, label });
        setSearchData(d => ({ ...d, location: label }));
        showToast(`📍 Location set to ${label}`);
      } catch {
        setUserLocation({ lat: latitude, lng: longitude, label: 'Your Location' });
      }
      setIsLocating(false);
    }, () => {
      setIsLocating(false);
      showToast("Could not get location. Select manually.");
    }, { timeout: 8000 });
  };

  // ══════════════════════════════════════════════════════════════════════
  //  CHAT
  // ══════════════════════════════════════════════════════════════════════

  const openChat = async (contact) => {
    setActiveChat({
      id: contact.id,
      name: contact.name || contact.business_name || 'Unknown',
      initials: (contact.name || contact.business_name || 'U')[0].toUpperCase()
    });
    showView('chat-open');
    try {
      const r = await axios.get(`${API}/api/messages/`, { ...authH(), params: { contact: contact.id } });
      setMessages(Array.isArray(r.data) ? r.data : []);
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const optimistic = { id: Date.now(), sender: userProfile?.id, content: chatInput, timestamp: new Date().toISOString() };
    setMessages(m => [...m, optimistic]);
    const text = chatInput;
    setChatInput('');
    try {
      await axios.post(`${API}/api/messages/`, { receiver: activeChat.id, content: text }, authH());
    } catch {
      showToast('Message failed to send.');
      setMessages(m => m.filter(msg => msg.id !== optimistic.id));
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  AI
  // ══════════════════════════════════════════════════════════════════════

  const askAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse('Thinking… 🤔');
    try {
      const r = await axios.post(`${API}/api/ai-advisor/`, { query: aiQuery });
      setAiResponse(r.data.reply);
    } catch {
      setAiResponse("Can't reach the advisor right now. Try again!");
    } finally {
      setAiLoading(false);
    }
  };

  const askBot = async () => {
    if (!botInput.trim()) return;
    const q = botInput;
    setBotMessages(m => [...m, { sender:'user', text: q }]);
    setBotInput('');
    setBotLoading(true);
    try {
      const r = await axios.post(`${API}/api/ai-advisor/`, { query: q });
      setBotMessages(m => [...m, { sender:'bot', text: r.data.reply }]);
    } catch {
      setBotMessages(m => [...m, { sender:'bot', text: "Sorry, I'm offline right now. Try again shortly!" }]);
    } finally {
      setBotLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  NEWSLETTER
  // ══════════════════════════════════════════════════════════════════════

  const sendCampaign = async () => {
    if (!campaignText.trim()) return showToast('Write a message first.');
    try {
      const r = await axios.post(`${API}/api/newsletter/send/`, { message: campaignText }, authH());
      showToast(`Broadcast sent to ${r.data.recipient_count ?? subscribers.length} subscribers!`);
      setCampaignText('');
    } catch {
      showToast('Could not send campaign. Check connection.');
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  FOLLOW
  // ══════════════════════════════════════════════════════════════════════

  const handleFollow = async (bizId, bizName) => {
    try {
      const r = await axios.post(`${API}/api/follow/${bizId}/`, {}, authH());
      showToast(`${r.data.action === 'followed' ? '❤️ Following' : 'Unfollowed'} ${bizName}`);
    } catch {
      showToast('Follow failed. Try again.');
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  FILTERED POSTS
  // ══════════════════════════════════════════════════════════════════════

  const filteredPosts = activeCatFilter === 'All'
    ? posts
    : posts.filter(p => (p.business_category || p.category || '').toLowerCase().includes(activeCatFilter.toLowerCase()));

  // ══════════════════════════════════════════════════════════════════════
  //  SHARED UI COMPONENTS
  // ══════════════════════════════════════════════════════════════════════

  // Business sidebar (desktop)
  const BizSidebar = ({ active }) => (
    <aside className="biz-sidebar">
      <div className="logo sm">El<span>Mart</span></div>
      <div className="biz-welcome">
        <div className="biz-welcome-text">Welcome back,</div>
        <div className="biz-ceo">{userProfile?.full_name || userProfile?.fullName || userProfile?.username || 'CEO'} 👑</div>
        <div className="biz-name-disp">{userProfile?.business_name || 'El-Mart Merchant'}</div>
      </div>
      <nav className="biz-nav">
        {[
          { id:'business-dash',  icon:'📊', label:'Dashboard' },
          { id:'biz-store',      icon:'🏪', label:'My Store' },
          { id:'biz-products',   icon:'📦', label:'Add Product' },
          { id:'biz-inventory',  icon:'🗂',  label:'Inventory' },
          { id:'social-feed',    icon:'📱', label:'Market Feed' },
          { id:'chat',           icon:'💬', label:'Chats' },
          { id:'newsletter',     icon:'📧', label:'Newsletter' },
          { id:'settings',       icon:'⚙️', label:'Settings' },
        ].map(b => (
          <button key={b.id} className={`biz-nav-btn ${active === b.id ? 'active' : ''}`} onClick={() => showView(b.id)}>
            <span className="nav-icon">{b.icon}</span> {b.label}
          </button>
        ))}
      </nav>
      <button className="btn-ghost sm logout-btn" onClick={handleLogout}>← Log Out</button>
    </aside>
  );

  // Business bottom nav (mobile)
  const BizBottomNav = ({ active }) => (
    <nav className="bottom-nav biz-bottom">
      {[
        { id:'business-dash', icon:'📊', label:'Dash' },
        { id:'biz-inventory', icon:'📦', label:'Products' },
        { id:'social-feed',   icon:'📱', label:'Feed' },
        { id:'chat',          icon:'💬', label:'Chat' },
        { id:'biz-store',     icon:'🏪', label:'Store' },
      ].map(b => (
        <button key={b.id} className={`bnav-btn ${active === b.id ? 'active' : ''}`} onClick={() => showView(b.id)}>
          {b.icon}<span>{b.label}</span>
        </button>
      ))}
    </nav>
  );

  // Mobile drawer for business
  const BizDrawer = () => (
    <div className={`biz-drawer ${isMenuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
      <div className="drawer-content">
        <div className="drawer-header">
          <div className="drawer-biz-info">
            <div className="avatar-big">{avatarLetter}</div>
            <div className="biz-text-meta">
              <div className="drawer-ceo-label">{userProfile?.full_name || userProfile?.fullName || 'Owner'} 👑</div>
              <div className="drawer-biz-name">{userProfile?.business_name || 'Your Store'}</div>
            </div>
          </div>
          <button className="close-drawer" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <nav className="drawer-nav">
          {[
            { id:'business-dash', label:'📊 Dashboard' },
            { id:'biz-store',     label:'🏪 My Store' },
            { id:'biz-products',  label:'📦 Add Product' },
            { id:'biz-inventory', label:'🗂 Inventory' },
            { id:'social-feed',   label:'📱 Market Feed' },
            { id:'chat',          label:'💬 Chats' },
            { id:'newsletter',    label:'📧 Newsletter' },
            { id:'settings',      label:'⚙️ Settings' },
          ].map(b => (
            <button key={b.id} onClick={() => { showView(b.id); setIsMenuOpen(false); }}>{b.label}</button>
          ))}
          <hr style={{ margin:'10px 0', border:'none', borderTop:'1px solid #eee' }} />
          <button className="logout-btn-drawer" onClick={handleLogout}>← Log Out</button>
        </nav>
      </div>
      <div className="drawer-overlay" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════

  return (
    <>
      {/* ── GLOBAL TOAST ───────────────────────────────────────────── */}
      <div className={`toast ${toast.show ? 'show' : ''}`} role="status" aria-live="polite">{toast.msg}</div>

      <div id="app">

        {/* ═══════════════════════════════════════════════════════════
            LANDING
        ═══════════════════════════════════════════════════════════ */}
        {view === 'landing' && (
          <div className="view active">
            <nav className="nav-bar">
              <div className="logo">El<span>Mart</span></div>
              <div className="nav-links">
                <button className="btn-ghost" onClick={() => showView('login')}>Log In</button>
                <button className="btn-primary" onClick={() => showView('signup')}>Join Free</button>
              </div>
            </nav>

            <section className="hero">
              <div className="hero-badge">🌍 Nigeria's Digital Market Square</div>
              <h1 className="hero-title">Every Business<br /><span className="accent">One Market</span></h1>
              <p className="hero-sub">From Alaba market to Abuja CBD — El-Mart gives every seller a world-class digital storefront. Connect, trade, and grow.</p>
              <div className="hero-ctas">
                <button className="btn-primary big" onClick={() => { setRole('business'); showView('signup'); }}>🏪 Open Your Store</button>
                <button className="btn-outline big" onClick={() => { setRole('customer'); showView('signup'); }}>🛒 Shop Now</button>
              </div>
              <div className="hero-stats">
                <div className="stat"><span className="stat-num">12,000+</span><span>Businesses</span></div>
                <div className="stat"><span className="stat-num">4M+</span><span>Products</span></div>
                <div className="stat"><span className="stat-num">36</span><span>States</span></div>
              </div>
            </section>

            <section className="features-strip">
              {[
                { icon:'🏪', h:'Your Own Store', p:'Personalized storefront with logo, colors, and branding.' },
                { icon:'💬', h:'Live Chat',       p:'Chat with buyers and businesses in real time.' },
                { icon:'🤖', h:'AI Advisor',      p:'Get price comparisons and smart buying advice.' },
                { icon:'📧', h:'Newsletters',     p:'Blast updates to connected customers about new arrivals.' },
                { icon:'📍', h:'Near Me Search',  p:'Customers can find your business by location or product.' },
                { icon:'🤝', h:'Retail & Wholesale', p:'Set different pricing tiers for retailers and wholesalers.' },
              ].map(f => (
                <div className="feat" key={f.h}>
                  <div className="feat-icon">{f.icon}</div>
                  <h3>{f.h}</h3><p>{f.p}</p>
                </div>
              ))}
            </section>

            <footer className="landing-footer">
              <div className="logo">El<span>Mart</span></div>
              <p style={{ marginTop: 6 }}>© 2026 El-Mart · Bridging the digital divide, one store at a time.</p>
            </footer>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SIGNUP
        ═══════════════════════════════════════════════════════════ */}
        {view === 'signup' && (
          <div className="view active">
            <div className="auth-page">
              <button className="back-btn" onClick={() => showView('landing')}>← Back</button>
              <div className="auth-box">
                <div className="logo center">El<span>Mart</span></div>
                <h2>Create Account</h2>
                <p className="auth-sub">Choose how you'll use El-Mart</p>

                <div className="role-tabs">
                  <button className={`role-tab ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>🛒 Customer</button>
                  <button className={`role-tab ${role === 'business' ? 'active' : ''}`} onClick={() => setRole('business')}>🏪 Business Owner</button>
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="e.g. Adaeze Okonkwo" />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" />
                </div>
                <div className="form-group" style={{ position:'relative' }}>
                  <label>Password *</label>
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Min. 8 characters" style={{ paddingRight:44 }} />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(p => !p)} aria-label="Toggle password">{showPassword ? '🙈' : '👁️'}</button>
                </div>

                {role === 'business' && <>
                  <div className="form-group">
                    <label>Business Name</label>
                    <input type="text" value={formData.bizName} onChange={e => setFormData({...formData, bizName: e.target.value})} placeholder="e.g. Okonkwo Electronics Ltd" />
                  </div>
                  <div className="form-group">
                    <label>Business Category</label>
                    <select value={formData.bizCat} onChange={e => setFormData({...formData, bizCat: e.target.value})}>
                      <option value="">Select category</option>
                      {['Electronics & Gadgets','Fashion & Apparel','Food & Groceries','Health & Beauty','Agriculture & Farm Produce','Home & Office','Automobile','Real Estate','Services'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Seller Type</label>
                    <div className="radio-group">
                      <label className="radio-opt"><input type="radio" value="retail" checked={formData.sellerType==='retail'} onChange={e => setFormData({...formData, sellerType: e.target.value})} /> Retailer</label>
                      <label className="radio-opt"><input type="radio" value="wholesale" checked={formData.sellerType==='wholesale'} onChange={e => setFormData({...formData, sellerType: e.target.value})} /> Wholesaler</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Business State</label>
                    <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                      <option value="">Select State</option>
                      {NG_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </>}

                <div className="form-check">
                  <input type="checkbox" id="news-consent" checked={formData.newsletter} onChange={e => setFormData({...formData, newsletter: e.target.checked})} />
                  <label htmlFor="news-consent">I agree to receive email newsletters</label>
                </div>

                <button className="btn-primary full" onClick={handleSignup} disabled={authLoading}>
                  {authLoading ? <Spinner size={16} /> : 'Create Account →'}
                </button>
                <p className="auth-switch">Already have an account? <a href="#" onClick={e => { e.preventDefault(); showView('login'); }}>Log In</a></p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            LOGIN
        ═══════════════════════════════════════════════════════════ */}
        {view === 'login' && (
          <div className="view active">
            <div className="auth-page">
              <button className="back-btn" onClick={() => showView('landing')}>← Back</button>
              <div className="auth-box">
                <div className="logo center">El<span>Mart</span></div>
                <h2>Welcome Back</h2>
                <p className="auth-sub">Sign in to your El-Mart account</p>

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <div className="form-group" style={{ position:'relative' }}>
                  <label>Password</label>
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Your password" style={{ paddingRight:44 }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(p => !p)} aria-label="Toggle password">{showPassword ? '🙈' : '👁️'}</button>
                </div>

                <button className="btn-primary full" onClick={handleLogin} disabled={authLoading}>
                  {authLoading ? <Spinner size={16} /> : 'Log In →'}
                </button>

                <div className="login-demos">
                  <p>Try a demo:</p>
                  <button className="demo-btn" onClick={() => {
                    const p = { id:99, full_name:'Demo Customer', username:'demo_customer', role:'customer' };
                    setRole('customer'); setUserProfile(p);
                    localStorage.setItem('token','demo_token_customer');
                    localStorage.setItem('role','customer');
                    localStorage.setItem('profile', JSON.stringify(p));
                    showView('customer-home');
                  }}>
                    🛒 Demo Customer
                  </button>
                  <button className="demo-btn" onClick={() => {
                    const p = { id:100, full_name:'Demo CEO', username:'democeo', business_name:'Demo Store', business_category:'Electronics', tagline:'Best store in town', location_state:'Lagos', role:'business' };
                    setRole('business'); setUserProfile(p);
                    localStorage.setItem('token','demo_token_business');
                    localStorage.setItem('role','business');
                    localStorage.setItem('profile', JSON.stringify(p));
                    showView('business-dash');
                  }}>
                    🏪 Demo Business
                  </button>
                </div>
                <p className="auth-switch">New here? <a href="#" onClick={e => { e.preventDefault(); showView('signup'); }}>Create an account</a></p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            BUSINESS DASHBOARD
        ═══════════════════════════════════════════════════════════ */}
        {view === 'business-dash' && userProfile && (
          <div className="view active">
            <BizDrawer />
            <div className="biz-shell">
              <BizSidebar active="business-dash" />
              <main className="biz-main">
                <div className="biz-topbar">
                  <div>
                    <div className="biz-page-title">Dashboard Overview</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>
                      Good to see you, {userProfile?.full_name?.split(' ')[0] || userProfile?.fullName?.split(' ')[0] || 'CEO'} 👋
                    </div>
                  </div>
                  <div className="biz-topbar-right">
                    <button className="btn-primary sm" onClick={() => showView('biz-products')}>+ Add Product</button>
                    <div className="avatar" onClick={() => setIsMenuOpen(true)} title="Open menu" role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setIsMenuOpen(true)}>{avatarLetter}</div>
                  </div>
                </div>

                {dashLoading ? (
                  <div className="dash-loading"><Spinner size={32} /></div>
                ) : (
                  <>
                    <div className="biz-stats-row">
                      {[
                        { icon:'📦', val: stats.productCount, lbl:'Products Listed' },
                        { icon:'👁',  val: stats.viewCount || 0, lbl:'Store Views' },
                        { icon:'💬', val: stats.messageCount || 0, lbl:'Messages' },
                        { icon:'❤️', val: stats.followerCount || 0, lbl:'Followers' },
                      ].map(s => (
                        <div className="biz-stat-card" key={s.lbl}>
                          <div className="bstat-icon">{s.icon}</div>
                          <div className="bstat-val">{s.val}</div>
                          <div className="bstat-lbl">{s.lbl}</div>
                        </div>
                      ))}
                    </div>

                    <div className="biz-dash-grid">
                      {/* Quick Post */}
                      <div className="biz-dash-card">
                        <div className="biz-dash-card-title">📢 Quick Post</div>
                        <textarea
                          rows="3"
                          placeholder={`What's new at ${userProfile?.business_name || 'the store'}? Share a product update…`}
                          value={quickPost}
                          onChange={e => setQuickPost(e.target.value)}
                        />
                        <div className="post-actions-row">
                          <button className="icon-btn" title="Add Image" onClick={() => showToast('Image upload coming soon!')}>🖼</button>
                          <button className="icon-btn" title="Add Video" onClick={() => showToast('Video upload coming soon!')}>🎬</button>
                          <button className="btn-primary sm" onClick={handleQuickPost}>Post Now</button>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="biz-dash-card">
                        <div className="biz-dash-card-title">🔔 Recent Activity</div>
                        <div className="activity-list">
                          {recentProducts.length > 0 ? recentProducts.slice(0,4).map(p => (
                            <div className="activity-item" key={p.id}>
                              <span className="act-icon">📦</span>
                              <span>Listed <b>{p.name}</b> — ₦{Number(p.price).toLocaleString()}</span>
                              <span className="act-time">Recent</span>
                            </div>
                          )) : (
                            <div style={{ color:'var(--text-muted)', fontSize:'0.83rem', textAlign:'center', padding:'20px 0' }}>
                              No activity yet.<br />
                              <button className="btn-primary sm" style={{ marginTop:10 }} onClick={() => showView('biz-products')}>List your first product →</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Inventory Snapshot */}
                      <div className="biz-dash-card full">
                        <div className="biz-dash-card-title" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span>📦 Inventory Snapshot</span>
                          <button className="btn-ghost xs" onClick={() => showView('biz-inventory')}>View All</button>
                        </div>
                        {recentProducts.length > 0 ? (
                          <div className="low-stock-list">
                            {recentProducts.slice(0,5).map(p => (
                              <div className="low-stock-item" key={p.id}>
                                <span><b>{p.name}</b></span>
                                <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>₦{Number(p.price).toLocaleString()}</span>
                                <span className={`stock-count ${p.stock <= 0 ? 'danger' : p.stock < 5 ? 'warn' : 'good'}`}>
                                  {p.stock <= 0 ? 'Out of stock' : `${p.stock} in stock`}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color:'var(--text-muted)', fontSize:'0.83rem', textAlign:'center', padding:'20px 0' }}>No products yet.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <BizBottomNav active="business-dash" />
              </main>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            BIZ: ADD PRODUCT
        ═══════════════════════════════════════════════════════════ */}
        {view === 'biz-products' && userProfile && (
          <div className="view active">
            <BizDrawer />
            <div className="biz-shell">
              <BizSidebar active="biz-products" />
              <main className="biz-main">
                <div className="biz-topbar">
                  <div className="biz-page-title">➕ Add New Product</div>
                  <div className="biz-topbar-right">
                    <button className="btn-ghost sm" onClick={() => showView('biz-inventory')}>View Inventory</button>
                    <div className="avatar" onClick={() => setIsMenuOpen(true)} role="button" tabIndex={0}>{avatarLetter}</div>
                  </div>
                </div>

                <div className="biz-dash-card" style={{ maxWidth:680, margin:'24px auto' }}>
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" value={productData.name} onChange={e => setProductData({...productData, name: e.target.value})} placeholder="e.g. Samsung Galaxy A55" />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Price (₦) *</label>
                      <input type="number" value={productData.price} onChange={e => setProductData({...productData, price: e.target.value})} placeholder="0.00" min="0" />
                    </div>
                    <div className="form-group">
                      <label>Stock Quantity</label>
                      <input type="number" value={productData.stock} onChange={e => setProductData({...productData, stock: e.target.value})} placeholder="1" min="0" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select value={productData.category} onChange={e => setProductData({...productData, category: e.target.value})}>
                      {['Electronics','Fashion','Food & Groceries','Health & Beauty','Home & Office','Agriculture','Automobile','Services','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="3" value={productData.description} onChange={e => setProductData({...productData, description: e.target.value})} placeholder="Tell customers about this product — condition, specs, why they should buy…" />
                  </div>

                  <div className="form-group">
                    <label>Product Photos / Video</label>
                    <div className="media-upload-zone" onClick={() => document.getElementById('media-input').click()} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && document.getElementById('media-input').click()}>
                      <div className="upload-icon">📸</div>
                      <p>Click to upload images or video</p>
                      <input type="file" id="media-input" hidden multiple accept="image/*,video/*" onChange={handleMediaChange} />
                    </div>
                    {mediaPreviews.length > 0 && (
                      <div className="media-preview-grid">
                        {mediaPreviews.map((url, i) => (
                          <div className="preview-card" key={i}>
                            <img src={url} alt={`preview ${i+1}`} />
                            <button type="button" className="remove-btn" onClick={() => removeMedia(i)} aria-label="Remove image">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="btn-primary full" onClick={handleAddProduct} disabled={productLoading}>
                    {productLoading ? <Spinner size={16} /> : '🚀 List Product'}
                  </button>
                </div>

                <BizBottomNav active="biz-products" />
              </main>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            BIZ: INVENTORY
        ═══════════════════════════════════════════════════════════ */}
        {view === 'biz-inventory' && userProfile && (
          <div className="view active">
            <BizDrawer />
            <div className="biz-shell">
              <BizSidebar active="biz-inventory" />
              <main className="biz-main">
                <div className="biz-topbar">
                  <div className="biz-page-title">🗂 Products & Inventory</div>
                  <div className="biz-topbar-right">
                    <button className="btn-primary sm" onClick={() => showView('biz-products')}>+ Add Product</button>
                    <div className="avatar" onClick={() => setIsMenuOpen(true)} role="button" tabIndex={0}>{avatarLetter}</div>
                  </div>
                </div>

                <div className="products-table-wrap">
                  {dashLoading ? (
                    <div className="dash-loading"><Spinner size={32} /></div>
                  ) : recentProducts.length > 0 ? (
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentProducts.map(p => (
                          <tr key={p.id}>
                            <td className="prod-name-cell">{p.name}</td>
                            <td className="prod-price-cell">₦{Number(p.price).toLocaleString()}</td>
                            <td>{p.stock}</td>
                            <td>
                              <span className={`stock-count ${p.stock <= 0 ? 'danger' : p.stock < 5 ? 'warn' : 'good'}`}>
                                {p.stock <= 0 ? 'Out of stock' : p.stock < 5 ? 'Low stock' : 'In stock'}
                              </span>
                            </td>
                            <td>
                              <button className="btn-ghost xs" onClick={() => showToast('Edit coming soon!')}>Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
                      <div style={{ fontSize:'3rem', marginBottom:12 }}>📦</div>
                      <p style={{ fontWeight:600, marginBottom:6 }}>No products listed yet</p>
                      <button className="btn-primary sm" style={{ marginTop:10 }} onClick={() => showView('biz-products')}>+ Add Your First Product</button>
                    </div>
                  )}
                </div>

                <BizBottomNav active="biz-inventory" />
              </main>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            BIZ: MY STORE EDITOR
        ═══════════════════════════════════════════════════════════ */}
        {view === 'biz-store' && userProfile && (
          <div className="view active">
            <BizDrawer />
            <div className="biz-shell">
              <BizSidebar active="biz-store" />
              <main className="biz-main">
                <div className="biz-topbar">
                  <div className="biz-page-title">🏪 Store Customiser</div>
                  <div className="biz-topbar-right">
                    <button className="btn-ghost sm" onClick={() => { setViewingStore(userProfile); showView('view-store'); }}>👁 Preview</button>
                    <button className="btn-primary sm" onClick={saveStoreSettings}>Save</button>
                    <div className="avatar" onClick={() => setIsMenuOpen(true)} role="button" tabIndex={0}>{avatarLetter}</div>
                  </div>
                </div>

                <div className="store-editor-grid">
                  <div className="editor-panel">
                    <h3>Branding</h3>
                    <div className="form-group">
                      <label>Store Name</label>
                      <input type="text" value={userProfile.business_name || ''} onChange={e => setUserProfile({...userProfile, business_name: e.target.value})} placeholder="Your store name" />
                    </div>
                    <div className="form-group">
                      <label>Tagline</label>
                      <input type="text" value={userProfile.tagline || ''} onChange={e => setUserProfile({...userProfile, tagline: e.target.value})} placeholder="e.g. Your Tech Partner in Lagos" />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select value={userProfile.business_category || ''} onChange={e => setUserProfile({...userProfile, business_category: e.target.value})}>
                        {['Electronics & Gadgets','Fashion & Apparel','Food & Groceries','Health & Beauty','Agriculture & Farm Produce','Home & Office','Automobile','Services'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>State / Location</label>
                      <select value={userProfile.location_state || ''} onChange={e => setUserProfile({...userProfile, location_state: e.target.value})}>
                        <option value="">Select State</option>
                        {NG_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <h3>Store Info</h3>
                    <div className="form-group">
                      <label>About Your Store</label>
                      <textarea rows="4" value={userProfile.description || ''} onChange={e => setUserProfile({...userProfile, description: e.target.value})} placeholder="Tell customers why they should shop with you…" />
                    </div>
                    <button className="btn-primary full" onClick={saveStoreSettings}>Save Store Settings</button>
                  </div>

                  {/* Live preview */}
                  <div className="preview-panel">
                    <h3>Live Preview</h3>
                    <div className="store-preview-frame">
                      <div className="sp-header">
                        <div className="sp-logo-circle">{(userProfile.business_name || 'B')[0].toUpperCase()}</div>
                        <div>
                          <div className="sp-name">{userProfile.business_name || 'Your Store'}</div>
                          <div className="sp-tagline">{userProfile.tagline || 'Your tagline here'}</div>
                        </div>
                      </div>
                      <div className="sp-about">{userProfile.description || 'Your store description will appear here.'}</div>
                      <div className="sp-actions">
                        <button className="sp-btn" style={{ background:'var(--orange)', color:'white', border:'none' }}>💬 Chat</button>
                        <button className="sp-btn" style={{ background:'var(--navy)', color:'white', border:'none' }}>📞 Call</button>
                        <button className="sp-btn outline">❤️ Follow</button>
                      </div>
                    </div>
                  </div>
                </div>

                <BizBottomNav active="biz-store" />
              </main>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SETTINGS
        ═══════════════════════════════════════════════════════════ */}
        {view === 'settings' && userProfile && (
          <div className="view active">
            <BizDrawer />
            <div className="biz-shell">
              <BizSidebar active="settings" />
              <main className="biz-main">
                <div className="biz-topbar">
                  <div className="biz-page-title">⚙️ Settings</div>
                  <div className="biz-topbar-right">
                    <div className="avatar" onClick={() => setIsMenuOpen(true)} role="button" tabIndex={0}>{avatarLetter}</div>
                  </div>
                </div>

                <div className="settings-container">
                  <div className="settings-layout">
                    <nav className="settings-tabs">
                      {[['branding','🏪 Branding'],['security','🔐 Security'],['ops','⚙️ Operations'],['finance','💰 Finance']].map(([k,l]) => (
                        <button key={k} className={activeSettingTab === k ? 'active' : ''} onClick={() => setActiveSettingTab(k)}>{l}</button>
                      ))}
                    </nav>
                    <div className="settings-content">
                      {activeSettingTab === 'branding' && (
                        <div className="settings-pane">
                          <h3>Public Branding</h3>
                          <div className="form-group"><label>Business Name</label><input type="text" value={userProfile.business_name || ''} onChange={e => setUserProfile({...userProfile, business_name: e.target.value})} /></div>
                          <div className="form-group"><label>Tagline</label><input type="text" value={userProfile.tagline || ''} onChange={e => setUserProfile({...userProfile, tagline: e.target.value})} /></div>
                          <div className="form-group"><label>About</label><textarea rows="3" value={userProfile.description || ''} onChange={e => setUserProfile({...userProfile, description: e.target.value})} /></div>
                          <button className="btn-primary" onClick={saveStoreSettings}>Save Branding</button>
                        </div>
                      )}
                      {activeSettingTab === 'security' && (
                        <div className="settings-pane">
                          <h3>Account Security</h3>
                          <div className="form-group"><label>Current Password</label><input type="password" placeholder="••••••••" value={oldPassword} onChange={e => setOldPassword(e.target.value)} /></div>
                          <div className="form-group"><label>New Password</label><input type="password" placeholder="Min 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                          <button className="btn-primary" onClick={handleUpdatePassword}>Update Password</button>
                        </div>
                      )}
                      {activeSettingTab === 'ops' && (
                        <div className="settings-pane">
                          <h3>Operations</h3>
                          <div className="form-check" style={{ marginBottom:14 }}>
                            <input type="checkbox" id="chatbot-toggle" defaultChecked />
                            <label htmlFor="chatbot-toggle">Enable AI chatbot auto-replies when offline</label>
                          </div>
                          <div className="form-check">
                            <input type="checkbox" id="notif-toggle" defaultChecked />
                            <label htmlFor="notif-toggle">Enable order & message notifications</label>
                          </div>
                          <button className="btn-primary" style={{ marginTop:20 }} onClick={() => showToast('Operations settings saved!')}>Save</button>
                        </div>
                      )}
                      {activeSettingTab === 'finance' && (
                        <div className="settings-pane">
                          <h3>Finance & Payouts</h3>
                          <div className="form-group"><label>Bank Name</label><input type="text" placeholder="e.g. First Bank Nigeria" /></div>
                          <div className="form-group"><label>Account Number</label><input type="text" placeholder="10-digit account number" /></div>
                          <div className="form-group"><label>Account Name</label><input type="text" placeholder="Account holder name" /></div>
                          <button className="btn-primary" onClick={() => showToast('Bank details saved!')}>Save Payout Details</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <BizBottomNav active="settings" />
              </main>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            NEWSLETTER
        ═══════════════════════════════════════════════════════════ */}
        {view === 'newsletter' && userProfile && (
          <div className="view active">
            <BizDrawer />
            <div className="biz-shell">
              <BizSidebar active="newsletter" />
              <main className="biz-main">
                <div className="biz-topbar">
                  <div className="biz-page-title">📧 Newsletter</div>
                  <div className="biz-topbar-right">
                    <div className="avatar" onClick={() => setIsMenuOpen(true)} role="button" tabIndex={0}>{avatarLetter}</div>
                  </div>
                </div>

                <div className="newsletter-stats">
                  <div className="stat-card">
                    <span className="stat-label">Total Subscribers</span>
                    <span className="stat-value">{subscribers.length}</span>
                  </div>
                  <div className="stat-card" style={{ background:'linear-gradient(135deg, var(--navy), #1a3a5c)' }}>
                    <span className="stat-label" style={{ color:'rgba(255,255,255,0.7)' }}>Active</span>
                    <span className="stat-value" style={{ color:'white' }}>{subscribers.filter(s => s.is_active !== false).length}</span>
                  </div>
                </div>

                <div className="subscriber-list">
                  <h4>Subscriber List</h4>
                  {subscribers.length > 0 ? (
                    <div className="table-responsive">
                      <table className="biz-table">
                        <thead><tr><th>Email</th><th>Subscribed</th><th>Status</th></tr></thead>
                        <tbody>
                          {subscribers.map(s => (
                            <tr key={s.id}>
                              <td>{s.email}</td>
                              <td>{s.date ? new Date(s.date).toLocaleDateString('en-NG') : 'N/A'}</td>
                              <td><span className="stock-count good">Active</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="empty-text">No subscribers yet. Share your store link to get customers to subscribe!</p>
                  )}
                </div>

                <div className="campaign-box">
                  <h4>📣 Send a Broadcast</h4>
                  <textarea rows="5" value={campaignText} onChange={e => setCampaignText(e.target.value)} placeholder="Write your update — new arrivals, special offers, announcements…" />
                  <button className="btn-primary" onClick={sendCampaign} style={{ marginTop:12 }}>
                    📨 Send to {subscribers.length} Subscribers
                  </button>
                </div>

                <BizBottomNav active="newsletter" />
              </main>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            VIEW STORE (Public preview)
        ═══════════════════════════════════════════════════════════ */}
        {view === 'view-store' && (
          <div className="view active" style={{ minHeight:'100vh', background:'var(--bg)', paddingBottom:80 }}>
            {/* Determine which store to show: a discovered store or own profile */}
            {(() => {
              const storeData = viewingStore || userProfile;
              const storeName = storeData?.business_name || 'Business Store';
              const storeCat  = storeData?.business_category || 'General';
              const stateLoc  = storeData?.location_state || 'Nigeria';
              const storeDesc = storeData?.description || '';
              const storeTag  = storeData?.tagline || '';
              const storeProducts = viewingStore?.matched_products || recentProducts;

              return (
                <>
                  <div style={{ position:'relative' }}>
                    <div className="store-hero">
                      <div className="store-hero-overlay" />
                      <button className="store-back-btn" onClick={() => {
                        setViewingStore(null);
                        showView(role === 'business' ? 'biz-store' : 'explore');
                      }}>← Back</button>
                      <div className="store-hero-content">
                        <div className="store-logo-big">{storeName[0]?.toUpperCase()}</div>
                        <div>
                          <div className="store-hero-name">{storeName}</div>
                          <div className="store-hero-cat">{storeCat} · {stateLoc}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="store-action-bar">
                    <button className="btn-primary sm" onClick={() => openChat({ id: storeData?.id, name: storeName })}>💬 Chat</button>
                    <button className="btn-ghost sm" onClick={() => storeData?.id && handleFollow(storeData.id, storeName)}>❤️ Follow</button>
                    <button className="btn-ghost sm" onClick={() => {
                      navigator.share?.({ title: storeName, url: window.location.href }) || showToast('Copy the URL to share!');
                    }}>🔗 Share</button>
                  </div>

                  <div className="store-content">
                    {storeTag && <p style={{ fontWeight:700, fontSize:'1rem', color:'var(--navy)', marginBottom:8 }}>"{storeTag}"</p>}
                    {storeDesc && <p className="store-about-text">{storeDesc}</p>}

                    <div className="section-title" style={{ marginBottom:12 }}>📦 Products</div>
                    {storeProducts.length > 0 ? (
                      <div className="store-products-grid">
                        {storeProducts.map((p, i) => (
                          <div className="product-mini-card" key={p.id || i}>
                            <div className="product-mini-img">
                              {p.image ? <img src={`${API}${p.image}`} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '📦'}
                            </div>
                            <div className="product-mini-body">
                              <div className="product-mini-name">{p.name}</div>
                              <div className="product-mini-price">₦{Number(p.price).toLocaleString()}</div>
                              {p.stock !== undefined && (
                                <div className={`product-mini-stock ${p.stock > 0 ? 'in' : 'out'}`}>
                                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'40px 0' }}>
                        No products yet.
                        {role === 'business' && !viewingStore && (
                          <><br /><button className="btn-primary sm" style={{ marginTop:10 }} onClick={() => showView('biz-products')}>Add Products →</button></>
                        )}
                      </p>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SOCIAL FEED  (shared customer-home + social-feed)
        ═══════════════════════════════════════════════════════════ */}
        {(view === 'customer-home' || view === 'social-feed') && (
          <div className="view active">
            <div className="app-shell">
              {/* Header */}
              <header className="app-header">
                <div className="logo sm" style={{ flexShrink:0 }}>El<span>Mart</span></div>

                {/* Smart search */}
                <div className="search-group">
                  <div className="search-mode-tabs">
                    {[['product','📦 Product'],['business','🏪 Business'],['location','📍 Location']].map(([m,l]) => (
                      <button key={m} className={`search-mode-btn ${searchMode === m ? 'active' : ''}`} onClick={() => setSearchMode(m)}>{l}</button>
                    ))}
                  </div>
                  <div className="search-input-row">
                    <div className="search-bar">
                      <input
                        type="text"
                        placeholder={searchMode === 'product' ? 'Search products e.g. Rice, iPhone…' : searchMode === 'business' ? 'Search business name…' : 'Enter state or LGA…'}
                        value={searchMode === 'product' ? searchData.product : searchMode === 'business' ? searchData.name : searchData.location}
                        onChange={e => {
                          if (searchMode === 'product') setSearchData(d => ({...d, product: e.target.value}));
                          else if (searchMode === 'business') setSearchData(d => ({...d, name: e.target.value}));
                          else setSearchData(d => ({...d, location: e.target.value}));
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleMultiSearch()}
                        aria-label="Search"
                      />
                    </div>
                    {searchMode !== 'location' && (
                      <select className="location-select" value={searchData.location} onChange={e => setSearchData(d => ({...d, location: e.target.value}))}>
                        <option value="">🇳🇬 All Nigeria</option>
                        {NG_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    )}
                    <button className="gps-btn" title="Use my location" onClick={handleGetLocation} disabled={isLocating} aria-label="Use my location">
                      {isLocating ? '⏳' : userLocation ? '✅' : '📡'}
                    </button>
                    <button className="search-btn" onClick={() => { showView('explore'); handleMultiSearch(); }} aria-label="Search">🔍</button>
                  </div>
                  {userLocation && (
                    <div className="location-label">
                      📍 Near <strong>{userLocation.label}</strong>
                      <button onClick={() => { setUserLocation(null); setSearchData(d => ({...d, location: ''})); }} className="clear-loc" aria-label="Clear location">✕</button>
                    </div>
                  )}
                </div>

                {/* Header actions */}
                <div className="header-actions">
                  <button className="icon-btn" onClick={() => showView('chat')} title="Messages" aria-label="Messages">
                    💬
                    {chatList.reduce((acc, c) => acc + (c.unread_count || 0), 0) > 0 && (
                      <span className="badge">{chatList.reduce((acc, c) => acc + (c.unread_count || 0), 0)}</span>
                    )}
                  </button>
                  <div className="notification-wrapper" ref={notifRef}>
                    <button className="icon-btn" onClick={() => setIsNotifOpen(p => !p)} title="Notifications" aria-label="Notifications">
                      🔔
                      {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
                    </button>
                    {isNotifOpen && (
                      <div className="notif-dropdown">
                        <h3>Notifications</h3>
                        {notifications.length > 0 ? notifications.map(n => (
                          <div key={n.id} className="notif-item">{n.text}</div>
                        )) : <p style={{ padding:'12px 16px', fontSize:'0.83rem', color:'var(--text-muted)' }}>No new notifications</p>}
                      </div>
                    )}
                  </div>
                  <div className="avatar"
                    onClick={() => role === 'business' ? setIsMenuOpen(true) : showToast('Profile coming soon!')}
                    role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && (role === 'business' ? setIsMenuOpen(true) : showToast('Profile coming soon!'))}
                    title="Profile"
                  >
                    {userProfile?.full_name?.[0]?.toUpperCase() || userProfile?.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
              </header>

              {/* Category filter */}
              <div className="filter-bar" role="tablist">
                {['All','Electronics','Fashion','Food','Health','Agriculture','Home','Services'].map(cat => (
                  <button
                    key={cat}
                    className={`filter-chip ${activeCatFilter === cat ? 'active' : ''}`}
                    onClick={() => setActiveCatFilter(cat)}
                    role="tab"
                    aria-selected={activeCatFilter === cat}
                  >{cat}</button>
                ))}
              </div>

              <div className="main-feed">
                {/* Feed */}
                <div className="feed-left">
                  {feedLoading ? (
                    <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}><Spinner size={32} /></div>
                  ) : filteredPosts.length > 0 ? filteredPosts.map(post => (
                    <div className="post-card" key={post.id}>
                      <div className="post-header">
                        <div className="post-biz-avatar">{(post.business_name || 'B')[0]?.toUpperCase()}</div>
                        <div className="post-biz-info">
                          <div className="post-biz-name">
                            {post.business_name || 'Unknown Business'}
                            {post.is_followed && <span className="following-badge">Following</span>}
                          </div>
                          <div className="post-biz-cat">{post.business_category || 'General'} {post.location_state ? `· ${post.location_state}` : ''}</div>
                        </div>
                        <div className="post-time">{post.timestamp ? new Date(post.timestamp).toLocaleDateString('en-NG', { day:'numeric', month:'short' }) : 'Recent'}</div>
                      </div>
                      {post.image && (
                        <div style={{ margin:'0 14px 10px', borderRadius:8, overflow:'hidden', maxHeight:240 }}>
                          <img src={post.image.startsWith('http') ? post.image : `${API}${post.image}`} alt={post.name} style={{ width:'100%', objectFit:'cover' }} />
                        </div>
                      )}
                      <div className="post-body">{post.name}</div>
                      <div className="post-product-bar">
                        <span className="post-price">₦{Number(post.price).toLocaleString()}</span>
                        <span className={`post-stock ${post.stock > 0 ? 'in' : 'out'}`}>{post.stock > 0 ? `${post.stock} in stock` : 'Out of stock'}</span>
                      </div>
                      <div className="post-actions-bar">
                        <div className="post-action" onClick={() => showToast('❤️ Liked!')} role="button" tabIndex={0}>❤️ Like</div>
                        <div className="post-action" onClick={() => openChat({ id: post.business_id, name: post.business_name })} role="button" tabIndex={0}>💬 Inquire</div>
                        <div className="post-action" onClick={() => handleFollow(post.business_id, post.business_name)} role="button" tabIndex={0}>➕ Follow</div>
                        <div className="post-action" onClick={() => {
                          if (navigator.share) navigator.share({ title: post.name, text: `Check out ${post.name} at ₦${Number(post.price).toLocaleString()}` });
                          else showToast('Copy the URL to share!');
                        }} role="button" tabIndex={0}>🔗 Share</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
                      <div style={{ fontSize:'3rem', marginBottom:12 }}>📭</div>
                      <p style={{ fontWeight:600, marginBottom:6 }}>Feed is empty</p>
                      <p style={{ fontSize:'0.83rem' }}>Use the search above to discover businesses near you!</p>
                      <button className="btn-primary sm" style={{ marginTop:16 }} onClick={() => { showView('explore'); handleMultiSearch(); }}>🔍 Discover Businesses</button>
                    </div>
                  )}
                </div>

                {/* Right sidebar (desktop only) */}
                <div className="feed-right">
                  <div className="section-title">🏪 Nearby Stores</div>
                  {stores.length > 0 ? stores.slice(0,4).map(s => (
                    <div className="store-card" key={s.id} onClick={() => { setViewingStore(s); showView('view-store'); }} role="button" tabIndex={0}>
                      <div className="store-card-avatar">{(s.business_name||'B')[0]}</div>
                      <div className="store-card-info">
                        <div className="store-card-name">{s.business_name}</div>
                        <div className="store-card-meta">{s.business_category} {s.distance_km ? `· ${s.distance_km}km` : ''}</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ color:'var(--text-muted)', fontSize:'0.83rem', padding:'12px 0' }}>
                      <button className="btn-ghost sm full" onClick={() => { showView('explore'); handleMultiSearch(); }}>🔍 Find Nearby Stores</button>
                    </div>
                  )}

                  <div className="section-title" style={{ marginTop:24 }}>🤖 AI Price Advisor</div>
                  <div className="ai-advisor-box">
                    <p style={{ minHeight:40, fontSize:'0.85rem', color:'rgba(255,255,255,0.85)', lineHeight:1.5 }}>
                      {aiLoading ? '⏳ Thinking…' : aiResponse || "Ask me if a price is fair or what to buy!"}
                    </p>
                    <div className="ai-input-row">
                      <input type="text" placeholder="e.g. Is ₦45k fair for iPhone 11?" value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAI()} aria-label="Ask AI advisor" />
                      <button onClick={askAI} disabled={aiLoading}>{aiLoading ? '…' : 'Ask'}</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom nav */}
              {role === 'business' ? <BizBottomNav active="social-feed" /> : (
                <nav className="bottom-nav">
                  <button className={`bnav-btn ${view === 'customer-home' ? 'active' : ''}`} onClick={() => showView('customer-home')}>🏠<span>Home</span></button>
                  <button className={`bnav-btn ${view === 'explore' ? 'active' : ''}`} onClick={() => { setStores([]); showView('explore'); }}>🔍<span>Explore</span></button>
                  <button className={`bnav-btn ${view === 'chat' ? 'active' : ''}`} onClick={() => showView('chat')}>💬<span>Chats</span></button>
                  <button className="bnav-btn" onClick={() => showToast('Profile coming soon!')}>👤<span>Profile</span></button>
                </nav>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            EXPLORE / SEARCH RESULTS
        ═══════════════════════════════════════════════════════════ */}
        {view === 'explore' && (
          <div className="view active">
            <div className="app-shell">
              <header className="explore-header">
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <button className="back-btn sm" onClick={() => showView('customer-home')} aria-label="Back to home">←</button>
                  <span style={{ fontWeight:700, fontSize:'1rem', flex:1 }}>🔍 Search Results</span>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{stores.length} found</span>
                </div>
                {/* Refine bar */}
                <div className="search-input-row">
                  <div className="search-mode-tabs" style={{ marginBottom:0 }}>
                    {[['product','📦'],['business','🏪'],['location','📍']].map(([m,i]) => (
                      <button key={m} className={`search-mode-btn ${searchMode === m ? 'active' : ''}`} onClick={() => setSearchMode(m)} title={m}>{i}</button>
                    ))}
                  </div>
                  <div className="search-bar" style={{ flex:1 }}>
                    <input
                      type="text"
                      placeholder="Refine search…"
                      value={searchMode === 'product' ? searchData.product : searchMode === 'business' ? searchData.name : searchData.location}
                      onChange={e => {
                        if (searchMode === 'product') setSearchData(d => ({...d, product: e.target.value}));
                        else if (searchMode === 'business') setSearchData(d => ({...d, name: e.target.value}));
                        else setSearchData(d => ({...d, location: e.target.value}));
                      }}
                      onKeyDown={e => e.key === 'Enter' && handleMultiSearch()}
                      aria-label="Refine search"
                    />
                  </div>
                  <button className="gps-btn" onClick={handleGetLocation} disabled={isLocating} aria-label="Use my location">{isLocating ? '⏳' : userLocation ? '✅' : '📡'}</button>
                  <button className="search-btn" onClick={handleMultiSearch}>Go</button>
                </div>
                {userLocation && (
                  <div className="location-label" style={{ marginTop:6 }}>
                    📍 Near <strong>{userLocation.label}</strong>
                    <button onClick={() => setUserLocation(null)} className="clear-loc" aria-label="Clear location">✕</button>
                  </div>
                )}
              </header>

              <div className="filter-bar">
                {['All','Electronics','Fashion','Food','Health','Agriculture'].map(cat => (
                  <button key={cat} className={`filter-chip ${(searchMode === 'product' && searchData.product === (cat === 'All' ? '' : cat)) ? 'active' : ''}`} onClick={() => {
                    setSearchData(d => ({...d, product: cat === 'All' ? '' : cat}));
                    setSearchMode('product');
                    setTimeout(handleMultiSearch, 50);
                  }}>{cat}</button>
                ))}
              </div>

              <main style={{ padding:16, overflowY:'auto', flex:1, paddingBottom:80 }}>
                {searchLoading ? (
                  <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner size={32} /></div>
                ) : stores.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:12 }}>🔍</div>
                    <p style={{ fontWeight:600 }}>No results yet</p>
                    <p style={{ fontSize:'0.83rem', marginTop:6 }}>Search by product, business name, or location above.</p>
                  </div>
                ) : (
                  <div className="results-list">
                    {stores.map(store => (
                      <div className="result-card" key={store.id}>
                        <div className="result-avatar">{(store.business_name || 'B')[0].toUpperCase()}</div>
                        <div className="result-info">
                          <div className="result-top">
                            <div className="result-name">{store.business_name}</div>
                            {store.distance_km != null && (
                              <span className="distance-badge">📍 {store.distance_km}km</span>
                            )}
                          </div>
                          <div className="result-meta">{store.business_category || 'General'} · {store.location_state || 'Nigeria'}</div>
                          {store.tagline && <div className="result-tagline">"{store.tagline}"</div>}
                          {store.matched_products?.length > 0 && (
                            <div className="result-products">
                              {store.matched_products.map((p,i) => (
                                <span key={i} className="product-tag">{p.name} — ₦{Number(p.price).toLocaleString()}</span>
                              ))}
                            </div>
                          )}
                          <div className="result-actions">
                            <button className="btn-primary sm" onClick={() => { setViewingStore(store); showView('view-store'); }}>🏪 View Store</button>
                            <button className="btn-ghost sm" onClick={() => openChat({ id: store.id, name: store.business_name })}>💬 Inquire</button>
                            <button className="btn-ghost sm" onClick={() => handleFollow(store.id, store.business_name)}>❤️ Follow</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </main>

              <nav className="bottom-nav">
                <button className="bnav-btn" onClick={() => showView('customer-home')}>🏠<span>Home</span></button>
                <button className="bnav-btn active">🔍<span>Explore</span></button>
                <button className={`bnav-btn ${view === 'chat' ? 'active' : ''}`} onClick={() => showView('chat')}>💬<span>Chats</span></button>
                <button className="bnav-btn" onClick={() => showToast('Profile coming soon!')}>👤<span>Profile</span></button>
              </nav>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CHAT LIST
        ═══════════════════════════════════════════════════════════ */}
        {view === 'chat' && (
          <div className="view active" style={{ minHeight:'100vh', background:'var(--bg)' }}>
            <header className="app-header" style={{ flexWrap:'nowrap' }}>
              <button className="back-btn sm" onClick={() => showView(role === 'business' ? 'business-dash' : 'customer-home')} aria-label="Go back">←</button>
              <h2 style={{ flex:1, fontSize:'1.05rem', fontFamily:'Syne, sans-serif', margin:0 }}>💬 Messages</h2>
              {role === 'business' && (
                <div className="avatar" onClick={() => setIsMenuOpen(true)} role="button" tabIndex={0}>{avatarLetter}</div>
              )}
            </header>
            {chatLoading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner size={32} /></div>
            ) : (
              <div className="chat-list" style={{ paddingBottom:80 }}>
                {chatList.length > 0 ? chatList.map(chat => (
                  <div key={chat.id} className="chat-item" onClick={() => openChat(chat)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && openChat(chat)}>
                    <div className={`chat-avatar ${chat.is_business ? 'biz' : ''}`}>{(chat.name || 'U')[0].toUpperCase()}</div>
                    <div className="chat-info">
                      <div className="chat-name">{chat.name}</div>
                      <div className="chat-preview">{chat.last_message || 'No messages yet'}</div>
                    </div>
                    {chat.unread_count > 0 && <span className="unread-badge">{chat.unread_count}</span>}
                  </div>
                )) : (
                  <div className="empty-chat-state">
                    <div style={{ fontSize:'3rem', marginBottom:12 }}>💬</div>
                    <p style={{ fontWeight:600, marginBottom:6 }}>Your inbox is empty</p>
                    <p style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Messages from businesses and buyers appear here.</p>
                    <button className="btn-primary sm" style={{ marginTop:16 }} onClick={() => showView('explore')}>🔍 Find Businesses to Chat</button>
                  </div>
                )}
              </div>
            )}
            {role === 'business' ? <BizBottomNav active="chat" /> : (
              <nav className="bottom-nav">
                <button className="bnav-btn" onClick={() => showView('customer-home')}>🏠<span>Home</span></button>
                <button className="bnav-btn" onClick={() => showView('explore')}>🔍<span>Explore</span></button>
                <button className="bnav-btn active">💬<span>Chats</span></button>
                <button className="bnav-btn" onClick={() => showToast('Profile coming soon!')}>👤<span>Profile</span></button>
              </nav>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CHAT OPEN
        ═══════════════════════════════════════════════════════════ */}
        {view === 'chat-open' && (
          <div className="view active">
            <div className="chat-open-shell">
              <header className="chat-header">
                <button
                  className="back-btn sm"
                  onClick={() => showView('chat')}
                  aria-label="Back to messages"
                  style={{ minWidth:36, minHeight:36, display:'flex', alignItems:'center', justifyContent:'center' }}
                >←</button>
                <div className="chat-header-avatar">{(activeChat.name || '?')[0].toUpperCase()}</div>
                <div className="chat-header-info">
                  <div className="chat-header-name">{activeChat.name || 'Unknown'}</div>
                  <div className="chat-header-status">● Online</div>
                </div>
                <button className="icon-btn" onClick={() => showToast('Voice call coming soon!')} aria-label="Call">📞</button>
              </header>

              <div className="chat-messages">
                {messages.length === 0 && (
                  <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'40px 20px', fontSize:'0.85rem' }}>
                    Start the conversation! 👋
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className={`msg ${msg.sender === userProfile?.id ? 'me' : 'them'}`}>
                    <div className="msg-bubble">
                      {msg.content || msg.text}
                      <span className="msg-time">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-bar">
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  aria-label="Message input"
                />
                <button className="send-btn" onClick={sendMessage} aria-label="Send message">➤</button>
              </div>
            </div>
          </div>
        )}

      </div>{/* end #app */}

      {/* ═══════════════════════════════════════════════════════════
          FLOATING AI CHATBOT (always mounted)
      ═══════════════════════════════════════════════════════════ */}
      <div className="chatbot-floating-container">
        {botOpen && (
          <div className="chat-window" role="dialog" aria-label="AI Advisor">
            <div className="chat-window-header">
              <span>🤖 El-Mart Advisor</span>
              <button onClick={() => setBotOpen(false)} style={{ background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.1rem' }} aria-label="Close chatbot">✕</button>
            </div>
            <div className="chat-window-messages">
              {botMessages.map((msg, i) => (
                <div key={i} className={`bot-msg ${msg.sender === 'user' ? 'bot-msg-user' : 'bot-msg-bot'}`}>{msg.text}</div>
              ))}
              {botLoading && <div className="bot-msg bot-msg-bot" style={{ fontStyle:'italic' }}>Thinking… ⏳</div>}
              <div ref={botEndRef} />
            </div>
            <div className="chat-window-input">
              <input
                type="text"
                placeholder="e.g. Is ₦45k fair for iPhone 11?"
                value={botInput}
                onChange={e => setBotInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askBot()}
                aria-label="Ask AI"
              />
              <button onClick={askBot} disabled={botLoading}>{botLoading ? '…' : 'Send'}</button>
            </div>
          </div>
        )}
        <button className="chat-toggle-btn" onClick={() => setBotOpen(p => !p)} title="AI Advisor" aria-label="Toggle AI advisor">
          {botOpen ? '✕' : '🤖'}
        </button>
      </div>
    </>
  );
}

