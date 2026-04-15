import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';


function App() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('landing');
  const [role, setRole] = useState('customer'); // 'customer' or 'business'
  const [activeChat, setActiveChat] = useState({ name: '', initials: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false); 
 // Controls the floating bot
  const [showProductModal, setShowProductModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
  { id: 1, sender: 'them', text: 'Welcome to our store! How can we help?', time: '2m ago' }
 ]);
 const [showPassword, setShowPassword] = useState(false);
 const [selectedMedia, setSelectedMedia] = useState([]); // Stores actual files
 const [mediaPreviews, setMediaPreviews] = useState([]); // Stores URLs for display
 const [searchResults, setSearchResults] = useState([]);
 const [stats, setStats] = useState({ productCount: 0, viewCount: 0,
  messageCount: 0,
  followerCount: 0});
  const [searchData, setSearchData] = useState({ name: '', location: '', product: '' });
  const [stores, setStores] = useState([]); 


  const [recentProducts, setRecentProducts] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSettingTab, setActiveSettingTab] = useState('branding');
  const [campaignText, setCampaignText] = useState("");
  const [subscribers, setSubscribers] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: 0 });
 
 const [userProfile, setUserProfile] = useState(null); 

  const [chatList, setChatList] = useState([]);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);


 

 
useEffect(() => {
  if (userProfile) fetchNotifications();
}, [userProfile]);


  


 const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    bizName: '',
    bizCat: '',
    location: '',
    sellerType: 'retail',
    newsletter: false
  });

  const [productData, setProductData] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Electronics',
    description: ''
  });
// Inside function App() { ...

  const [posts, setPosts] = useState([]);

  // This handles all data fetching when the "page" changes
  useEffect(() => {
    if (view === 'customer-home' || view === 'social-feed') {
      fetchSocialFeed();
    }
    
    if (view === 'business-dash' || view === 'biz-products') {
      fetchDashboardData();
    }
  }, [view]);



useEffect(() => {
  if (view === 'newsletter') {
    fetchSubscribers();
  }
}, [view]);


  // Define the actual fetch function here
 
const fetchSocialFeed = async () => {
    const token = localStorage.getItem('token'); // Get your saved token
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/posts', { 
        headers: {
          'Authorization': `Token ${token}` // Send the handshake
        }
      });
      setPosts(response.data);
    } catch (err) {
      console.error("Error loading feed:", err);
    }
};



const fetchNotifications = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/notifications/', { 
      headers: { 'Authorization': `Token ${token}` }
    });
    setNotifications(response.data);
  } catch (err) {
    console.error("Notif Error:", err);
  }
};

// Auto-fetch when the app loads


  const handleFollow = async (userId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`http://127.0.0{userId}/`, {}, {
      headers: { 'Authorization': `Token ${token}` }
    });
    
    // Update the dashboard stats immediately
    setStats(prev => ({
      ...prev,
      followingCount: response.data.following_count
    }));
    
    alert(`Successfully ${response.data.action}!`);
  } catch (err) {
    console.error("Follow error", err);
  }
};



const handleUpdatePassword = async () => { 
  const token = localStorage.getItem('token');
   try {
    await axios.post('http://127.0.0.1:8000/api/change-password/', { 
      old_password: oldPassword, // You'll need state for these
      new_password: newPassword
    }, {
      headers: { 'Authorization': `Token ${token}` }
    });
    alert("Password updated successfully!");
  } catch (err) {
    alert(err.response?.data?.error || "Failed to update password");
  }
};



const handleMediaChange = (e) => {
  const files = Array.from(e.target.files);
  setSelectedMedia([...selectedMedia, ...files]);

  // Generate preview URLs
  const newPreviews = files.map(file => URL.createObjectURL(file));
    setMediaPreviews([...mediaPreviews, ...newPreviews]);
  };

const removeMedia = (index) => {
    const updatedMedia = selectedMedia.filter((_, i) => i !== index);
    const updatedPreviews = mediaPreviews.filter((_, i) => i !== index);
    setSelectedMedia(updatedMedia);
    setMediaPreviews(updatedPreviews);
  };



  // --- NAVIGATION HELPER ---
  const showView = (v) => {
    window.scrollTo(0, 0); // Mimics original behavior
    setView(v);
  };

  // --- ROLE TOGGLE (For Signup) ---
  const setSignupRole = (r) => {
    setRole(r);
  };

    // 1. REPLACES YOUR LOGIN LOGIC

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        // 1. DEFINE userData FIRST
        const userData = response.data.user;
        const token = response.data.token;

        // 2. NOW SAVE TO LOCALSTORAGE
        localStorage.setItem('token', token);
        localStorage.setItem('role', userData.role); 
        localStorage.setItem('fullName', userData.fullName || ''); 

        // 3. UPDATE STATE
        setUserProfile(userData); 
        setRole(userData.role);    
        
        // 4. REDIRECT
        if (userData.role === 'business') {
          showView('business-dash');
        } else {
          showView('customer-home');
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed.";
      alert(errorMsg);
    }
};





    const handleProductSubmit = (e) => {
    e.preventDefault();
    
    // Logic to collect form data will go here
    alert("Product form submitted! Ready to connect to Django.");
    
    // Go back to dashboard after saving
    showView('business-dash');
  };




  // 2. REPLACES YOUR SIGNUP LOGIC
  const handleSignup = async () => {
  try {
    console.log("SENDING THIS PAYLOAD:", payload);

    const response = await axios.post('http://127.0.0.1:8000/api/signup/', {
      email: formData.email, // Make sure these variable names match your React state
      password: formData.password,
      fullName: formData.fullName,
      role: role,
      bizName: formData.bizName,
      location: formData.location,
      sellerType: formData.sellerType
    });
    
    alert(response.data.message);
    showView('login');
  } catch (err) {
      const errorMsg = err.response?.data?.error || "Check your network connection";
    alert("Signup Error: " + errorMsg);
  }
  };

  {/* Create a helper at the top of your component or use this inline */}
const avatarLetter = (userProfile?.business_name?.charAt(0) || 
                     userProfile?.full_name?.charAt(0) || 
                     userProfile?.username?.charAt(0) || "U").toUpperCase();



  const saveStoreSettings = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.patch('http://127.0.0.1:8000/profile/update/', {
      business_name: userProfile.business_name,
      business_category: userProfile.business_category,
      // Add other fields you want to save
    }, {
      headers: { 'Authorization': `Token ${token}` }
    });
    if (response.status === 200) {
      // ✅ CRITICAL: Update the state with the returned data from server
      setUserProfile(response.data); 
      alert("Store settings saved!");
    }
  } catch (err) {
    console.error("Save Error:", err.response?.data);
  }
};

  


 const handleMultiSearch = async () => {
  try {
    const { name, location, product } = searchData;
    
    // CORRECTED URL: Added the full IP, port, path, and the ?name= variable
   const url = `http://127.0.0.1:8000/api/discover/?name=${name}&location=${location}&product=${product}`;

    
    console.log("Searching at:", url); 

    const response = await axios.get(url);
    
    // Check if we got data
    if (response.data) {
      setStores(response.data);
      showView('explore'); 
    }
  } catch (err) {
    console.error("Multi-search failed", err);
    alert("Network error: Check if Django is running at http://127.0.0.1:8000");
  }
};




