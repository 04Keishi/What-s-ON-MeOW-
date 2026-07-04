import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-meow-cream">
      {/* Logo */}
      <div className="mb-8">
        <img
          src="/images/logo.png"
          alt="What's ON MeOW"
          className="h-40 w-auto"
        />
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 px-6">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-meow-dark outline-none focus:border-meow-orange focus:ring-1 focus:ring-meow-orange"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-meow-dark outline-none focus:border-meow-orange focus:ring-1 focus:ring-meow-orange"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-meow-orange py-3 text-sm font-medium text-white hover:bg-meow-orange-dark transition-colors"
        >
          Login
        </button>
        <p className="text-center text-xs text-meow-dark/60">
          Not have an account yet?{" "}
          <span className="underline cursor-pointer text-meow-orange">
            Sign in
          </span>
        </p>
      </form>
    </main>
  );
}
