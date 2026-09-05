import {
    ArrowLeft,
    BriefcaseBusiness,
    ShoppingBag,
    Sparkles,
  } from "lucide-react";
  
  import {
    useState,
  } from "react";
  
  import {
    Link,
    useNavigate,
  } from "react-router-dom";
  
  import {
    loginUser,
  } from "../services/authService";
  
  import {
    getPendingRequirement,
  } from "../services/requirementService";
  
  import type {
    UserRole,
  } from "../types/marketplace";
  
  export default function Login() {
    const navigate =
      useNavigate();
  
    const [
      role,
      setRole,
    ] =
      useState<UserRole>(
        "buyer"
      );
  
    const [
      email,
      setEmail,
    ] = useState("");
  
    const [
      password,
      setPassword,
    ] = useState("");
  
    const [
      error,
      setError,
    ] = useState("");
  
    const [
      loading,
      setLoading,
    ] = useState(false);
  
    const handleLogin = (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();
  
      setError("");
  
      if (
        !email.trim() ||
        !password.trim()
      ) {
        setError(
          "Email aur password enter karein."
        );
  
        return;
      }
  
      setLoading(true);
  
      try {
        const user =
          loginUser({
            email,
  
            password,
  
            role,
          });
  
        // -------------------------------------
        // BUYER PENDING REQUIREMENT
        // -------------------------------------
  
        const pending =
          getPendingRequirement();
  
        if (
          user.role ===
            "buyer" &&
          pending
        ) {
          navigate(
            "/?resumeRequirement=true"
          );
  
          return;
        }
  
        // -------------------------------------
        // NORMAL LOGIN
        // -------------------------------------
  
        navigate(
          "/profile"
        );
      } catch (exception) {
        setError(
          exception instanceof Error
            ? exception.message
            : "Login failed."
        );
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen bg-slate-50">
        {/* HEADER */}
  
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-semibold text-slate-600"
            >
              <ArrowLeft
                size={17}
              />
  
              Back
            </Link>
          </div>
        </header>
  
        {/* LOGIN */}
  
        <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            {/* LOGO */}
  
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Sparkles
                  size={22}
                />
              </div>
  
              <h1 className="mt-5 text-3xl font-black text-slate-950">
                Welcome back
              </h1>
  
              <p className="mt-2 text-sm text-slate-500">
                Login to your
                KhojMarket account
              </p>
            </div>
  
            <form
              onSubmit={
                handleLogin
              }
              className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              {/* ROLE */}
  
              <p className="text-sm font-bold text-slate-800">
                Login as
              </p>
  
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setRole(
                      "buyer"
                    )
                  }
                  className={`
                    rounded-2xl
                    border
                    p-4
                    text-left
                    transition
  
                    ${
                      role ===
                      "buyer"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }
                  `}
                >
                  <ShoppingBag
                    size={20}
                    className={
                      role ===
                      "buyer"
                        ? "text-blue-600"
                        : "text-slate-400"
                    }
                  />
  
                  <p className="mt-3 font-bold">
                    Buyer
                  </p>
  
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Mujhe koi
                    product/service
                    chahiye
                  </p>
                </button>
  
                <button
                  type="button"
                  onClick={() =>
                    setRole(
                      "seller"
                    )
                  }
                  className={`
                    rounded-2xl
                    border
                    p-4
                    text-left
                    transition
  
                    ${
                      role ===
                      "seller"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }
                  `}
                >
                  <BriefcaseBusiness
                    size={20}
                    className={
                      role ===
                      "seller"
                        ? "text-blue-600"
                        : "text-slate-400"
                    }
                  />
  
                  <p className="mt-3 font-bold">
                    Seller
                  </p>
  
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Main products /
                    services offer
                    karta hoon
                  </p>
                </button>
              </div>
  
              {/* ERROR */}
  
              {error && (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}
  
              {/* EMAIL */}
  
              <div className="mt-6">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email
                </label>
  
                <input
                  type="email"
                  value={email}
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    role ===
                    "buyer"
                      ? "buyer@example.com"
                      : "seller@example.com"
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>
  
              {/* PASSWORD */}
  
              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </label>
  
                <input
                  type="password"
                  value={
                    password
                  }
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>
  
              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-600 disabled:bg-slate-400"
              >
                {loading
                  ? "Signing in..."
                  : `Sign In as ${
                      role ===
                      "buyer"
                        ? "Buyer"
                        : "Seller"
                    }`}
              </button>
  
              <p className="mt-6 text-center text-sm text-slate-500">
                Don't have an
                account?{" "}
  
                <Link
                  to="/register"
                  className="font-bold text-blue-600"
                >
                  Register
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    );
  }