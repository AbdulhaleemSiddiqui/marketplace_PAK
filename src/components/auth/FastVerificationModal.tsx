import {
    CheckCircle2,
    MessageSquareText,
    Phone,
    ShieldCheck,
    X,
  } from "lucide-react";
  
  import { useState } from "react";
  
  interface Props {
    open: boolean;
    phone: string;
    onClose: () => void;
    onVerified: () => void;
  }
  
  export default function FastVerificationModal({
    open,
    phone,
    onClose,
    onVerified,
  }: Props) {
    const [otp, setOtp] =
      useState("");
  
    const [error, setError] =
      useState("");
  
    const [sent, setSent] =
      useState(false);
  
    if (!open) {
      return null;
    }
  
    const sendOtp = () => {
      setSent(true);
      setError("");
  
      // MOCK
      alert(
        "Mock OTP sent. Use: 123456"
      );
    };
  
    const verifyOtp = () => {
      setError("");
  
      if (otp !== "123456") {
        setError(
          "Invalid OTP. Demo OTP is 123456."
        );
  
        return;
      }
  
      onVerified();
    };
  
    return (
      <div
        className="
          fixed
          inset-0
          z-[70]
          flex
          items-center
          justify-center
          bg-slate-950/60
          p-4
          backdrop-blur-sm
        "
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
          <div className="flex items-start justify-between">
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-blue-50
                text-blue-600
              "
            >
              <ShieldCheck size={22} />
            </div>
  
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
  
          <h2 className="mt-6 text-2xl font-black">
            Fast Verification
          </h2>
  
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Requirement publish karne se
            pehle phone number verify karein.
          </p>
  
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <Phone
                size={18}
                className="text-blue-600"
              />
  
              <div>
                <p className="text-xs text-slate-400">
                  Verification Number
                </p>
  
                <p className="font-semibold text-slate-900">
                  {phone}
                </p>
              </div>
            </div>
          </div>
  
          {!sent ? (
            <button
              type="button"
              onClick={sendOtp}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white hover:bg-blue-600"
            >
              <MessageSquareText
                size={18}
              />
  
              Send OTP
            </button>
          ) : (
            <>
              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Enter OTP
                </label>
  
                <input
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                    )
                  }
                  maxLength={6}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xl font-bold tracking-[0.4em] outline-none focus:border-blue-500"
                />
              </div>
  
              {error && (
                <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
  
              <button
                type="button"
                onClick={verifyOtp}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white hover:bg-blue-600"
              >
                <CheckCircle2
                  size={18}
                />
  
                Verify & Submit
              </button>
  
              <button
                type="button"
                onClick={sendOtp}
                className="mt-3 w-full text-sm font-semibold text-blue-600"
              >
                Resend OTP
              </button>
            </>
          )}
  
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs leading-5 text-slate-400">
              Phone verification ke baad
              requirement AI verification queue
              mein jayegi. Verification complete
              hone ke baad public post par green
              Verified Requirement badge show
              hoga.
            </p>
          </div>
        </div>
      </div>
    );
  }