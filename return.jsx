 return (
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
            
            {/* RESTORED STATS SECTION */}
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">12,000+</span><span>Businesses</span></div>
              <div className="stat"><span className="stat-num">4M+</span><span>Products</span></div>
              <div className="stat"><span className="stat-num">36</span><span>States</span></div>
            </div>
          </section>

          {/* RESTORED FEATURES STRIP */}
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

              {/* SHARED FIELDS (Email, Password, Name) */}
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


              {/* BUSINESS SPECIFIC FIELDS - Only show if role is business */}
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
                
                {/* Email Input */}
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                {/* Password Input with Show/Hide Toggle */}
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
                
                {/* Real Login Button */}
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
                <div className="biz-shell">
                  <aside className="biz-sidebar">
                    <div className="logo sm">El<span>Mart</span></div>
                    <div className="biz-welcome">
                      <div className="biz-welcome-text">Welcome back,</div>
                      {/* DYNAMIC NAME FROM DJANGO */}
                      <div className="biz-ceo">{userProfile?.full_name || "CEO"} 👑</div>
                      <div className="biz-name-disp">{userProfile?.business_name || "My Store"}</div>
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

                  <main className="biz-main">
                    <div className="biz-topbar">
                      <h1 className="biz-page-title">Dashboard Overview</h1>
                      <div className="biz-topbar-right">
                        <button className="btn-primary sm" onClick={() => showView('view-store')}>👁 View My Store</button>
                        {/* DYNAMIC INITIALS FOR AVATAR */}
                        <div className="avatar">{userProfile?.fullName?.charAt(0) || "C"}</div>
                      </div>
                    </div>

                    {/* STATS ROW (These will stay as placeholders until we add the Sales/Views Django logic) */}
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

                {/* THIS IS THE UPDATED CARD */}
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
                      {/* QUICK POST */}
                      <div className="biz-dash-card">
                        <div className="biz-dash-card-title">📢 Quick Post</div>
                        <textarea placeholder={`What's new at ${userProfile?.business_name || 'the store'}?`} rows="3"></textarea>
                        <div className="post-actions-row">
                          <button className="icon-btn" title="Add Image">🖼</button>
                          <button className="icon-btn" title="Add Video">🎬</button>
                          <button className="btn-primary sm">Post</button>
                        </div>
                      </div>



                      {/* RECENT ACTIVITY */}
                      <div className="biz-dash-card">
                        <div className="biz-dash-card-title">🔔 Recent Activity</div>
                        <div className="activity-list">
                          {/* Always show the welcome message first */}
                          <div className="activity-item">
                            <span className="act-icon">✨</span>
                            <span>Welcome to El-Mart, {userProfile?.fullName}!</span>
                            <span className="act-time">Now</span>
                          </div>

                          {/* Map through real products from the database */}
                          {recentProducts && recentProducts.length > 0 ? (
                            recentProducts.map((prod) => (
                              <div className="activity-item" key={prod.id}>
                                <span className="act-icon">📦</span>
                                <span>You listed a new product: <b>{prod.name}</b></span>
                                <span className="act-time">Recent</span>
                              </div>
                            ))
                          ) : (
                            /* Show this only if they haven't uploaded anything yet */
                            <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center'}}>
                              No products listed yet. Your recent uploads will appear here.
                            </p>
                          )}
                        </div>
                      </div>


                      {/* LOW STOCK ALERT (Empty state) */}
                      <div className="biz-dash-card full">
                        <div className="biz-dash-card-title">📦 Inventory Status</div>
                        <div className="low-stock-list">
                          <p style={{textAlign: 'center', padding: '20px', color: 'var(--text-muted)'}}>No products found. Add products to track stock levels.</p>
                        </div>
                      </div>
                    </div>
                  </main>

                  <nav className="bottom-nav biz-bottom">
                    <button className="bnav-btn active" onClick={() => showView('business-dash')}>📊<span>Dash</span></button>
                    <button className="bnav-btn" onClick={() => showView('biz-products')}>📦<span>Products</span></button>
                    <button className="bnav-btn" onClick={() => showView('chat')}>💬<span>Chat</span></button>
                    <button className="bnav-btn" onClick={() => showView('biz-store')}>🏪<span>Store</span></button>
                  </nav>
                </div>
              </div>
            )}

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

                         


      {/* ===================== CHAT VIEW ===================== */}
          {/* 1. CHAT LIST VIEW (The list of people) */}
      {view === 'chat' && (
        <div id="view-chat" className="view active">
          <header className="app-header">
            <button className="back-btn sm" onClick={() => showView('customer-home')}>←</button>
            <h2 style={{flex: 1, fontSize: '1.1rem'}}>Messages</h2>
          </header>
          
          <div className="chat-list">
            <div className="chat-item" onClick={() => { setActiveChat({name: 'Okonkwo Electronics', initials: 'OE'}); showView('chat-open'); }}>
              <div className="chat-avatar biz">OE</div>
              <div className="chat-info">
                <div className="chat-name">Okonkwo Electronics</div>
                <div className="chat-preview">Hi! How can we help you today? 👋</div>
              </div>
            </div>

            <div className="chat-item" onClick={() => { setActiveChat({name: 'FashionHub Lagos', initials: 'FL'}); showView('chat-open'); }}>
              <div className="chat-avatar biz">FL</div>
              <div className="chat-info">
                <div className="chat-name">FashionHub Lagos</div>
                <div className="chat-preview">Your order has been dispatched! 📦</div>
              </div>
            </div>

            <div className="chat-item" onClick={() => { setActiveChat({name: 'Ngozi Adeyemi', initials: 'NA'}); showView('chat-open'); }}>
              <div className="chat-avatar">NA</div>
              <div className="chat-info">
                <div className="chat-name">Ngozi Adeyemi</div>
                <div className="chat-preview">Did you check that electronics store?</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <form className="product-form" onSubmit={handleProductSubmit}>
                    
                    {/* TEXT FIELDS */}
                    <div className="form-group">
                      <label>Product Name</label>
                      <input 
                        type="text" 
                        value={productData.name}
                        onChange={(e) => setProductData({...productData, name: e.target.value})}
                        placeholder="e.g. Samsung Galaxy A55" 
                        required 
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
                          required 
                        />
                      </div>
                      <div className="form-group" style={{flex: 1}}>
                        <label>Stock Quantity</label>
                        <input 
                          type="number" 
                          value={productData.stock}
                          onChange={(e) => setProductData({...productData, stock: e.target.value})}
                          placeholder="1" 
                          required 
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

                    {/* MEDIA UPLOAD SECTION */}
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

                      {/* MEDIA PREVIEW GRID */}
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
                      onClick={handleAddProduct} // <--- Add this!
                    >
                      🚀 List Product
                  </button>

                  </form>
                </div>
              </main>
            </div>
          </div>
        )}

      
       {/* <--- CLOSE CHAT LIST BRACKET HERE */}


      {/* 2. CHAT OPEN VIEW (The actual messaging window) */}
      {view === 'chat-open' && (
        <div id="view-chat-open" className="view active">
          <div className="chat-open-shell">
            <header className="chat-header">
              <button className="back-btn sm" onClick={() => showView('chat')}>←</button>
              <div className="chat-header-avatar">{activeChat.initials}</div>
              <div className="chat-header-info">
                <div className="chat-header-name">{activeChat.name}</div>
                <div className="chat-header-status">Online</div>
              </div>
            </header>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`msg ${msg.sender}`}>
                  <div className="msg-bubble">{msg.text}</div>
                </div>
              ))}
            </div>

            <div className="chat-input-bar">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button className="send-btn" onClick={() => {
                if(chatInput.trim()) {
                  setMessages([...messages, { sender: 'me', text: chatInput, time: 'Now' }]);
                  setChatInput('');
                }
              }}>➤</button>
            </div>
          </div>
        </div>
      )} {/* <--- CLOSE CHAT OPEN BRACKET HERE */}




             {/* ===================== CUSTOMER HOME ===================== */}
      {view === 'customer-home' && (
        <div id="view-customer" className="view active">
          <div className="app-shell">
            <header className="app-header">
              <div className="logo sm">El<span>Mart</span></div>
              <div className="search-bar">
                <input 
                  type="text" 
                  id="search-input" 
                  placeholder="Search products, stores, categories..." 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <button className="search-btn">🔍</button>
              </div>
              <div className="header-actions">
                <button className="icon-btn" onClick={() => showView('chat')}>
                  💬<span className="badge">3</span>
                </button>
                <button className="icon-btn">🔔<span className="badge">5</span></button>
                <div className="avatar" onClick={() => showView('landing')}>AO</div>
              </div>
            </header>

            <div className="filter-bar">
              {['All', 'Electronics', 'Fashion', 'Food', 'Health', 'Agriculture', 'Furniture', 'Autos'].map(cat => (
                <button 
                  key={cat} 
                  className={`filter-chip ${cat === 'All' ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <main className="main-feed">
              <div className="feed-left">
                {/* Social Feed */}
                <div className="section-title">📢 Latest Posts</div>
                <div id="posts-feed">
                  {/* Example Post Card */}
                  <div className="post-card">
                    <div className="post-header">
                      <div className="post-biz-avatar">OE</div>
                      <div className="post-biz-info">
                        <div className="post-biz-name" onClick={() => showView('view-store')}>Okonkwo Electronics</div>
                        <div className="post-biz-cat">Electronics • Lagos</div>
                      </div>
                      <div className="post-time">2m ago</div>
                    </div>
                    <div className="post-body">
                      Just arrived! The new iPhone 15 Pro Max is now available in Titanium Black and Natural Titanium. Limited stock available.
                    </div>
                    <div className="post-img">📱</div>
                    <div className="post-product-bar">
                      <span className="post-price">₦1,250,000</span>
                      <span className="post-stock in">In Stock</span>
                    </div>
                    <div className="post-actions-bar">
                      <div className="post-action">❤️ Like</div>
                      <div className="post-action" onClick={() => showView('chat-open')}>💬 Inquire</div>
                      <div className="post-action">🔗 Share</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="feed-right">
                <div className="section-title">🏪 Nearby Stores</div>
                <div id="stores-list">
                  {/* Example Store Card */}
                  <div className="store-card" onClick={() => showView('view-store')}>
                    <div className="store-card-avatar">FL</div>
                    <div className="store-card-info">
                      <div className="store-card-name">FashionHub Lagos</div>
                      <div className="store-card-meta">Fashion • 1.2km away</div>
                    </div>
                    <span className="store-card-badge badge-retail">Retail</span>
                  </div>
                </div>

                <div className="section-title" style={{ marginTop: '20px' }}>🤖 AI Advisor</div>
                <div className="ai-advisor-box">
                  <p>Ask me about product value, price comparisons, or what to buy!</p>
                  <div className="ai-input-row">
                    <input type="text" id="ai-input" placeholder="e.g. Is ₦45,000 fair for an iPhone 11?" />
                    <button>Ask</button>
                  </div>
                  <div id="ai-response"></div>
                </div>
              </div>
            </main>

            <nav className="bottom-nav">
              <button className="bnav-btn active" onClick={() => showView('customer-home')}>🏠<span>Home</span></button>
              <button className="bnav-btn" onClick={() => showView('explore')}>🔍<span>Explore</span></button>
              <button className="bnav-btn" onClick={() => showView('chat')}>💬<span>Chats</span></button>
              <button className="bnav-btn">👤<span>Profile</span></button>
            </nav>
          </div>
        </div>
      )}

            {/* ===================== STORE CUSTOMIZER ===================== */}
            {/* ===================== BIZ: MY STORE EDITOR ===================== */}
      {view === 'biz-store' && (
        <div id="view-biz-store" className="view active">
          <div className="biz-shell">
            <aside className="biz-sidebar">
              <div className="logo sm">El<span>Mart</span></div>
              <nav className="biz-nav">
                <button className="biz-nav-btn" onClick={() => showView('business-dash')}>📊 Dashboard</button>
                <button className="biz-nav-btn active">🏪 My Store</button>
                <button className="biz-nav-btn" onClick={() => showView('biz-products')}>📦 Products</button>
                <button className="biz-nav-btn" onClick={() => showView('chat')}>💬 Chats</button>
              </nav>
              <button className="btn-ghost sm logout-btn" onClick={() => showView('landing')}>← Log Out</button>
            </aside>

            <main className="biz-main">
              <div className="biz-topbar">
                <h1 className="biz-page-title">🏪 Store Customizer</h1>
                <div className="biz-topbar-right">
                  <button className="btn-primary sm">👁 Preview Store</button>
                </div>
              </div>

              <div className="store-editor-grid">
                <div className="editor-panel">
                  <h3>Branding</h3>
                  <div className="form-group">
                    <label>Store Name</label>
                    <input type="text" defaultValue="Okonkwo Electronics" />
                  </div>
                  <div className="form-group">
                    <label>Tagline</label>
                    <input type="text" defaultValue="Your Tech Partner in Lagos" />
                  </div>
                  <div className="form-group">
                    <label>Logo Upload</label>
                    <div className="upload-box">📷 Click to upload logo</div>
                  </div>
                  <div className="form-group">
                    <label>Cover Image</label>
                    <div className="upload-box wide">🖼 Upload store banner</div>
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
                    <textarea rows="3" defaultValue="Trusted electronics dealer in Lagos since 2015. Quality guaranteed."></textarea>
                  </div>
                  
                  <div className="form-check">
                    <input type="checkbox" id="chatbot-on" defaultChecked />
                    <label htmlFor="chatbot-on">Enable Chatbot auto-replies when offline</label>
                  </div>
                  
                  <button className="btn-primary full">Save Store Settings</button>
                </div>

                {/* LIVE PREVIEW PANEL */}
                <div className="preview-panel">
                  <h3>Live Preview</h3>
                  <div className="store-preview-frame">
                    <div className="sp-header">
                      <div className="sp-logo-circle">OE</div>
                      <div>
                        <div className="sp-name">Okonkwo Electronics</div>
                        <div className="sp-tagline">Your Tech Partner in Lagos</div>
                      </div>
                    </div>
                    <div className="sp-about">Trusted electronics dealer in Lagos since 2015. Quality guaranteed.</div>
                    <div className="sp-actions">
                      <button className="sp-btn" style={{background: '#FF6B35'}}>💬 Chat</button>
                      <button className="sp-btn" style={{background: '#0A2540'}}>📞 Call</button>
                      <button className="sp-btn outline">❤️ Follow</button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
            {/* ===================== BIZ: PRODUCTS & INVENTORY ===================== */}
        <div className="products-table-wrap">
          {/* THE OPENING TABLE TAG IS HERE */}
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
              </div> {/* Closes products-table-wrap */}

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
    </div> 
  );
}
const askAI = () => {
    const responseDiv = document.getElementById('ai-response');
    responseDiv.innerText = "AI is thinking... (Connecting to Django)";
    // Later, we will use Axios here to talk to your Django AI script
  };
  