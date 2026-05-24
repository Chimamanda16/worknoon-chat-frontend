"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { getUser } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (getUser()) {
      router.push("/chat");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/login", formData);

      localStorage.setItem("userInfo", JSON.stringify(data));

      toast.success("Login successful");

      router.push("/chat");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4"
      >
        <h1 className="text-3xl font-bold text-center">
          Welcome Back
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg"
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg"
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
        />

        <button className="w-full cursor-pointer bg-black text-white p-3 rounded-lg">
          Login
        </button>
        <p>Don&apos;t have an account? <Link className="text-blue-600" href="/register">Register</Link></p>
      </form>
    </div>
  );
}