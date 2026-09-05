import { useState } from "react";

import {
  ArrowLeft,
  Sparkles,
  UserPlus,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { registerUser } from "../services/authService";

import { getPendingRequirement } from "../services/requirementService";

import type { UserRole } from "../types/marketplace";

export default function Register() {
  const navigate =
    useNavigate();

  const [role, setRole] =
    useState<UserRole>("buyer");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleRegister = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setError("");

      registerUser({
        role,
        name,
        email,
        phone,
        password,
      });

      if (
        getPendingRequirement()
      ) {
        navigate(
          "/?resumeRequirement=true"
        );

        return;
      }

      navigate("/profile");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-lg px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles size={19} />
            </div>

            <div className="text-xl font-bold">
              Khoj
              <span className="text-blue-600">
                Market
              </span>
            </div>
          </div>

          <h1 className="mt-8 text-3xl font-black">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Buyer ya Seller account choose
            karein.
          </p>

          <div className="mt-6 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() =>
                setRole("buyer")
              }
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                role === "buyer"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500"
              }`}
            >
              Buyer
            </button>

            <button
              type="button"
              onClick={() =>
                setRole("seller")
              }
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                role === "seller"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500"
              }`}
            >
              Seller
            </button>
          </div>

          <form
            onSubmit={
              handleRegister
            }
            className="mt-6 space-y-5"
          >
            <Field
              label="Full Name"
              value={name}
              onChange={setName}
            />

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
            />

            <Field
              label="Phone Number"
              value={phone}
              onChange={setPhone}
            />

            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
            />

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white hover:bg-blue-600"
            >
              <UserPlus size={18} />

              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        required
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}