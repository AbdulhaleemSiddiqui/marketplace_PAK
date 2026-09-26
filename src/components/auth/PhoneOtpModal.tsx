import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  refreshCurrentUser,
} from "../../services/authService";

import {
  sendPhoneOtp,
  verifyPhoneOtp,
} from "../../services/otpService";

import type {
  User,
} from "../../types/auth";

interface PhoneOtpModalProps {
  open: boolean;
  phone: string;
  onClose: () => void;
  onVerified: (user: User) => void;
}

export default function PhoneOtpModal({
  open,
  phone,
  onClose,
  onVerified,
}: PhoneOtpModalProps) {
  const [otp, setOtp] = useState("");
  const [developmentOtp, setDevelopmentOtp] =
    useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] =
    useState(false);
  const [verifying, setVerifying] =
    useState(false);
  const [sent, setSent] =
    useState(false);

  const busy = useRef(false);
  const completed = useRef(false);
  const autoSendStarted = useRef(false);

  const sendOtp = async () => {
    if (
      busy.current ||
      completed.current
    ) {
      return;
    }

    if (!phone?.trim()) {
      setError(
        "Account ke sath phone number registered nahi hai.",
      );
      return;
    }

    busy.current = true;
    setSending(true);
    setError("");
    setMessage("");
    setDevelopmentOtp("");
    setOtp("");

    try {
      /*
       * Backend now uses the registered
       * account phone. We still send the
       * current phone for compatibility
       * with the existing DTO.
       */
      const response =
        await sendPhoneOtp(phone);

      setSent(true);

      setDevelopmentOtp(
        response.developmentOtp ?? "",
      );

      setMessage(
        response.message ??
          "OTP sent successfully.",
      );
    } catch (exception) {
      setSent(false);

      setError(
        exception instanceof Error
          ? exception.message
          : "OTP send nahi ho saka.",
      );
    } finally {
      busy.current = false;
      setSending(false);
    }
  };

  /*
   * Every fresh modal opening automatically
   * sends OTP once.
   */
  useEffect(() => {
    if (!open) {
      autoSendStarted.current = false;
      completed.current = false;
      busy.current = false;

      setOtp("");
      setDevelopmentOtp("");
      setError("");
      setMessage("");
      setSent(false);
      setSending(false);
      setVerifying(false);

      return;
    }

    if (
      autoSendStarted.current ||
      !phone?.trim()
    ) {
      return;
    }

    autoSendStarted.current = true;

    void sendOtp();
  }, [open, phone]);

  if (!open) {
    return null;
  }

  const verify = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (
      busy.current ||
      completed.current
    ) {
      return;
    }

    if (!sent) {
      setError(
        "Pehle OTP send hone dein.",
      );
      return;
    }

    const code = otp.trim();

    if (
      code.length !== 6 ||
      !/^\d{6}$/.test(code)
    ) {
      setError(
        "6 digit OTP enter karein.",
      );
      return;
    }

    busy.current = true;
    setVerifying(true);
    setError("");

    try {
      await verifyPhoneOtp(code);

      const user =
        await refreshCurrentUser();

      if (!user.phoneVerified) {
        throw new Error(
          "Phone verification confirm nahi hui. Please try again.",
        );
      }

      completed.current = true;

      /*
       * Parent should close modal and resume
       * the pending requirement action.
       */
      onVerified(user);
    } catch (exception) {
      /*
       * Important:
       * completed remains false.
       * Therefore after an invalid OTP,
       * user can enter the correct OTP
       * without reopening the modal.
       */
      setError(
        exception instanceof Error
          ? exception.message
          : "OTP verify nahi ho saka.",
      );
    } finally {
      busy.current = false;
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={() => {
            if (!busy.current) {
              onClose();
            }
          }}
          disabled={
            sending || verifying
          }
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ShieldCheck size={24} />
        </div>

        <h2 className="mt-5 text-2xl font-black text-slate-950">
          Verify Phone
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          OTP registered number{" "}
          <span className="font-bold text-slate-800">
            {phone}
          </span>{" "}
          par send hoga.
        </p>

        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-slate-800">
            Registered phone number
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">
            {phone ||
              "No phone registered"}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Verification ke waqt phone
            number change nahi kiya ja
            sakta.
          </p>
        </div>

        {sending && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            <Loader2
              size={18}
              className="animate-spin"
            />
            OTP sending...
          </div>
        )}

        {message && (
          <div className="mt-5 flex gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {developmentOtp && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Development OTP:{" "}
            <span className="font-black tracking-[0.2em]">
              {developmentOtp}
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={verify}
          className="mt-6"
        >
          <label className="mb-2 block text-sm font-bold text-slate-800">
            6 digit OTP
          </label>

          <input
            value={otp}
            onChange={(event) => {
              setOtp(
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6),
              );

              /*
               * Clear old "Invalid OTP"
               * while user types new code.
               */
              if (error) {
                setError("");
              }
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6 digit code"
            disabled={
              !sent ||
              sending ||
              verifying
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-center text-xl font-black tracking-[0.35em] outline-none focus:border-blue-500 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={
              verifying ||
              sending ||
              !sent ||
              otp.length !== 6
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {verifying && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}

            {verifying
              ? "Verifying..."
              : "Verify Phone"}
          </button>

          <button
            type="button"
            disabled={
              sending || verifying
            }
            onClick={() =>
              void sendOtp()
            }
            className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:text-slate-400"
          >
            {sending
              ? "Sending..."
              : "Resend OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}