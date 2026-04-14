import React, { useState } from 'react';
import './index.css';

function App() {
  const [view, setView] = useState('landing');
  const [role, setRole] = useState('customer');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Helper to change views
  const showView = (newView) => setView(newView);

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
            <p className="hero-sub">From Alaba market to Abuja CBD — El-Mart gives every seller a world-class digital storefront.</p>
            <div className="hero-ctas">
              <button className="btn-primary big" onClick={() => { setRole('business'); showView('signup'); }}>Open Your Store</button>
              <button className="btn-outline big" onClick={() => { setRole('customer'); showView('signup'); }}>Shop Now</button>
            </div>
            
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">12k+</span><span>Businesses</span></div>
              <div className="stat"><span className="stat-num">4M+</span><span>Products</span></div>
              <div className="stat"><span className="stat-num">36</span><span>States</span></div>
            </div>
          </section>

          <section className="features-strip">
            <div className="feat"><h3>🏪 Your Own Store</h3><p>Personalized storefront with your branding.</p></div>
            <div className="feat"><h3>💬 Live Chat</h3><p>Real-time talk with buyers.</p></div>
            <div className="feat"><h3>🤖 AI Chatbot</h3><p>Auto-replies keep you open 24/7.</p></div>
          </section>

          <footer className="landing-footer">
            <div className="logo">El<span>Mart</span></div>
            <p>© 2026 El-Mart. Bridging the digital divide.</p>
          </footer>
        </div>
      )}


      {/* ===================== SIGNUP ===================== */}
      {view === 'signup' && (
        <div id="view-signup" className="view active">
          <div className="auth-page">
            <button className="back-btn" onClick={() => showView('landing')}>← Back</button>
            <div className="auth-box">
              <div className="logo center">El<span>Mart</span></div>
              <h2>Create Your Account</h2>
              <div className="role-tabs">
                <button className={`role-tab ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>🛒 Customer</button>
                <button className={`role-tab ${role === 'business' ? 'active' : ''}`} onClick={() => setRole('business')}>🏪 Business Owner</button>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="e.g. Adama Oyemechi" />
              </div>
              {role === 'business' && (
                <div className="form-group">
                  <label>Business / Company Name</label>
                  <input type="text" placeholder="e.g. Okonkwo Electronics Ltd" />
                </div>
              )}
              <button className="btn-primary full" onClick={() => showView('login')}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== LOGIN ===================== */}
      {view === 'login' && (
        <div id="view-login" className="view active">
          <div className="auth-page">
            <button className="back-btn" onClick={() => showView('landing')}>← Back</button>
            <div className="auth-box">
              <h2>Welcome Back</h2>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" />
              </div>
              <button className="btn-primary full" onClick={() => {
                if(role === 'business') showView('business-dash');
                else showView('customer-home');
              }}>Log In</button>
              <div className="login-demos">
                <button className="demo-btn" onClick={() => {setRole('customer'); showView('customer-home')}}>Demo Customer</button>
                <button className="demo-btn" onClick={() => {setRole('business'); showView('business-dash')}}>Demo CEO</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CEO DASHBOARD ===================== */}
      {view === 'business-dash' && (
        <div id="view-business" className="view active">
          <div className="biz-shell">
            <aside className="biz-sidebar">
              <div className="logo sm">El<span>Mart</span></div>
              <div className="biz-ceo">CEO 👑</div>
              <nav className="biz-nav">
                <button className="biz-nav-btn active">📊 Dashboard</button>
                <button className="biz-nav-btn" onClick={() => showView('biz-store')}>🏪 My Store</button>
                <button className="biz-nav-btn">📦 Products</button>
              </nav>
              <button className="btn-ghost sm logout-btn" onClick={() => showView('landing')}>← Log Out</button>
            </aside>
            <main className="biz-main">
               <h1 className="biz-page-title">Dashboard Overview</h1>
               <div className="biz-stats-row">
                  <div className="biz-stat-card"><div className="bstat-val">1,284</div><div className="bstat-lbl">Views</div></div>
                  <div className="biz-stat-card"><div className="bstat-val">312</div><div className="bstat-lbl">Followers</div></div>
               </div>
            </main>
          </div>
        </div>
      )}

      {/* ===================== CUSTOMER HOME ===================== */}
      {view === 'customer-home' && (
        <div id="view-customer" className="view active">
          <div className="app-shell">
            <header className="app-header">
              <div className="logo sm">El<span>Mart</span></div>
              <div className="search-bar">
                <input type="text" placeholder="Search products..." />
              </div>
              <div className="avatar">AO</div>
            </header>
            <div className="main-feed">
               <h2>📢 Latest Posts</h2>
               <p>Welcome to your feed!</p>
            </div>
            <nav className="bottom-nav">
              <button className="bnav-btn active">🏠<span>Home</span></button>
              <button className="bnav-btn" onClick={() => showView('landing')}>👋<span>Exit</span></button>
            </nav>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