const handleAddProduct = async (e) => {
  if (e) e.preventDefault();
  
  const token = localStorage.getItem('token');
  
  // Use productData here because that's what your inputs update!
  const payload = {
    name: productData.name,
    price: parseFloat(productData.price || 0), 
    stock: parseInt(productData.stock || 0),
    // If your Django model doesn't have category/description yet, 
    // don't include them in the payload or you'll get a 400 error.
  };

  console.log("Sending this data:", payload);

  try {
    const response = await axios.post('http://127.0.0.1:8000/my-products/', 
      payload, 
      { headers: { 'Authorization': `Token ${token}` } }
    );

    if (response.status === 201) {
      alert("Product Listed Successfully! 🚀");
      // Reset the form
      setProductData({ name: '', price: '', stock: '', category: 'Electronics', description: '' });
      showView('business-dash'); // Go back to dashboard
    }
  } catch (err) {
    console.error("The POST failed:", err.response?.data);
    alert("Error: Check the console for details.");
  }
};


const handleBack = () => {
  const role = localStorage.getItem('role');
  if (view === 'chat-open') {
    showView('chat');
  } else if (view === 'chat' || view === 'biz-products' || view === 'social-feed') {
    showView(role === 'business' ? 'business-dash' : 'customer-home');
  } else {
    showView('landing');
  }
};



const fetchSubscribers = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/newsletter/subscribers/', { 
      headers: { 'Authorization': `Token ${token}` }
    });
    setSubscribers(response.data);
  } catch (err) {
    console.error("Failed to load subscribers:", err);
  }
};

// Trigger fetch when the tab changes




const sendCampaign = async () => {
  if (!campaignText.trim()) return alert("Please write a message first!");
  
  const token = localStorage.getItem('token');
  try {
    await axios.post('http://127.0.0.1:8000/api/newsletter/send/',
      { message: campaignText }, 
      { headers: { 'Authorization': `Token ${token}` } }
    );
    alert(`Success! Message sent to ${subscribers.length} subscribers.`);
    setCampaignText(""); // Clear the box
  } catch (err) {
    alert("Failed to send campaign. Check your connection.");
  }
};





const fetchDashboardData = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await axios.get('http://127.0.0.1:8000/api/my-products/', {
      headers: { 'Authorization': `Token ${token}` }
      
    });
    console.log("Full Backend Response:", response.data);
    // 1. Update total count
    setStats(prev => ({ 
      ...prev, 
      productCount: response.data.count || 0 
    }));

    // 2. Update the list (Access .products from the object)
    if (response.data.products) {
      // Use spread operator [...] to force React to recognize the change
      setRecentProducts([...response.data.products.slice(0, 5)]);
    }

  } catch (err) {
    console.error("Dashboard Fetch Error:", err);
  }
};

// Fetch data whenever the view switches to the dashboard
  useEffect(() => {
  if (view === 'business-dash' || view === 'biz-products') {
    fetchDashboardData();
  }
}, [view]);

// 1. Define the state for the list

// 2. Fetch the contacts list from Django
const fetchChatList = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/messages/', {
      headers: { 'Authorization': `Token ${token}` }
    });
    setChatList(response.data);
  } catch (err) {
    console.error("Failed to load chats", err);
  }
};

// 3. Trigger the fetch when the user enters the chat view
useEffect(() => {
  if (view === 'chat') {
    fetchChatList();
  }
}, [view]);



const handleSearch = async (query) => {
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://127.0.0{query}`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    setSearchResults(response.data);
  } catch (err) {
    console.error("Search failed", err);
  }
};


  // 3. REPLACES YOUR CHAT LOGIC
 const openChat = async (contact) => {
  // 1. Set the UI header info
  setActiveChat({ 
    id: contact.id, 
    name: contact.name, 
    initials: contact.initials || contact.name.charAt(0) 
  });
  
  // 2. Switch the view
  setView('chat-open');

  // 3. Fetch real messages from Django
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/messages/`, {
      params: { contact: contact.id }, // We'll tell Django which person we are chatting with
      headers: { 'Authorization': `Token ${token}` }
    });
    
    // 4. Update the messages state with real data
    // Assuming Django returns: { sender, content, timestamp }
    setMessages(response.data); 
  } catch (err) {
    console.error("Error loading conversation:", err);
    setMessages([]); // Clear messages if fetch fails
  }
};

    const openConversation = async (contact) => {
    setActiveChat(contact);
    showView('chat-open');
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://127.0.0{contact.id}`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      setMessages(response.data); // Real messages from Django
    } catch (err) {
      console.error("Chat fetch error", err);
    }
  };

  const sendMessage = async () => {
  if (!chatInput.trim()) return;

  const token = localStorage.getItem('token');
  const newMessage = {
    receiver_id: activeChat.id, // You'll need to store the ID when clicking a chat
    content: chatInput
  };

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/messages/', newMessage, {
      headers: { 'Authorization': `Token ${token}` }
    });

    // Update UI with the message from the server
    setMessages([...messages, { 
      sender: 'me', 
      text: response.data.content, 
      time: 'Now' 
    }]);
    setChatInput('');
  } catch (err) {
    console.error("Chat Error:", err);
  }
};

const fetchChats = async () => {
  const token = localStorage.getItem('token');
  try {
    // This endpoint should return a list of users you've messaged
    const response = await axios.get('http://127.0.0.1:8000/api/messages/', {
      headers: { 'Authorization': `Token ${token}` }
    });
    setChatList(response.data); // Store this in a new state: [chatList, setChatList]
  } catch (err) {
    console.error("Error fetching contacts:", err);
  }
};

const [aiQuery, setAiQuery] = useState('');
const [aiResponse, setAiResponse] = useState('');

const askAI = async () => {
  if (!aiQuery.trim()) return;
  setAiResponse("Thinking... 🤔");
  
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/ai-advisor/', {
      query: aiQuery
    });
    setAiResponse(response.data.reply);
  } catch (err) {
    setAiResponse("Sorry, my brain is a bit foggy. Check your connection!");
  }
};



  // 4. REPLACES YOUR AI ADVISOR LOGIC
  
  

