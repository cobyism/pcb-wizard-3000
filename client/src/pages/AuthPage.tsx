import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | undefined>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/auth/${mode}`, { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/boards");
    } catch (e: any) {
      setErr(e.response?.data?.error || "Unknown error");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8 p-8 mx-auto max-w-lg">
        <h2 className="text-2xl font-bold">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>

        {err && <div className="text-red-500">{err}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-2">
              {mode === "login" ? "Login" : "Sign Up"} with your email
            </label>
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-600 rounded-md p-2 mb-4"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold mb-2">
              {mode === "login" ? "Password" : "Create a password"}
            </label>
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-600 rounded-md p-2 mb-4"
            />
          </div>

          <div>
            <button
              type="submit"
              className="inline-block px-4 py-2 bg-purple-500 rounded-full hover:bg-purple-700 font-bold cursor-pointer"
            >
              {mode === "login" ? "Login" : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="flex flex-row items-center mt-4 gap-2">
          <div className=" text-gray-500">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </div>
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className=" cursor-pointer"
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </div>
      </div>
    </>
  );
}
