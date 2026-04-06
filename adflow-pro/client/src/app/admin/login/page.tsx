"use client";

import { useState } from "react";
import axios from "axios";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const user = res.data.user;

      // 🔒 Only ADMIN allowed
      if (user.role !== "admin") {
        alert("❌ Access Denied! Only Admin can login here.");
        setLoading(false);
        return;
      }

      // Save token
      localStorage.setItem("token", res.data.token);

      alert("✅ Admin Login Successful");

      // Redirect to admin dashboard
      window.location.href = "/dashboard/admin";

    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-[350px]">
        
        <h2 className="text-2xl font-bold text-center mb-6 text-red-600">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Admin Email"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded"
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>

        <p className="text-center text-sm mt-4">
          Not an admin?{" "}
          <a href="/login" className="text-blue-500">
            User Login
          </a>
        </p>
      </div>
    </div>
  );
}