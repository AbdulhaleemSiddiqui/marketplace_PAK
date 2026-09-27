import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  continueWithGoogleDemo,
  loginUser,
  loginUserByPhone,
  registerUser,
} from "../../services/authService";

import type { User } from "../../types/auth";
import type { UserRole } from "../../types/marketplace";

type AuthMode =
  | "login"
  | "register";

type AuthMethod =
  | "options"
  | "email"
  | "phone";

interface AuthModalProps {
  open: boolean;
  initialMode?: AuthMode;
  initialRole?: UserRole;
  lockRole?: boolean;
  onClose: () => void;
  onAuthenticated: (
    user: User
  ) => void;
}

export default function AuthModal({
  open,
  initialMode = "login",
  initialRole = "buyer",
  lockRole = false,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const [mode, setMode] =
    useState<AuthMode>(
      initialMode
    );

  const [method, setMethod] =
    useState<AuthMethod>(
      "options"
    );

  const [role, setRole] =
    useState<UserRole>(
      initialRole
    );

  const [name, setName] =
    useState("");

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
    if (!open) {
      return;
    }

    setMode(initialMode);
    setMethod("options");
    setRole(initialRole);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setError("");
    setShowPassword(false);
  }, [
    open,
    initialMode,
    initialRole,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      onKeyDown
    );

    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        onKeyDown
      );

      document.body.style.overflow =
        oldOverflow;
    };
  }, [open, onClose]);

  const title = useMemo(() => {
    if (
      method === "email"
    ) {
      return mode === "login"
        ? "Log in with Email"
        : "Sign up with Email";
    }

    if (
      method === "phone"
    ) {
      return mode === "login"
        ? "Log in with Phone"
        : "Sign up with Phone";
    }

    return mode === "login"
      ? "Login to KhojMarket"
      : "Create your account";
  }, [method, mode]);

  if (!open) {
    return null;
  }

  const completeAuth = (
    user: User
  ) => {
    onAuthenticated(user);
    onClose();
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      const user =
        await continueWithGoogleDemo(
          role
        );

      completeAuth(user);
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

  const handleEmailSubmit = async (
    event:
      React.FormEvent
  ) => {
    event.preventDefault();
    setError("");

    if (
      (mode === "register" && !name.trim()) ||
      !email.trim() ||
      !password.trim()
    ) {
      setError(
        mode === "register"
          ? "Name, email aur password required hain."
          : "Email aur password required hain."
      );
      return;
    }

    if (
      mode === "register" &&
      password.length < 8
    ) {
      setError(
        "Password kam az kam 8 characters ka hona chahiye."
      );
      return;
    }

    setLoading(true);

    try {
      const user =
        mode === "login"
          ? await loginUser({
              email,
              password,
              role,
            })
          : await registerUser({
              role,
              name: name.trim(),
              email,
              phone: "",
              password,
            });

      completeAuth(user);
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (
    event:
      React.FormEvent
  ) => {
    event.preventDefault();
    setError("");

    if (
      (mode === "register" && !name.trim()) ||
      !phone.trim() ||
      !password.trim()
    ) {
      setError(
        mode === "register"
          ? "Name, phone number aur password required hain."
          : "Phone number aur password required hain."
      );
      return;
    }

    if (
      mode === "register" &&
      password.length < 8
    ) {
      setError(
        "Password kam az kam 8 characters ka hona chahiye."
      );
      return;
    }

    setLoading(true);

    try {
      const user =
        mode === "login"
          ? await loginUserByPhone({
              phone,
              password,
              role,
            })
          : await registerUser({
              role,
              name: name.trim(),
              email:
                `phone-${phone.replace(/\D/g, "")}@khojmarket.local`,
              phone:
                phone.trim().startsWith("+")
                  ? phone.trim()
                  : `+92${phone.replace(/\D/g, "").replace(/^0/, "")}`,
              password,
            });

      completeAuth(user);
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(
      mode === "login"
        ? "register"
        : "login"
    );

    setMethod("options");
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setError("");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="px-6 pb-7 pt-8 sm:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Sparkles
                size={20}
              />
            </div>

            <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
              {title}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {role === "seller"
                ? "Continue as Seller"
                : "Continue as Buyer"}
            </p>
          </div>

          {!lockRole && (
            <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setRole(
                    "buyer"
                  );
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
                  setRole(
                    "seller"
                  );
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

          {method ===
            "options" && (
            <div className="mt-7 space-y-3">
              <AuthOptionButton
                icon={
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-blue-600">
                    G
                  </span>
                }
                label="Continue with Google"
                onClick={
                  handleGoogle
                }
                disabled={
                  loading
                }
              />

              <AuthOptionButton
                icon={
                  <Phone
                    size={20}
                  />
                }
                label="Continue with Phone"
                onClick={() => {
                  setMethod(
                    "phone"
                  );
                  setError("");
                }}
                disabled={
                  loading
                }
              />

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  or
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <AuthOptionButton
                icon={
                  <Mail
                    size={20}
                  />
                }
                label="Continue with Email"
                onClick={() => {
                  setMethod(
                    "email"
                  );
                  setError("");
                }}
                disabled={
                  loading
                }
              />

              <p className="pt-2 text-center text-sm text-slate-500">
                {mode ===
                "login"
                  ? "Don't have an account?"
                  : "Already registered?"}{" "}
                <button
                  type="button"
                  onClick={
                    switchMode
                  }
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  {mode ===
                  "login"
                    ? "Sign Up"
                    : "Log In"}
                </button>
              </p>
            </div>
          )}

          {method ===
            "email" && (
            <form
              onSubmit={
                handleEmailSubmit
              }
              className="mt-7"
            >
              {mode === "register" && (
                <FormField
                  label="Full name"
                  value={name}
                  placeholder="Enter your name"
                  onChange={setName}
                />
              )}

              <FormField
                label="Email address"
                type="email"
                value={email}
                placeholder="Enter email"
                onChange={
                  setEmail
                }
              />

              <PasswordField
                value={
                  password
                }
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
                disabled={
                  loading
                }
                className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading
                  ? "Please wait..."
                  : mode ===
                      "login"
                    ? "Log In"
                    : "Create Account"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod(
                    "options"
                  );
                  setError("");
                  setPassword("");
                }}
                className="mt-4 w-full text-sm font-bold text-blue-600"
              >
                Use another method
              </button>
            </form>
          )}

          {method ===
            "phone" && (
            <form
              onSubmit={
                handlePhoneSubmit
              }
              className="mt-7"
            >
              {mode === "register" && (
                <FormField
                  label="Full name"
                  value={name}
                  placeholder="Enter your name"
                  onChange={setName}
                />
              )}

              <FormField
                label="Phone number"
                value={phone}
                placeholder="3001234567"
                prefix="+92"
                inputMode="tel"
                onChange={
                  setPhone
                }
              />

              <PasswordField
                value={
                  password
                }
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
                disabled={
                  loading
                }
                className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading
                  ? "Please wait..."
                  : mode ===
                      "login"
                    ? "Log In"
                    : "Create Account"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod(
                    "options"
                  );
                  setError("");
                  setPassword("");
                }}
                className="mt-4 w-full text-sm font-bold text-blue-600"
              >
                Use another method
              </button>
            </form>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center text-xs leading-5 text-slate-500">
          Email aur Phone login real backend/JWT se connected hain. Google login abhi pending hai.
        </div>
      </div>
    </div>
  );
}

function AuthOptionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
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
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-bold text-slate-800">
        {label}
      </label>

      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-500">
        {prefix && (
          <div className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
            🇵🇰&nbsp;
            {prefix}
          </div>
        )}

        <input
          type={type}
          value={value}
          inputMode={
            inputMode
          }
          placeholder={
            placeholder
          }
          onChange={(
            event
          ) =>
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
  onChange: (
    value: string
  ) => void;
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
          placeholder={
            "Enter password"
          }
          onChange={(
            event
          ) =>
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
            <EyeOff
              size={19}
            />
          ) : (
            <Eye
              size={19}
            />
          )}
        </button>
      </div>
    </div>
  );
}
