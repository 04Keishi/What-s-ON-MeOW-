import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, DEMO_CREDENTIALS } from "@/context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // If already signed in, skip the login screen.
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    const result = login(username, password);
    if (result.ok) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.error ?? "Login failed.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-meow-cream px-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo + tagline */}
        <div className="mb-6 flex flex-col items-center">
          <img
            src="/images/logo.png"
            alt="What's ON MeOW"
            className="h-32 w-auto"
          />
          <p className="mt-2 text-sm text-meow-dark/60">
            Know how your cat is doing, anytime.
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-[24px] bg-white p-6 shadow-sm"
          noValidate
        >
          <input
            type="text"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError("");
            }}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-meow-dark outline-none transition-colors focus:border-meow-orange focus:ring-1 focus:ring-meow-orange"
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-meow-dark outline-none transition-colors focus:border-meow-orange focus:ring-1 focus:ring-meow-orange"
          />

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-meow-orange py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-meow-orange-dark hover:shadow-md active:scale-[0.99]"
          >
            Login
          </button>

          {/* Demo credential hint */}
          <div className="rounded-xl bg-meow-cream/70 px-4 py-2.5 text-center text-[11px] text-meow-dark/60">
            Demo login use username <span className="font-semibold">{DEMO_CREDENTIALS.username}</span>,
            password <span className="font-semibold">{DEMO_CREDENTIALS.password}</span>
          </div>

          <p className="text-center text-xs text-meow-dark/60">
            Not have an account yet?{" "}
            <span className="cursor-pointer text-meow-orange underline">
              Sign in
            </span>
          </p>
        </form>
      </div>
    </main>
  );
}
