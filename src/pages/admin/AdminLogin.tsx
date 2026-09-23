import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
  } from "lucide-react";
  import {
    useState,
  } from "react";
  import {
    Navigate,
    useNavigate,
  } from "react-router-dom";
  
  import {
    loginAdmin,
  } from "../../services/adminApiService";
  
  import {
    hasValidAdminSession,
    setAdminSession,
  } from "../../services/adminSession";
  
  export default function AdminLogin() {
    const navigate =
      useNavigate();
  
    const [
      email,
      setEmail,
    ] = useState("");
  
    const [
      password,
      setPassword,
    ] = useState("");
  
    const [
      showPassword,
      setShowPassword,
    ] = useState(false);
  
    const [
      loading,
      setLoading,
    ] = useState(false);
  
    const [
      error,
      setError,
    ] = useState("");
  
    if (
      hasValidAdminSession()
    ) {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }
  
    const handleSubmit =
      async (
        event:
          React.FormEvent<HTMLFormElement>,
      ) => {
        event.preventDefault();
  
        if (
          !email.trim() ||
          !password.trim()
        ) {
          setError(
            "Email aur password required hain.",
          );
  
          return;
        }
  
        try {
          setLoading(true);
          setError("");
  
          const response =
            await loginAdmin(
              email,
              password,
            );
  
          if (
            response.user.role
              .toLowerCase() !==
            "admin"
          ) {
            throw new Error(
              "Is portal mein sirf admin account login kar sakta hai.",
            );
          }
  
          setAdminSession(
            response.token,
            response.user,
          );
  
          navigate(
            "/admin",
            {
              replace: true,
            },
          );
        } catch (exception) {
          setError(
            exception instanceof Error
              ? exception.message
              : "Admin login failed.",
          );
        } finally {
          setLoading(false);
        }
      };
  
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
          <div className="w-full rounded-[30px] border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <ShieldCheck
                  size={27}
                />
              </div>
  
              <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                KhojMarket
              </p>
  
              <h1 className="mt-2 text-2xl font-black text-slate-950">
                Admin Login
              </h1>
  
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Authorized administrators only
              </p>
            </div>
  
            {error && (
              <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}
  
            <form
              onSubmit={
                handleSubmit
              }
              className="mt-7 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email address
                </label>
  
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
  
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target
                          .value,
                      )
                    }
                    placeholder="admin@khojmarket.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>
  
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </label>
  
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
  
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
  
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) =>
                          !value,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>
              </div>
  
              <button
                type="submit"
                disabled={
                  loading
                }
                className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Signing in..."
                  : "Login to Admin"}
              </button>
            </form>
  
            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Admin session marketplace login se completely separate hai.
            </p>
          </div>
        </div>
      </div>
    );
  }
  