return (
    <>
              <div id="app">

                {/* ===================== LANDING PAGE ===================== */}
                {view === 'landing' && (
                  <div id="view-landing" className="view active">
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
                        <button className="btn-primary big" onClick={() => { setRole('business'); showView('signup'); }}>Open Your Store</button>
                        <button className="btn-outline big" onClick={() => { setRole('customer'); showView('signup'); }}>Shop Now</button>
                      </div>

                      <div className="hero-stats">
                        <div className="stat"><span className="stat-num">12,000+</span><span>Businesses</span></div>
                        <div className="stat"><span className="stat-num">4M+</span><span>Products</span></div>
                        <div className="stat"><span className="stat-num">36</span><span>States</span></div>
                      </div>
                    </section>

                    <section className="features-strip">
                      <div className="feat"><div className="feat-icon">🏪</div><h3>Your Own Store</h3><p>Personalized storefront with your logo, colors, and branding.</p></div>
                      <div className="feat"><div className="feat-icon">💬</div><h3>Live Chat</h3><p>Chat, call, video call with buyers and businesses in real time.</p></div>
                      <div className="feat"><div className="feat-icon">🤖</div><h3>AI Chatbot</h3><p>Auto-replies keep your store open 24/7 even when you're away.</p></div>
                      <div className="feat"><div className="feat-icon">📧</div><h3>Newsletters</h3><p>Send email blasts to connected customers about new arrivals.</p></div>
                      <div className="feat"><div className="feat-icon">📍</div><h3>Location Sharing</h3><p>Share your exact location when customers need to find you.</p></div>
                      <div className="feat"><div className="feat-icon">🤝</div><h3>Retail & Wholesale</h3><p>Set different pricing tiers for retailers and wholesalers.</p></div>
                    </section>

                    <footer className="landing-footer">
                      <div className="logo">El<span>Mart</span></div>
                      <p>© 2026 El-Mart. Bridging the digital divide, one store at a time.</p>
                    </footer>
                  </div>
                )}


                {/* ===================== SIGNUP PAGE ===================== */}
                {view === 'signup' && (
                  <div id="view-signup" className="view active">
                    <div className="auth-page">
                      <button className="back-btn" onClick={() => showView('landing')}>← Back</button>
                      <div className="auth-box">
                        <div className="logo center">El<span>Mart</span></div>
                        <h2>Create Your Account</h2>
                        <p className="auth-sub">Choose how you want to use El-Mart</p>

                        <div className="role-tabs">
                          <button
                            className={`role-tab ${role === 'customer' ? 'active' : ''}`}
                            onClick={() => setRole('customer')}
                          >🛒 Customer</button>
                          <button
                            className={`role-tab ${role === 'business' ? 'active' : ''}`}
                            onClick={() => setRole('business')}
                          >🏪 Business Owner</button>
                        </div>

                        <div className="form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            placeholder="e.g. Adama Oyemechi"
                          />
                        </div>
                        <div className="form-group">
                          <label>Email Address</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="you@example.com"
                          />
                        </div>
                        <div className="form-group" style={{ position: 'relative' }}>
                          <label>Password</label>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="Create a strong password"
                            style={{ paddingRight: '40px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '10px', top: '32px', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            {showPassword ? '👁️‍🗨️' : '👁️'}
                          </button>
                        </div>

                        {role === 'business' && (
                          <>
                            <div className="form-group">
                              <label>Business / Company Name</label>
                              <input
                                type="text"
                                value={formData.bizName}
                                onChange={(e) => setFormData({...formData, bizName: e.target.value})}
                                placeholder="e.g. Okonkwo Electronics Ltd"
                              />
                            </div>
                            <div className="form-group">
                              <label>Business Category</label>
                              <select value={formData.bizCat} onChange={(e) => setFormData({...formData, bizCat: e.target.value})}>
                                <option value="">Select category</option>
                                <option>Electronics & Gadgets</option>
                                <option>Fashion & Apparel</option>
                                <option>Food & Groceries</option>
                                <option>Agriculture & Farm Produce</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Seller Type</label>
                              <div className="radio-group">
                                <label className="radio-opt">
                                  <input type="radio" value="retail" checked={formData.sellerType === 'retail'} onChange={(e) => setFormData({...formData, sellerType: e.target.value})} /> Retailer
                                </label>
                                <label className="radio-opt">
                                  <input type="radio" value="wholesale" checked={formData.sellerType === 'wholesale'} onChange={(e) => setFormData({...formData, sellerType: e.target.value})} /> Wholesaler
                                </label>
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Business Location / State</label>
                              <select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}>
                                <option value="">Select State</option>
                                <option>Lagos</option><option>Abuja (FCT)</option><option>Kano</option><option>Rivers</option>
                              </select>
                            </div>
                          </>
                        )}

                        <div className="form-check">
                          <input
                            type="checkbox"
                            id="su-newsletter"
                            checked={formData.newsletter}
                            onChange={(e) => setFormData({...formData, newsletter: e.target.checked})}
                          />
                          <label htmlFor="su-newsletter">I consent to receive email newsletters</label>
                        </div>

                        <button className="btn-primary full" onClick={handleSignup}>Create Account</button>

                        <p className="auth-switch">
                          Already have an account?{" "}
                          <a href="#" onClick={(e) => { e.preventDefault(); showView('login'); }}>Log In</a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}


                {/* ===================== LOGIN PAGE ===================== */}
                {view === 'login' && (
                  <div id="view-login" className="view active">
                    <div className="auth-page">
                      <button className="back-btn" onClick={() => showView('landing')}>← Back</button>
                      <div className="auth-box">
                        <div className="logo center">El<span>Mart</span></div>
                        <h2>Welcome Back</h2>
                        <p className="auth-sub">Sign in to your El-Mart account</p>

                        <div className="form-group">
                          <label>Email Address</label>
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>

                        <div className="form-group" style={{ position: 'relative' }}>
                          <label>Password</label>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Your password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            style={{ paddingRight: '40px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '10px', top: '32px', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            {showPassword ? '👁️‍🗨️' : '👁️'}
                          </button>
                        </div>

                        <button className="btn-primary full" onClick={handleLogin}>Log In</button>

                        <div className="login-demos">
                          <p>Try a demo:</p>
                          <button className="demo-btn" onClick={() => { setRole('customer'); showView('customer-home'); }}>Demo as Customer</button>
                          <button className="demo-btn" onClick={() => { setRole('business'); showView('business-dash'); }}>Demo as CEO</button>
                        </div>

                        <p className="auth-switch">
                          New here? <a href="#" onClick={(e) => { e.preventDefault(); showView('signup'); }}>Create an account</a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}


                {/* ===================== BUSINESS OWNER DASHBOARD ===================== */}
                {view === 'business-dash' && (
                <div id="view-business" className="view active">
                  
                  {/* --- 1. MOBILE DRAWER (SLIDE-OUT MENU) --- */}
                  <div className={`biz-drawer ${isMenuOpen ? 'open' : ''}`}>
                    <div className="drawer-content">
                      <div className="drawer-header">
                        <div className="drawer-biz-info">
                          <div className="avatar-big">
                              {avatarLetter}
                            </div>
                            <div className="biz-text-meta">
                              <div className="drawer-ceo-label">
                                {userProfile?.full_name || userProfile?.username || "Owner"} 👑
                              </div>
                              <div className="drawer-biz-name">
                                {userProfile?.business_name || "Setting up your store..."}
                              </div>
                            </div>

                      </div>

                        <button className="close-drawer" onClick={() => setIsMenuOpen(false)}>✕</button>
                      </div>
                      
                      <nav className="drawer-nav">
                        {/* Items that are hidden on the mobile bottom bar go here */}
                        <button onClick={() => { showView('biz-store'); setIsMenuOpen(false); }}>🏪 My Store</button>
                        <button onClick={() => { showView('customers'); setIsMenuOpen(false); }}>👥 Customers</button>
                        <button onClick={() => { showView('newsletter'); setIsMenuOpen(false); }}>📧 Newsletter</button>
                        <button onClick={() => { showView('ads'); setIsMenuOpen(false); }}>🚀 Sponsored Ads</button>
                        <button onClick={() => { showView('settings'); setIsMenuOpen(false); }}>⚙️ Settings</button>
                        <hr />
                        <button className="logout-btn-drawer" onClick={() => { setUserProfile(null); showView('landing'); }}>← Log Out</button>
                      </nav>
                    </div>
                    <div className="drawer-overlay" onClick={() => setIsMenuOpen(false)}></div>
                  </div>

                  {/* --- 2. MAIN LAYOUT SHELL --- */}
                  <div className="biz-shell">

                    {/* DESKTOP SIDEBAR (Hidden on mobile via CSS) */}
                    <aside className="biz-sidebar">
                      <div className="logo sm">El<span>Mart</span></div>
                      <div className="biz-welcome">
                        <div className="biz-welcome-text">Welcome back,</div>
                        <div className="biz-ceo">{userProfile?.full_name || userProfile?.username} 👑</div>
                        <div className="biz-name-disp">{userProfile?.business_name || "El-Mart Merchant"}</div>
                      </div>

                      <nav className="biz-nav">
                        <button className="biz-nav-btn active">📊 Dashboard</button>
                        <button className="biz-nav-btn" onClick={() => showView('biz-store')}>🏪 My Store</button>
                        <button className="biz-nav-btn" onClick={() => showView('biz-products')}>📦 Products</button>
                        <button className="biz-nav-btn">📸 Posts</button>
                        <button className="biz-nav-btn">👥 Customers</button>
                        <button className="biz-nav-btn">📧 Newsletter</button>
                        <button className="biz-nav-btn" onClick={() => showView('chat')}>💬 Chats</button>
                        <button className="biz-nav-btn">🚀 Sponsored Ads</button>
                        <button className="biz-nav-btn">⚙️ Settings</button>
                      </nav>
                      <button className="btn-ghost sm logout-btn" onClick={() => { setUserProfile(null); showView('landing'); }}>← Log Out</button>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <main className="biz-main">
                      <div className="biz-topbar">
                        <h1 className="biz-page-title">Dashboard Overview</h1>
                        <div className="biz-topbar-right">
                          <button className="btn-primary sm" onClick={() => showView('view-store')}>👁 View My Store</button>
                          
                          {/* AVATAR TRIGGER FOR DRAWER */}
                          <div 
                            className="avatar" 
                            onClick={() => setIsMenuOpen(true)} 
                            style={{ cursor: 'pointer', zIndex: 999, position: 'relative' }}
                          >
                            {/* Priority: 1. Business Name, 2. Full Name, 3. Fallback "C" */}
                            {(
                              userProfile?.business_name?.charAt(0) || 
                              userProfile?.full_name?.charAt(0) || 
                              userProfile?.fullName?.charAt(0) || 
                              "C"
                            ).toUpperCase()}
                          </div>

                        </div>
                      </div>

                      <div className="biz-stats-row">
                        <div className="biz-stat-card">
                          <div className="bstat-icon">👁</div>
                          <div className="bstat-val">0</div>
                          <div className="bstat-lbl">Store Views</div>
                        </div>
                        <div className="biz-stat-card">
                          <div className="bstat-icon">💬</div>
                          <div className="bstat-val">0</div>
                          <div className="bstat-lbl">Messages</div>
                        </div>
                        <div className="biz-stat-card">
                          <div className="bstat-icon">📦</div>
                          <div className="bstat-val">{stats.productCount}</div>
                          <div className="bstat-lbl">Products Listed</div>
                        </div>
                        <div className="biz-stat-card">
                          <div className="bstat-icon">❤️</div>
                          <div className="bstat-val">0</div>
                          <div className="bstat-lbl">Followers</div>
                        </div>
                      </div>

                      <div className="biz-dash-grid">
                        <div className="biz-dash-card">
                          <div className="biz-dash-card-title">📢 Quick Post</div>
                          <textarea placeholder={`What's new at ${userProfile?.business_name || 'the store'}?`} rows="3"></textarea>
                          <div className="post-actions-row">
                            <button className="icon-btn" title="Add Image">🖼</button>
                            <button className="icon-btn" title="Add Video">🎬</button>
                            <button className="btn-primary sm">Post</button>
                          </div>
                        </div>

                        <div className="biz-dash-card">
                          <div className="biz-dash-card-title">🔔 Recent Activity</div>
                          <div className="activity-list">
                            <div className="activity-item">
                              <span className="act-icon">✨</span>
                              <span>Welcome to El-Mart, {userProfile?.fullName}!</span>
                              <span className="act-time">Now</span>
                            </div>
                            {recentProducts && recentProducts.length > 0 ? (
                              recentProducts.map((prod) => (
                                <div className="activity-item" key={prod.id}>
                                  <span className="act-icon">📦</span>
                                  <span>You listed a new product: <b>{prod.name}</b></span>
                                  <span className="act-time">Recent</span>
                                </div>
                              ))
                            ) : (
                              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center'}}>
                                No products listed yet.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="biz-dash-card full">
                          <div className="biz-dash-card-title">📦 Inventory Status</div>
                          <div className="low-stock-list">
                            <p style={{textAlign: 'center', padding: '20px', color: 'var(--text-muted)'}}>No products found.</p>
                          </div>
                        </div>
                      </div>
                    </main>

                    {/* --- 3. MOBILE BOTTOM NAVIGATION --- */}
                    <nav className="bottom-nav biz-bottom">
                      <button 
                        className={`bnav-btn ${view === 'business-dash' ? 'active' : ''}`} 
                        onClick={() => showView('business-dash')}
                      >
                        📊<span>Dash</span>
                      </button>
                      
                      <button 
                        className={`bnav-btn ${view === 'biz-products' ? 'active' : ''}`} 
                        onClick={() => showView('biz-products')}
                      >
                        📦<span>Products</span>
                      </button>

                      <button 
                        className={`bnav-btn ${view === 'social-feed' ? 'active' : ''}`} 
                        onClick={() => showView('social-feed')}
                      >
                        📱<span>Feed</span>
                      </button>

                      <button 
                        className={`bnav-btn ${view === 'chat' || view === 'chat-open' ? 'active' : ''}`} 
                        onClick={() => showView('chat')}
                      >
                        💬<span>Chat</span>
                      </button>
                    </nav>

                  </div>
                </div>
              )}


              {view === 'settings' && (
                <div id="view-settings" className="view active">
                  <div className="biz-shell">
                    {/* 1. Sidebar remains for desktop */}
                    <aside className="biz-sidebar">
                      <div className="logo sm">El<span>Mart</span></div>
                      <nav className="biz-nav">
                        <button className="biz-nav-btn" onClick={() => showView('business-dash')}>📊 Dashboard</button>
                        <button className="biz-nav-btn" onClick={() => showView('biz-store')}>🏪 My Store</button>
                        <button className="biz-nav-btn" onClick={() => showView('biz-products')}>📦 Products</button>
                        <button className="biz-nav-btn active">⚙️ Settings</button>
                      </nav>
                    </aside>

                    <main className="biz-main">
                      <div className="settings-container">
                        <h1 className="biz-page-title">⚙️ Control Center</h1>
                        
                        <div className="settings-layout">
                          {/* 2. Vertical Tabs for Settings Categories */}
                          <nav className="settings-tabs">
                            <button className={activeSettingTab === 'branding' ? 'active' : ''} onClick={() => setActiveSettingTab('branding')}>🏪 Branding</button>
                            <button className={activeSettingTab === 'security' ? 'active' : ''} onClick={() => setActiveSettingTab('security')}>🔐 Security</button>
                            <button className={activeSettingTab === 'ops' ? 'active' : ''} onClick={() => setActiveSettingTab('ops')}>⚙️ Operations</button>
                            <button className={activeSettingTab === 'finance' ? 'active' : ''} onClick={() => setActiveSettingTab('finance')}>💰 Finance</button>
                          </nav>

                          {/* 3. Dynamic Content Area */}
                          <div className="settings-content">
                            {activeSettingTab === 'branding' && (
                              <div className="settings-pane">
                                <h3>Public Branding</h3>
                                <div className="form-group">
                                  <label>Business Name</label>
                                  <input type="text" value={userProfile.business_name} onChange={(e) => setUserProfile({...userProfile, business_name: e.target.value})} />
                                </div>
                                <div className="form-group">
                                  <label>Tagline</label>
                                  <input type="text" value={userProfile.tagline} onChange={(e) => setUserProfile({...userProfile, tagline: e.target.value})} />
                                </div>
                                <button className="btn-primary" onClick={saveStoreSettings}>Save Branding</button>
                              </div>
                            )}

                            {activeSettingTab === 'security' && (
                              <div className="settings-pane">
                                <h3>Account Security</h3>
                                <div className="form-group">
                                  <label>Current Password</label>
                                  <input type="password" placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                  <label>New Password</label>
                                  <input type="password" placeholder="Min 8 characters" />
                                </div>
                                <button className="btn-primary">Update Password</button>
                              </div>
                            )}
                            
                            {/* Add 'ops' and 'finance' panes similarly */}
                          </div>
                        </div>
                      </div>

                      {/* 4. Bottom Nav for mobile */}
                      <nav className="bottom-nav biz-bottom">
                        <button className="bnav-btn" onClick={() => showView('business-dash')}>📊<span>Dash</span></button>
                        <button className="bnav-btn active">⚙️<span>Settings</span></button>
                      </nav>
                    </main>
                  </div>
                </div>
              )}

             {/* THE NUCLEAR FIX - Check the string exactly! */}
            

                {view === 'newsletter' && (
                  <div id="view-newsletter" className="view active" style={{display: 'block'}}>
                    <div className="biz-shell">
                      {/* 1. TOPBAR (Always show this first) */}
                      <main className="biz-main" style={{marginLeft: 0, width: '100%'}}>
                        <header className="biz-topbar">
                          <button className="back-btn sm" onClick={() => showView('business-dash')}>←</button>
                          <h1 className="biz-page-title">📧 Newsletter</h1>
                        </header>

                        {/* 2. THE CONTENT */}
                        <div className="newsletter-stats">
                          <div className="stat-card">
                            <span className="stat-label">Subscribers</span>
                            <span className="stat-value">{subscribers ? subscribers.length : 0}</span>
                          </div>
                        </div>

                        <div className="subscriber-list">
                          <h4>Active List</h4>
                          {subscribers && subscribers.length > 0 ? (
                            <div className="table-responsive">
                              <table className="biz-table">
                                <thead>
                                  <tr><th>Email</th><th>Date</th></tr>
                                </thead>
                                <tbody>
                                  {subscribers.map(sub => (
                                    <tr key={sub.id}>
                                      <td>{sub.email}</td>
                                      <td>{sub.date ? new Date(sub.date).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="empty-text">No subscribers yet. 200 OK received from server.</p>
                          )}
                        </div>

                        <div className="campaign-box" style={{marginTop: '30px'}}>
                          <h4>Create Update</h4>
                          <textarea 
                            rows="4" 
                            value={campaignText || ""} 
                            onChange={(e) => setCampaignText(e.target.value)}
                            placeholder="Message..."
                          ></textarea>
                          <button className="btn-primary" onClick={sendCampaign}>Send Broadcast</button>
                        </div>
                      </main>
                    </div>
                  </div>
                )}





                {/* ===================== VIEW STORE (PUBLIC PREVIEW) ===================== */}
                {view === 'view-store' && (
                  <div className="view active">
                    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                      <button className="btn-ghost" onClick={() => showView('business-dash')} style={{marginBottom: '20px'}}>
                        ← Back to Dashboard
                      </button>

                      <div className="store-header-card" style={{ background: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 15px' }}>
                          {userProfile?.bizName?.charAt(0) || "B"}
                        </div>
                        <h1 style={{ marginBottom: '5px' }}>{userProfile?.bizName || "Business Name"}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Official Store</p>
                      </div>

                      <div style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p>Your store is currently empty.</p>
                        <button className="btn-primary sm" onClick={() => showView('biz-products')} style={{marginTop: '10px'}}>
                          Add Your First Product
                        </button>
                      </div>
                    </div>
                  </div>
                )}


                {/* ===================== CHAT LIST ===================== */}
                  {view === 'chat' && (
                      <div id="view-chat" className="view active">
                        <header className="app-header">            
                          <button 
                            className="back-btn sm" 
                            onClick={() => {
                              // Dynamic navigation based on role
                              const userRole = localStorage.getItem('role'); 
                              showView(userRole === 'business' ? 'business-dash' : 'customer-home');
                            }}
                          >
                            ←
                          </button>
                          <h2 style={{flex: 1, fontSize: '1.1rem'}}>Messages</h2>
                        </header>

                        <div className="chat-list">
                          {/* chatList should be an array of unique conversations from Django */}
                          {chatList && chatList.length > 0 ? (
                            chatList.map((chat) => (
                              <div 
                                key={chat.id} 
                                className="chat-item" 
                                onClick={() => openConversation(chat)}
                              >
                                {/* The 'biz' class applies a different style if the contact is a business */}
                                <div className={`chat-avatar ${chat.is_business ? 'biz' : ''}`}>
                                  {chat.name.charAt(0)}
                                </div>
                                <div className="chat-info">
                                  <div className="chat-name">{chat.name}</div>
                                  {/* Shows the latest message content snippet */}
                                  <div className="chat-preview">
                                    {chat.last_message || "No messages yet"}
                                  </div>
                                </div>
                                {chat.unread_count > 0 && (
                                  <span className="unread-badge">{chat.unread_count}</span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="empty-chat-state">
                              <p>Your inbox is empty.</p>
                              <span style={{fontSize: '0.8rem', color: 'gray'}}>Messages with sellers and buyers will appear here.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}


                {/* ===================== CHAT OPEN ===================== */}
                      {view === 'chat-open' && (
                  <div id="view-chat-open" className="view active">
                    <div className="chat-open-shell">
                      <header className="chat-header">
                        <button className="back-btn sm" onClick={() => showView('chat')}>←</button>
                        <div className="chat-header-avatar">
                          {activeChat.name ? activeChat.name.charAt(0) : '?'}
                        </div>
                        <div className="chat-header-info">
                          <div className="chat-header-name">{activeChat.name}</div>
                          <div className="chat-header-status">Online</div>
                        </div>
                      </header>

                      <div className="chat-messages">
                        {messages.map((msg, index) => (
                          <div key={index} className={`msg ${msg.sender === userProfile.id ? 'me' : 'them'}`}>
                            <div className="msg-bubble">
                              {msg.content}
                              <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="chat-input-bar">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button className="send-btn" onClick={sendMessage}>➤</button>
                      </div>
                    </div>
                  </div>
                )}




                {/* ===================== BIZ: ADD PRODUCT ===================== */}
                {view === 'biz-products' && (
                  <div className="view active">
                    <div className="biz-shell">
                      <aside className="biz-sidebar">
                        <div className="logo sm">El<span>Mart</span></div>
                        <nav className="biz-nav">
                          <button className="biz-nav-btn" onClick={() => showView('business-dash')}>📊 Dashboard</button>
                          <button className="biz-nav-btn active">📦 Products</button>
                          <button className="biz-nav-btn" onClick={() => showView('view-store')}>🏪 View Store</button>
                        </nav>
                      </aside>

                      <main className="biz-main">
                        <header className="biz-topbar">
                          <h1 className="biz-page-title">Add New Product</h1>
                          <button className="btn-ghost sm" onClick={() => showView('business-dash')}>Cancel</button>
                        </header>

                        <div className="biz-dash-card" style={{maxWidth: '700px', margin: '20px auto'}}>
                          <div className="form-group">
                            <label>Product Name</label>
                            <input
                              type="text"
                              value={productData.name}
                              onChange={(e) => setProductData({...productData, name: e.target.value})}
                              placeholder="e.g. Samsung Galaxy A55"
                            />
                          </div>

                          <div style={{display: 'flex', gap: '15px'}}>
                            <div className="form-group" style={{flex: 1}}>
                              <label>Price (₦)</label>
                              <input
                                type="number"
                                value={productData.price}
                                onChange={(e) => setProductData({...productData, price: e.target.value})}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="form-group" style={{flex: 1}}>
                              <label>Stock Quantity</label>
                              <input
                                type="number"
                                value={productData.stock}
                                onChange={(e) => setProductData({...productData, stock: e.target.value})}
                                placeholder="1"
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Category</label>
                            <select
                              value={productData.category}
                              onChange={(e) => setProductData({...productData, category: e.target.value})}
                            >
                              <option>Electronics</option>
                              <option>Fashion</option>
                              <option>Home & Office</option>
                              <option>Groceries</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Description</label>
                            <textarea
                              value={productData.description}
                              onChange={(e) => setProductData({...productData, description: e.target.value})}
                              placeholder="Tell customers more about this item..."
                              rows="4"
                            ></textarea>
                          </div>

                          <div className="form-group">
                            <label>Product Media (Images & Video)</label>
                            <div className="media-upload-zone" onClick={() => document.getElementById('media-input').click()}>
                              <div className="upload-icon">📸</div>
                              <p>Click to upload images or video</p>
                              <input
                                type="file"
                                id="media-input"
                                hidden
                                multiple
                                accept="image/*,video/*"
                                onChange={handleMediaChange}
                              />
                            </div>

                            <div className="media-preview-grid">
                              {mediaPreviews.map((url, index) => (
                                <div key={index} className="preview-card">
                                  <img src={url} alt="preview" />
                                  <button type="button" className="remove-btn" onClick={() => removeMedia(index)}>×</button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn-primary"
                            style={{width: '100%', marginTop: '20px'}}
                            onClick={handleAddProduct}
                          >
                            🚀 List Product
                          </button>
                        </div>
                      </main>
                    </div>
                  </div>
                )}


                {/* ===================== BIZ: PRODUCTS & INVENTORY ===================== */}
                {view === 'biz-inventory' && (
                  <div className="view active">
                    <div className="biz-shell">
                      <aside className="biz-sidebar">
                        <div className="logo sm">El<span>Mart</span></div>
                        <nav className="biz-nav">
                          <button className="biz-nav-btn" onClick={() => showView('business-dash')}>📊 Dashboard</button>
                          <button className="biz-nav-btn" onClick={() => showView('biz-products')}>📦 Products</button>
                          <button className="biz-nav-btn active">🗂 Inventory</button>
                          <button className="biz-nav-btn" onClick={() => showView('biz-store')}>🏪 My Store</button>
                        </nav>
                      </aside>

                      <main className="biz-main">
                        <header className="biz-topbar">
                          <h1 className="biz-page-title">📦 Products & Inventory</h1>
                          <button className="btn-primary sm" onClick={() => showView('biz-products')}>+ Add Product</button>
                        </header>

                        <div className="products-table-wrap">
                          <table className="products-table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentProducts && recentProducts.length > 0 ? (
                                recentProducts.map((prod) => (
                                  <tr key={prod.id}>
                                    <td className="prod-name-cell">{prod.name}</td>
                                    <td>General</td>
                                    <td className="prod-price-cell">₦{Number(prod.price).toLocaleString()}</td>
                                    <td>
                                      <span className={`stock-count ${prod.stock < 5 ? 'warn' : 'good'}`}>
                                        {prod.stock} {prod.stock <= 0 ? 'Out of stock' : 'in stock'}
                                      </span>
                                    </td>
                                    <td><button className="btn-ghost xs">Edit</button></td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                    No products found. Click "+ Add Product" to get started.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {showProductModal && (
                          <div className="modal-overlay">
                            <div className="modal-box">
                              <h3>Add New Product</h3>
                              <div className="form-group">
                                <label>Product Name</label>
                                <input
                                  type="text"
                                  value={newProduct.name}
                                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                />
                              </div>
                              <div className="form-group">
                                <label>Price (₦)</label>
                                <input
                                  type="number"
                                  value={newProduct.price}
                                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                />
                              </div>
                              <div className="form-group">
                                <label>Stock Quantity</label>
                                <input
                                  type="number"
                                  value={newProduct.stock}
                                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                                />
                              </div>
                              <div className="modal-actions">
                                <button className="btn-ghost" onClick={() => setShowProductModal(false)}>Cancel</button>
                                <button className="btn-primary" onClick={handleAddProduct}>Save to Digital Shelf</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </main>
                    </div>
                  </div>
                )}


                {/* ===================== BIZ: MY STORE EDITOR ===================== */}
                {view === 'biz-store' && (
                  <div id="view-biz-store" className="view active">
                    <div className="biz-shell">
                      {/* SIDEBAR - Visible on Desktop */}
                      <aside className="biz-sidebar">
                        <div className="logo sm">El<span>Mart</span></div>
                        <nav className="biz-nav">
                          <button className="biz-nav-btn" onClick={() => showView('business-dash')}>📊 Dashboard</button>
                          <button className="biz-nav-btn active" onClick={() => showView('biz-store')}>🏪 My Store</button>
                          <button className="biz-nav-btn" onClick={() => showView('biz-products')}>📦 Products</button>
                          <button className="biz-nav-btn" onClick={() => showView('chat')}>💬 Chats</button>
                        </nav>
                        <button className="btn-ghost sm logout-btn" onClick={() => showView('landing')}>← Log Out</button>
                      </aside>

                      <main className="biz-main">
                        <div className="biz-topbar">
                          <h1 className="biz-page-title">🏪 Store Customizer</h1>
                          <div className="biz-topbar-right">
                            <button className="btn-primary sm" onClick={() => showView('view-store')}>👁 Preview Store</button>
                          </div>
                        </div>

                        <div className="store-editor-grid">
                          {/* LEFT PANEL: THE EDITOR */}
                          <div className="editor-panel">
                            <h3>Branding</h3>
                            <div className="form-group">
                              <label>Store Name</label>
                              <input 
                                type="text" 
                                value={userProfile.business_name || ""} 
                                onChange={(e) => setUserProfile({...userProfile, business_name: e.target.value})}
                                placeholder="Enter business name"
                              />
                            </div>
                            <div className="form-group">
                              <label>Tagline</label>
                              <input 
                                type="text" 
                                value={userProfile.tagline || ""} 
                                onChange={(e) => setUserProfile({...userProfile, tagline: e.target.value})}
                                placeholder="e.g. Your Tech Partner in Lagos"
                              />
                            </div>
                            <div className="form-group">
                              <label>Logo Upload</label>
                              <div className="upload-box">📷 Click to upload logo</div>
                            </div>

                            <h3>Theme Colors</h3>
                            <div className="color-row">
                              <div className="form-group">
                                <label>Primary Color</label>
                                <input type="color" defaultValue="#0A2540" />
                              </div>
                              <div className="form-group">
                                <label>Accent Color</label>
                                <input type="color" defaultValue="#FF6B35" />
                              </div>
                            </div>

                            <h3>Store Info</h3>
                            <div className="form-group">
                              <label>About Your Store</label>
                              <textarea 
                                rows="3" 
                                value={userProfile.description || ""} 
                                onChange={(e) => setUserProfile({...userProfile, description: e.target.value})}
                                placeholder="Tell customers about your business..."
                              ></textarea>
                            </div>

                            <div className="form-check">
                              <input type="checkbox" id="chatbot-on" defaultChecked />
                              <label htmlFor="chatbot-on">Enable Chatbot auto-replies when offline</label>
                            </div>

                            <button className="btn-primary full" onClick={saveStoreSettings}>
                              Save Store Settings
                            </button>
                          </div>

                        {/* RIGHT PANEL: LIVE PREVIEW */}
                        <div className="preview-panel">
                          <h3>Live Preview</h3>
                          <div className="store-preview-frame">
                            <div className="sp-header">
                              {/* Dynamic Logo: Automatically takes the first letter and makes it Uppercase */}
                              <div className="sp-logo-circle">
                                {userProfile.business_name ? userProfile.business_name.charAt(0).toUpperCase() : 'B'}
                              </div>
                              <div className="sp-header-info">
                                <div className="sp-name">{userProfile.business_name || "Your Store Name"}</div>
                                <div className="sp-tagline">{userProfile.tagline || "Your business tagline goes here"}</div>
                                
                                {/* Category Badge - Shows only if a category is selected */}
                                {userProfile.business_category && (
                                  <span className="sp-category-badge" style={{
                                    fontSize: '0.65rem', 
                                    background: 'var(--orange-light)', 
                                    color: 'var(--orange)', 
                                    padding: '2px 8px', 
                                    borderRadius: '10px',
                                    fontWeight: 'bold',
                                    marginTop: '4px',
                                    display: 'inline-block'
                                  }}>
                                    {userProfile.business_category}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* About Section */}
                            <div className="sp-about">
                              {userProfile.description || "Your store description will appear here. Tell customers why they should shop with you!"}
                            </div>

                            {/* Preview Action Buttons */}
                            <div className="sp-actions">
                              <button className="sp-btn" style={{background: '#FF6B35', color: 'white', border: 'none'}}>💬 Chat</button>
                              <button className="sp-btn" style={{background: '#0A2540', color: 'white', border: 'none'}}>📞 Call</button>
                              <button className="sp-btn outline" style={{border: '1px solid #ddd', background: 'none'}}>❤️ Follow</button>
                            </div>
                          </div>
                        </div>
                      </div>  

                        {/* BOTTOM NAV - Visible on Mobile Layout */}
                        <nav className="bottom-nav biz-bottom">
                          <button className={`bnav-btn ${view === 'business-dash' ? 'active' : ''}`} onClick={() => showView('business-dash')}>📊<span>Dash</span></button>
                          <button className={`bnav-btn ${view === 'biz-products' ? 'active' : ''}`} onClick={() => showView('biz-products')}>📦<span>Products</span></button>
                          <button className={`bnav-btn ${view === 'social-feed' ? 'active' : ''}`} onClick={() => showView('social-feed')}>📱<span>Feed</span></button>
                          <button className={`bnav-btn ${view === 'chat' ? 'active' : ''}`} onClick={() => showView('chat')}>💬<span>Chat</span></button>
                          <button className="bnav-btn active" onClick={() => showView('biz-store')}>🏪<span>Store</span></button>
                        </nav>
                      </main>
                    </div>
                  </div>
                )}


                {/* ===================== CUSTOMER HOME ===================== */}
                {/* Unified Social/Home View */}
                    {(view === 'customer-home' || view === 'social-feed') && (
                      <div id="view-home" className="view active">
                        <div className="app-shell">
                          {/* 1. Header (Shared) */}
                         <header className="app-header">
                            <div className="logo sm">El<span>Mart</span></div>
                            
                            <div className="search-group">
                              {/* 1. Main Text Search (Name or Product) */}
                              <div className="search-bar">
                                <input
                                  type="text"
                                  placeholder="What are you looking for?"
                                  onChange={(e) => setSearchData({...searchData, q: e.target.value})}
                                />
                              </div>

                              {/* 2. Location Selector */}
                              <div className="location-picker">
                                <select onChange={(e) => setSearchData({...searchData, location: e.target.value})}>
                                  <option value="">All Nigeria 🇳🇬</option>
                                  <option value="Lagos">Lagos</option>
                                  <option value="Abuja">Abuja</option>
                                  <option value="Port Harcourt">Port Harcourt</option>
                                  <option value="Kano">Kano</option>
                                </select>
                              </div>

                              <button className="search-btn" onClick={handleMultiSearch}>🔍</button>
                            </div>

                            <div className="header-actions">
                              {/* ... your existing chat/notif buttons ... */}
                            </div>
                          

                            <div className="header-actions">
                             {/* In your JSX */}
                              <button className="icon-btn" onClick={() => showView('chat')}>
                                💬
                                {messages.filter(m => !m.is_read).length > 0 && (
                                  <span className="badge">{messages.filter(m => !m.is_read).length}</span>
                                )}
                              </button>

                           <div className="notification-wrapper" style={{ position: 'relative' }}>
                                <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
                                  🔔
                                  {/* Use ?.length to be safe! */}
                                  {notifications?.length > 0 && <span className="badge">!</span>}
                                </button>

                                {isNotifOpen && (
                                  <div className="notif-dropdown">
                                    <h3>Notifications</h3>
                                    {notifications?.length > 0 ? (
                                      notifications.map(n => (
                                        <div key={n.id} className="notif-item">
                                          {n.text}
                                        </div>
                                      ))
                                    ) : (
                                      <p style={{fontSize: '0.8rem', color: '#888'}}>No new updates</p>
                                    )}
                                  </div>
                                )}
                              </div>


                              <div 
                                  className="avatar" 
                                  onClick={() => setIsMenuOpen(true)} 
                                  style={{ cursor: 'pointer' }}
                                >
                                  {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                             </div>

                            </div>
                          </header>

                          {/* 2. Category Bar */}
                          <div className="filter-bar">
                            {['All', 'Electronics', 'Fashion', 'Food', 'Health', 'Agriculture'].map(cat => (
                              <button key={cat} className={`filter-chip ${cat === 'All' ? 'active' : ''}`}>
                                {cat}
                              </button>
                            ))}
                          </div>

                          <main className="main-feed">
                            <div className="feed-left">
                              <div className="section-title">📢 {role === 'business' ? 'Market Network' : 'Latest Posts'}</div>
                              
                              <div id="posts-feed">
                                {posts.length > 0 ? posts.map(post => (
                                  <div className="post-card" key={post.id}>
                                    <div className="post-header">
                                      {/* Using the initials logic we built */}
                                      <div className="post-biz-avatar">{post.business_name.charAt(0).toUpperCase()}</div>
                                      
                                      <div className="post-biz-info">
                                        <div className="post-biz-name" onClick={() => showView('view-store')}>
                                          {post.business_name}
                                          {/* NEW: PRIORITY BADGE */}
                                          {post.is_followed && <span className="following-badge">✅ Following</span>}
                                        </div>
                                        <div className="post-biz-cat">
                                          {post.tagline || 'Business Partner'} • {post.location_state || 'Nigeria'}
                                        </div>
                                      </div>
                                      
                                      {/* Dynamic timestamp from Django */}
                                      <div className="post-time">
                                        {new Date(post.timestamp).toLocaleDateString()}
                                      </div>
                                    </div>

                                    <div className="post-body">
                                      Check out our latest listing: <strong>{post.name}</strong>
                                    </div>
                                    
                                    {/* Product Specific Info */}
                                    <div className="post-product-bar">
                                      <span className="post-price">₦{parseFloat(post.price).toLocaleString()}</span>
                                      <span className="post-stock in">In Stock</span>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="post-actions-bar">
                                      <div className="post-action">❤️ Like</div>
                                      <div className="post-action" onClick={() => openChat(post.business_id)}>💬 Inquire</div>
                                      <div className="post-action">🔗 Share</div>
                                    </div>
                                  </div>
                                )) : (
                                  <p className="empty-msg">Nothing to show yet. Try searching for products above!</p>
                                )}
                              </div>

                            </div>

                            {/* 3. Sidebar (Visible on Desktop) */}
                            <div className="feed-right">
                              <div className="section-title">🏪 Nearby Stores</div>
                              <div id="stores-list">
                                {/* Logic for nearby stores */}
                                <div className="store-card" onClick={() => showView('view-store')}>
                                  <div className="store-card-avatar">FL</div>
                                  <div className="store-card-info">
                                    <div className="store-card-name">FashionHub Lagos</div>
                                    <div className="store-card-meta">Fashion • 1.2km away</div>
                                  </div>
                                </div>
                              </div>

                              <div className="section-title" style={{ marginTop: '20px' }}>🤖 AI Advisor</div>
                                <div className="ai-advisor-box">
                                  {/* This paragraph now shows the AI's actual answer */}
                                  <p style={{ minHeight: '40px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                    {aiResponse || "Ask me about product value, price comparisons, or what to buy!"}
                                  </p>
                                  
                                  <div className="ai-input-row">
                                    <input 
                                      type="text" 
                                      placeholder="e.g. Is ₦45k fair for an iPhone 11?" 
                                      value={aiQuery} // Binds to your state
                                      onChange={(e) => setAiQuery(e.target.value)}
                                      onKeyPress={(e) => e.key === 'Enter' && askAI()} // Ask on 'Enter'
                                    />
                                    <button onClick={askAI}>Ask</button>
                                  </div>
                                </div>

                            </div>
                          </main>

                          {/* 4. DYNAMIC BOTTOM NAV (The "Fix") */}
                          {role === 'business' ? (
                            <nav className="bottom-nav biz-bottom">
                              <button className={`bnav-btn ${view === 'business-dash' ? 'active' : ''}`} onClick={() => showView('business-dash')}>📊<span>Dash</span></button>
                              <button className={`bnav-btn ${view === 'biz-products' ? 'active' : ''}`} onClick={() => showView('biz-products')}>📦<span>Products</span></button>
                              <button className={`bnav-btn ${view === 'social-feed' ? 'active' : ''}`} onClick={() => showView('social-feed')}>📱<span>Feed</span></button>
                              <button className={`bnav-btn ${view === 'chat' ? 'active' : ''}`} onClick={() => showView('chat')}>💬<span>Chat</span></button>
                              <button className={`bnav-btn ${view === 'biz-store' ? 'active' : ''}`} onClick={() => showView('biz-store')}>🏪<span>Store</span></button>
                            </nav>
                          ) : (
                            <nav className="bottom-nav">
                              <button className={`bnav-btn ${view === 'customer-home' ? 'active' : ''}`} onClick={() => showView('customer-home')}>🏠<span>Home</span></button>
                              <button className="bnav-btn">🔍<span>Explore</span></button>
                              <button className={`bnav-btn ${view === 'chat' ? 'active' : ''}`} onClick={() => showView('chat')}>💬<span>Chats</span></button>
                              <button className="bnav-btn">👤<span>Profile</span></button>
                            </nav>
                          )}
                        </div>
                      </div>
                    )}

                    

                </div>
                  
                <div className="chatbot-floating-container">
                  {isOpen && (
                    <div className="chat-window">
                      <div className="chat-header">🤖 El-Mart Advisor</div>
                      <div className="chat-messages">
                        {/* Messages map here */}
                      </div>
                      <div className="chat-input">
                        <input type="text" placeholder="Ask anything..." />
                        <button>Send</button>
                      </div>
                    </div>
                  )}
                  <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '✕' : '🤖'}
                  </button>
                </div>

    </> 
  );
}

export default App;
