import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage1.css";

const Homepage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect logged-in users to their dashboard
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) {
      switch(user.role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "teacher":
          navigate("/teacher", { replace: true });
          break;
        case "student":
          navigate("/student", { replace: true });
          break;
        case "faculty":
          navigate("/faculty", { replace: true });
          break;
        case "librarian":
          navigate("/librarian", { replace: true });
          break;
        default:
          break;
      }
    }
  }, [navigate]);

  return (
    <div className="universe">
      <div className="stars"></div>
      
      {/* Navigation Bar */}
      <nav className="cosmic-navbar">
        <div className="logo">
          <span className="logo-icon">📌</span>
          <span className="logo-text">Digital Notice Board</span>
        </div>
        <ul className="nav-links">
          <li>
            <button 
              type="button"
              onClick={() => {navigate("/login")}} 
              className="cosmic-btn login-btn"
            >
              Login
            </button>
          </li>
          <li>
            <button 
              type="button"
              onClick={() => {navigate("/register")}} 
              className="cosmic-btn signup-btn"
            >
              Sign Up
            </button>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="cosmic-hero">
        <div className="floating-card hero-content">
          <h1 className="neon-title">Empowering Digital Communication</h1>
          <p className="cosmic-subtitle">A modern solution for managing notices efficiently.</p>
          <button 
            type="button"
            onClick={() => {navigate("/register")}} 
            className="cosmic-btn get-started-btn"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="cosmic-features">
        <h2 className="section-heading">Why Choose Our Notice Board?</h2>
        <div className="feature-galaxy">
          <div className="feature-card">
            <div className="feature-icon">📢</div>
            <div className="feature-text">Instant Updates</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <div className="feature-text">Secure & Reliable</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔎</div>
            <div className="feature-text">Smart Filters</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;