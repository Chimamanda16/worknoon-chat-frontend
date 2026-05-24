"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/register", formData);

      localStorage.setItem("userInfo", JSON.stringify(data));

      toast.success("Account created");

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
          Create Account
        </h1>

        <input
          type="text"
          placeholder="Name"
          className="w-full border p-3 rounded-lg"
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
        />

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

        <select
          className="w-full border p-3 rounded-lg"
          onChange={(e) =>
            setFormData({
              ...formData,
              role: e.target.value,
            })
          }
        >
          <option value="customer">Customer</option>
          <option value="designer">Designer</option>
          <option value="merchant">Merchant</option>
          <option value="agent">Agent</option>
        </select>

        <button className="w-full cursor-pointer bg-black text-white p-3 rounded-lg">
          Register
        </button>
        <p>Already have an account? <Link className="text-blue-600" href="/login">Login</Link></p>
      </form>
    </div>
  );
}