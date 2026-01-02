import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Loginpage.css";

const Login = ({ setUserRole }) => {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const tempEmail = sessionStorage.getItem("tempEmail");
    const tempPassword = sessionStorage.getItem("tempPassword");
    const tempRole = sessionStorage.getItem("tempRole");
    
    if (tempEmail) {
      setEmail(tempEmail);
      setPassword(tempPassword);
      setRole(tempRole);
      sessionStorage.clear();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate inputs
    if ((!email && !registrationNumber) || !password) {
      setError("Please provide the required information.");
      setLoading(false);
      return;
    }

    try {
      const payload = { password, role };
      
      if (email) payload.email = email;
      if (registrationNumber) payload.registrationNumber = registrationNumber;

      const res = await axios.post("http://localhost:5000/login", payload);

      // Store auth data including org info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("org", JSON.stringify(res.data.org));
      localStorage.setItem("orgCode", res.data.org.orgCode);
      
      // Update app state
      if (setUserRole) {
        setUserRole(res.data.user.role);
      }

      // Redirect based on role with replace to prevent back button issues
      switch (res.data.user.role) {
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
          navigate("/", { replace: true });
          break;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "❌ Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button className="back-button" onClick={() => navigate("/")}>← Back</button>
      <div 
        className="demo-link-floating"
        onClick={() => navigate("/credentials")}
      >
        <span>👉 Need test credentials? Click here! 👈</span>
      </div>
      <div className="login-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Registration Number (Optional)"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={!registrationNumber}
          />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value.toLowerCase())}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="signup-link">
          Don't have an account? <span onClick={() => navigate("/register")}>Sign Up</span>
        </p>
        <p className="signup-link" style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          Need test credentials? <span onClick={() => navigate("/credentials")} style={{ color: '#22d3ee' }}>View Demo Accounts</span>
        </p>
      </div>
    </div>
  );
};

export default Login;