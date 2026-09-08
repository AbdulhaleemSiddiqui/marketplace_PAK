import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  continueWithGoogleDemo,
  loginUser,
  loginUserByPhone,
} from "../services/authService";
import { getPendingRequirement } from "../services/requirementService";
import type { UserRole } from "../types/marketplace";

type LoginMethod =
  | "options"
  | "email"
  | "phone";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();

  const forcedRoleParam =
    searchParams.get("role");

  const forcedRole:
    UserRole | null =
    forcedRoleParam === "buyer" ||
    forcedRoleParam === "seller"
      ? forcedRoleParam
      : null;

  const returnUrl =
    searchParams.get("returnUrl");

  const [role, setRole] =
    useState<UserRole>(
      forcedRole ?? "buyer"
    );

  const [method, setMethod] =
    useState<LoginMethod>("options");

  const [email, setEmail] =
    useState("");
  const [phone, setPhone] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (forcedRole) {
      setRole(forcedRole);
    }
  }, [forcedRole]);

  const registerUrl =
    useMemo(() => {
      const params =
        new URLSearchParams();

      params.set("role", role);

      if (returnUrl) {
        params.set(
          "returnUrl",
          returnUrl
        );
      }

      return `/register?${params.toString()}`;
    }, [returnUrl, role]);

  const finishLogin = (
    userRole: UserRole
  ) => {
    const pending =
      getPendingRequirement();

    if (
      userRole === "buyer" &&
      pending
    ) {
      navigate(
        "/?resumeRequirement=true",
        { replace: true }
      );
      return;
    }

    if (returnUrl) {
      navigate(returnUrl, {
        replace: true,
      });
      return;
    }

    navigate("/profile", {
      replace: true,
    });
  };

  const handleEmailLogin = (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    setError("");

    if (
      !email.trim() ||
      !password.trim()
    ) {
      setError(
        "Email aur password required hain."
      );
      return;
    }

    setLoading(true);

    try {
      const user = loginUser({
        email,
        password,
        role,
      });

      finishLogin(user.role);
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

  const handlePhoneLogin = (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    setError("");

    if (
      !phone.trim() ||
      !password.trim()
    ) {
      setError(
        "Phone number aur password required hain."
      );
      return;
    }

    setLoading(true);

    try {
      const user =
        loginUserByPhone({
          phone,
          password,
          role,
        });

      finishLogin(user.role);
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

  const handleGoogleLogin = () => {
    setError("");
    setLoading(true);

    try {
      const user =
        continueWithGoogleDemo(role);

      finishLogin(user.role);
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Google sign-in failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetMethod = () => {
    setError("");
    setPassword("");
    setMethod("options");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-5 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft size={17} />
            Back
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-65px)] items-start justify-center px-4 py-8 sm:items-center">
        <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="px-6 pb-7 pt-8 sm:px-8">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Sparkles size={20} />
              </div>

              <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                {method === "email"
                  ? "Log in with Email"
                  : method === "phone"
                    ? "Log in with Phone"
                    : "Login to KhojMarket"}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {role === "seller"
                  ? "Continue as Seller"
                  : "Continue as Buyer"}
              </p>
            </div>

            {!forcedRole && (
              <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setRole("buyer");
                    setError("");
                  }}
                  className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                    role === "buyer"
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Buyer
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole("seller");
                    setError("");
                  }}
                  className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                    role === "seller"
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Seller
                </button>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {method === "options" && (
              <div className="mt-7 space-y-3">
                <AuthOptionButton
                  icon={
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-blue-600">
                      G
                    </span>
                  }
                  label="Continue with Google"
                  onClick={
                    handleGoogleLogin
                  }
                  disabled={loading}
                />

                <AuthOptionButton
                  icon={<Phone size={20} />}
                  label="Continue with Phone"
                  onClick={() => {
                    setError("");
                    setMethod("phone");
                  }}
                  disabled={loading}
                />

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    or
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <AuthOptionButton
                  icon={<Mail size={20} />}
                  label="Continue with Email"
                  onClick={() => {
                    setError("");
                    setMethod("email");
                  }}
                  disabled={loading}
                />

                <p className="pt-2 text-center text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link
                    to={registerUrl}
                    className="font-bold text-blue-600 hover:text-blue-700"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            )}

            {method === "email" && (
              <form
                onSubmit={
                  handleEmailLogin
                }
                className="mt-7"
              >
                <FormField
                  label="Email address"
                  type="email"
                  value={email}
                  placeholder="Enter email"
                  onChange={setEmail}
                />

                <PasswordField
                  value={password}
                  showPassword={
                    showPassword
                  }
                  setShowPassword={
                    setShowPassword
                  }
                  onChange={
                    setPassword
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading
                    ? "Logging In..."
                    : "Log In"}
                </button>

                <button
                  type="button"
                  onClick={resetMethod}
                  className="mt-4 w-full text-sm font-bold text-blue-600"
                >
                  Use another method
                </button>
              </form>
            )}

            {method === "phone" && (
              <form
                onSubmit={
                  handlePhoneLogin
                }
                className="mt-7"
              >
                <FormField
                  label="Phone number"
                  value={phone}
                  placeholder="3001234567"
                  prefix="+92"
                  inputMode="tel"
                  onChange={setPhone}
                />

                <PasswordField
                  value={password}
                  showPassword={
                    showPassword
                  }
                  setShowPassword={
                    setShowPassword
                  }
                  onChange={
                    setPassword
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading
                    ? "Logging In..."
                    : "Log In"}
                </button>

                <button
                  type="button"
                  onClick={resetMethod}
                  className="mt-4 w-full text-sm font-bold text-blue-600"
                >
                  Use another method
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center text-xs leading-5 text-slate-500">
            Demo authentication is stored locally. Real Google OAuth, OTP and secure backend authentication will be connected in the backend phase.
          </div>
        </div>
      </main>
    </div>
  );
}

function AuthOptionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 transition hover:border-slate-950 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon}
      {label}
    </button>
  );
}

function FormField({
  label,
  type = "text",
  value,
  placeholder,
  prefix,
  inputMode,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  placeholder: string;
  prefix?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-bold text-slate-800">
        {label}
      </label>

      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-500">
        {prefix && (
          <div className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
            🇵🇰&nbsp;{prefix}
          </div>
        )}

        <input
          type={type}
          value={value}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="min-w-0 flex-1 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

function PasswordField({
  value,
  showPassword,
  setShowPassword,
  onChange,
}: {
  value: string;
  showPassword: boolean;
  setShowPassword: (
    value: boolean
  ) => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-800">
        Password
      </label>

      <div className="flex rounded-xl border border-slate-200 bg-white focus-within:border-blue-500">
        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={value}
          placeholder="Enter password"
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="min-w-0 flex-1 rounded-l-xl px-4 py-3.5 text-sm outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(
              !showPassword
            )
          }
          className="px-4 text-slate-500"
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
        >
          {showPassword ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>
      </div>
    </div>
  );
}
