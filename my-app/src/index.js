import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import axios from "axios";

// Configure axios to include org code and token headers
const setupAxios = () => {
  const orgCode = localStorage.getItem("orgCode");
  const token = localStorage.getItem("token");
  
  if (orgCode) {
    axios.defaults.headers.common["X-Org-Code"] = orgCode;
  }
  
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

setupAxios();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
