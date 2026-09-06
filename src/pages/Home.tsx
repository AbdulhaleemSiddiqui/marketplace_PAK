import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  LogOut,
  MessageCircle,
  Mic,
  Paperclip,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import FastVerificationModal from "../components/auth/FastVerificationModal";

import {
  getCurrentUser,
  logoutUser,
  markPhoneVerified,
} from "../services/authService";

import {
  clearPendingRequirement,
  getPendingRequirement,
  saveBuyerRequirement,
  savePendingRequirement,
} from "../services/requirementService";

import type {
  RequirementField,
  StructuredRequirement,
  UserRole,
} from "../types/marketplace";

export default function Home() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const [
    role,
    setRole,
  ] =
    useState<UserRole>(
      "buyer"
    );

  const [
    input,
    setInput,
  ] = useState("");

  const [
    requirement,
    setRequirement,
  ] =
    useState<StructuredRequirement | null>(
      null
    );

  const [
    showRequirementModal,
    setShowRequirementModal,
  ] = useState(false);

  const [
    showFastVerification,
    setShowFastVerification,
  ] = useState(false);

  const [
    currentUser,
    setCurrentUser,
  ] = useState(
    getCurrentUser()
  );

  const [
    profileMenuOpen,
    setProfileMenuOpen,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  // =====================================================
  // RESUME REQUIREMENT AFTER BUYER LOGIN
  // =====================================================

  useEffect(() => {
    const shouldResume =
      searchParams.get(
        "resumeRequirement"
      );

    if (
      shouldResume !== "true"
    ) {
      return;
    }

    const user =
      getCurrentUser();

    const pending =
      getPendingRequirement();

    if (
      !user ||
      user.role !== "buyer" ||
      !pending
    ) {
      navigate(
        "/",
        {
          replace: true,
        }
      );

      return;
    }

    setCurrentUser(user);
    setRole("buyer");
    setRequirement(pending);

    navigate(
      "/",
      {
        replace: true,
      }
    );

    // Already phone verified
    if (
      user.phoneVerified
    ) {
      saveBuyerRequirement(
        pending,
        user,
        "ai_verification_pending"
      );

      clearPendingRequirement();

      setRequirement(null);

      navigate(
        "/profile",
        {
          replace: true,

          state: {
            message:
              "Your requirement has been saved successfully.",
          },
        }
      );

      return;
    }

    // Need OTP
    setShowFastVerification(
      true
    );
  }, [
    searchParams,
    navigate,
  ]);

  // =====================================================
  // SUCCESS AUTO CLOSE
  // =====================================================

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setSuccessMessage("");
        },
        3000
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [successMessage]);

  // =====================================================
  // GENERATE
  // =====================================================

  const handleGenerate =
    () => {
      if (
        !input.trim()
      ) {
        alert(
          "Apni requirement enter karein."
        );

        return;
      }

      if (
        role === "seller"
      ) {
        alert(
          "Seller listing generation next phase mein connect hogi. Filhal Find page par demo Seller Listings available hain."
        );

        return;
      }

      const generated =
        generateMockRequirement(
          input
        );

      setRequirement(
        generated
      );

      setShowRequirementModal(
        true
      );
    };

  // =====================================================
  // FIELD UPDATE
  // =====================================================

  const updateRequirementField = (
    fieldId: string,
    value: string
  ) => {
    setRequirement(
      (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          fields:
            current.fields.map(
              (field) =>
                field.id ===
                fieldId
                  ? {
                      ...field,
                      value,
                    }
                  : field
            ),
        };
      }
    );
  };

  // =====================================================
  // SAVE REQUIREMENT
  // =====================================================

  const handleSaveRequirement =
    () => {
      if (!requirement) {
        return;
      }

      const missingRequired =
        requirement.fields.some(
          (field) =>
            field.required &&
            !field.value.trim()
        );

      if (
        missingRequired
      ) {
        alert(
          "Please complete all required fields."
        );

        return;
      }

      const user =
        getCurrentUser();

      // -----------------------------------------------
      // NOT LOGGED IN
      // -----------------------------------------------

      if (!user) {
        savePendingRequirement(
          requirement
        );

        setShowRequirementModal(
          false
        );

        navigate(
          `/login?role=buyer&returnUrl=${encodeURIComponent(
            "/"
          )}`
        );

        return;
      }

      // -----------------------------------------------
      // SELLER LOGGED IN
      // -----------------------------------------------

      if (
        user.role !==
        "buyer"
      ) {
        alert(
          "Requirement save karne ke liye Buyer account required hai."
        );

        return;
      }

      // Always preserve before verification
      savePendingRequirement(
        requirement
      );

      setShowRequirementModal(
        false
      );

      // -----------------------------------------------
      // PHONE ALREADY VERIFIED
      // -----------------------------------------------

      if (
        user.phoneVerified
      ) {
        saveBuyerRequirement(
          requirement,
          user,
          "ai_verification_pending"
        );

        clearPendingRequirement();

        setRequirement(null);

        navigate(
          "/profile",
          {
            state: {
              message:
                "Your requirement has been saved successfully.",
            },
          }
        );

        return;
      }

      // -----------------------------------------------
      // NEED OTP
      // -----------------------------------------------

      setShowFastVerification(
        true
      );
    };

  // =====================================================
  // OTP VERIFIED
  // =====================================================

  const handlePhoneVerified =
    () => {
      const loggedInUser =
        getCurrentUser();

      if (!loggedInUser) {
        alert(
          "Login session not found."
        );

        return;
      }

      const pending =
        getPendingRequirement();

      if (!pending) {
        setShowFastVerification(
          false
        );

        alert(
          "Pending requirement not found."
        );

        return;
      }

      const verifiedUser =
        markPhoneVerified(
          loggedInUser.id
        );

      if (!verifiedUser) {
        alert(
          "Phone verification failed."
        );

        return;
      }

      saveBuyerRequirement(
        pending,
        verifiedUser,
        "ai_verification_pending"
      );

      clearPendingRequirement();

      setCurrentUser(
        verifiedUser
      );

      setRequirement(null);

      setShowRequirementModal(
        false
      );

      setShowFastVerification(
        false
      );

      navigate(
        "/profile",
        {
          replace: true,

          state: {
            message:
              "Your requirement has been saved successfully.",
          },
        }
      );
    };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout =
    () => {
      logoutUser();

      setCurrentUser(null);

      setProfileMenuOpen(
        false
      );

      navigate("/");
    };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* LOGO */}

          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles
                size={17}
              />
            </div>

            <span className="text-xl font-black">
              Khoj
              <span className="text-blue-600">
                Market
              </span>
            </span>
          </Link>

          {/* NAV */}

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              to="/find"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              Find
            </Link>

            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              How It Works
            </a>
          </nav>

          {/* USER */}

          <div className="relative">
            {!currentUser ? (
              <Link
                to="/login"
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Sign In
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setProfileMenuOpen(
                      (value) =>
                        !value
                    )
                  }
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <User
                      size={16}
                    />
                  </div>

                  <span className="hidden text-sm font-bold sm:block">
                    {
                      currentUser.name
                    }
                  </span>

                  <ChevronDown
                    size={15}
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <User
                        size={16}
                      />

                      My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
                    >
                      <LogOut
                        size={16}
                      />

                      Sign Out
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600">
            <Sparkles
              size={14}
            />

            AI-POWERED LOCAL MARKETPLACE
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
          What are you looking for?
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
            Type, speak ya image
            upload karein. KhojMarket
            aapki requirement ko
            structured request mein
            convert karega.
          </p>

          {/* ROLE SWITCH */}

          <div className="mx-auto mt-9 inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() =>
                setRole(
                  "buyer"
                )
              }
              className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                role === "buyer"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500"
              }`}
            >
              I want to Buy
            </button>

            <button
              type="button"
              onClick={() =>
                setRole(
                  "seller"
                )
              }
              className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                role === "seller"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500"
              }`}
            >
              I want to Sell
            </button>
          </div>

          {/* AI INPUT */}

          <div className="mx-auto mt-7 max-w-4xl rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50">
            <textarea
              value={input}
              onChange={(event) =>
                setInput(
                  event.target
                    .value
                )
              }
              rows={4}
              placeholder={
                role === "buyer"
                  ? "e.g. Mujhe Lahore mein 2021 se 2023 Toyota Corolla automatic chahiye..."
                  : "e.g. Mere paas Samsung S25 Ultra PTA approved available hai..."
              }
              className="w-full resize-none border-0 bg-transparent px-3 py-3 text-lg outline-none placeholder:text-slate-400"
            />

            <div className="mt-2 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                  title="Attach"
                >
                  <Paperclip
                    size={19}
                  />
                </button>

                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                  title="Upload image"
                >
                  <Upload
                    size={19}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setInput(
                      "Mujhe Dell laptop chahiye Core i7, 16GB RAM, 512GB SSD, budget 150000 aur location Lahore"
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                  title="Mock Voice"
                >
                  <Mic
                    size={19}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={
                  handleGenerate
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
              >
                <Sparkles
                  size={17}
                />

                {role === "buyer"
                  ? "Generate Req"
                  : "Generate Listing"}
              </button>
            </div>
          </div>

          <div className="mt-7">
            <Link
              to="/find"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600"
            >
              <Search
                size={16}
              />

              Browse Marketplace

              <ArrowRight
                size={15}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="bg-white py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold text-blue-600">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              From requirement to
              trusted connection
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <HowCard
              number="01"
              icon={
                <MessageCircle />
              }
              title="Tell us what you need"
              text="Text, voice ya image se apni requirement explain karein."
            />

            <HowCard
              number="02"
              icon={
                <Sparkles />
              }
              title="AI structures it"
              text="KhojMarket important fields extract karke request ready karta hai."
            />

            <HowCard
              number="03"
              icon={
                <ShieldCheck />
              }
              title="Fast Verification"
              text="Phone aur requirement verification trust improve karti hai."
            />

            <HowCard
              number="04"
              icon={
                <Building2 />
              }
              title="Connect with sellers"
              text="Verified sellers relevant requirements par inquiry bhejte hain."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST
      ===================================================== */}

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold text-blue-400">
              TRUST FIRST
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Better leads. Better
              sellers. Less noise.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              KhojMarket ka goal sirf
              listings show karna nahi,
              balkay trusted buyers aur
              sellers ko relevant need
              ke around connect karna
              hai.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TrustItem
              title="Verified Requirements"
              text="Buyer post verification state clearly visible."
            />

            <TrustItem
              title="Verified Sellers"
              text="Seller verification before paid inquiries."
            />

            <TrustItem
              title="Protected Contact"
              text="Contact information blindly public nahi hoti."
            />

            <TrustItem
              title="Transparent Credits"
              text="Seller inquiry cost aur transaction history visible."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xl font-black">
                Khoj
                <span className="text-blue-600">
                  Market
                </span>
              </p>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Pakistan-focused trusted
                buyer and seller sourcing
                marketplace.
              </p>
            </div>

            <FooterColumn
              title="Product"
              items={[
                "Find",
                "Buyer Requirements",
                "Seller Listings",
                "How It Works",
              ]}
            />

            <FooterColumn
              title="Trust"
              items={[
                "Buyer Verification",
                "Seller Verification",
                "Safe Contact",
                "Support",
              ]}
            />

            <FooterColumn
              title="Contact"
              items={[
                "WhatsApp Support",
                "support@khojmarket.pk",
                "Pakistan",
              ]}
            />
          </div>

          <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-400">
            © 2026 KhojMarket. Demo
            marketplace.
          </div>
        </div>
      </footer>

      {/* =====================================================
          REQUIREMENT MODAL
      ===================================================== */}

      {requirement &&
        showRequirementModal && (
          <RequirementModal
            requirement={
              requirement
            }
            onClose={() =>
              setShowRequirementModal(
                false
              )
            }
            onFieldChange={
              updateRequirementField
            }
            onSave={
              handleSaveRequirement
            }
          />
        )}

      {/* =====================================================
          OTP
      ===================================================== */}

      <FastVerificationModal
        open={
          showFastVerification
        }
        phone={
          getCurrentUser()
            ?.phone ?? ""
        }
        onClose={() =>
          setShowFastVerification(
            false
          )
        }
        onVerified={
          handlePhoneVerified
        }
      />

      {/* SUCCESS */}

      {successMessage && (
        <div className="fixed bottom-6 right-6 z-[150] max-w-sm rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          {successMessage}
        </div>
      )}
    </div>
  );
}

// =====================================================
// REQUIREMENT MODAL
// =====================================================

function RequirementModal({
  requirement,
  onClose,
  onFieldChange,
  onSave,
}: {
  requirement:
    StructuredRequirement;

  onClose: () => void;

  onFieldChange: (
    fieldId: string,
    value: string
  ) => void;

  onSave: () => void;
}) {
  const missingCount =
    requirement.fields.filter(
      (field) =>
        field.required &&
        !field.value.trim()
    ).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              AI GENERATED
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Review Requirement
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Save se pehle details
              check aur edit karein.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-7">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase text-slate-400">
              Title
            </p>

            <h3 className="mt-2 text-xl font-black">
              {
                requirement.title
              }
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {
                requirement.category
              }

              {requirement.subCategory
                ? ` • ${requirement.subCategory}`
                : ""}
            </p>
          </div>

          {missingCount > 0 && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle
                size={19}
                className="shrink-0 text-amber-600"
              />

              <p className="text-sm leading-6 text-amber-800">
                {missingCount} required
                field
                {missingCount > 1
                  ? "s are"
                  : " is"}{" "}
                missing.
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {requirement.fields.map(
              (field) => (
                <div
                  key={
                    field.id
                  }
                >
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    {field.label}

                    {field.required && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}
                  </label>

                  <input
                    value={
                      field.value
                    }
                    onChange={(
                      event
                    ) =>
                      onFieldChange(
                        field.id,
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              )
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-700">
            Next step: Buyer login
            agar required ho, phir phone
            verification. Uske baad
            requirement verification
            queue mein jayegi.
          </div>

          <button
            type="button"
            onClick={onSave}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-600"
          >
            <Save
              size={18}
            />

            Save Requirement
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MOCK AI
// =====================================================

function generateMockRequirement(
  text: string
): StructuredRequirement {
  const value =
    text.toLowerCase();

  if (
    value.includes(
      "corolla"
    ) ||
    value.includes("car") ||
    value.includes(
      "toyota"
    )
  ) {
    return {
      title:
        "Toyota Corolla Required",

      category:
        "Vehicles",

      subCategory: "Cars",

      fields: [
        field(
          "make",
          "Make",
          "Toyota",
          true
        ),

        field(
          "model",
          "Model",
          "Corolla",
          true
        ),

        field(
          "year",
          "Year",
          "2021 - 2023",
          true
        ),

        field(
          "transmission",
          "Transmission",
          "Automatic",
          false
        ),

        field(
          "condition",
          "Condition",
          "Used - Excellent",
          true
        ),

        field(
          "budget",
          "Budget",
          "PKR 5,500,000",
          true
        ),

        field(
          "location",
          "Location",
          "Lahore",
          true
        ),
      ],
    };
  }

  if (
    value.includes(
      "cement"
    )
  ) {
    return {
      title:
        "Cement Required for House Construction",

      category:
        "Construction",

      subCategory:
        "Building Material",

      fields: [
        field(
          "material",
          "Material",
          "Cement",
          true
        ),

        field(
          "quantity",
          "Quantity",
          "400 Bags",
          true
        ),

        field(
          "brand",
          "Preferred Brand",
          "Bestway / Lucky",
          false
        ),

        field(
          "delivery",
          "Delivery",
          "Within 3 Days",
          true
        ),

        field(
          "budget",
          "Budget",
          "",
          false
        ),

        field(
          "location",
          "Location",
          "Islamabad",
          true
        ),
      ],
    };
  }

  if (
    value.includes(
      "watch"
    ) ||
    value.includes(
      "rado"
    )
  ) {
    return {
      title:
        "Original Rado Watch Required",

      category:
        "Fashion",

      subCategory:
        "Watches",

      fields: [
        field(
          "brand",
          "Brand",
          "Rado",
          true
        ),

        field(
          "condition",
          "Condition",
          "New / Like New",
          true
        ),

        field(
          "authenticity",
          "Authenticity",
          "Original",
          true
        ),

        field(
          "boxpapers",
          "Box & Papers",
          "Preferred",
          false
        ),

        field(
          "budget",
          "Budget",
          "PKR 250,000",
          true
        ),

        field(
          "location",
          "Location",
          "Karachi",
          true
        ),
      ],
    };
  }

  if (
    value.includes(
      "laptop"
    ) ||
    value.includes(
      "dell"
    )
  ) {
    return {
      title:
        "Dell Laptop Required",

      category:
        "Electronics",

      subCategory:
        "Laptop",

      fields: [
        field(
          "brand",
          "Brand",
          "Dell",
          true
        ),

        field(
          "processor",
          "Processor",
          "Core i7",
          true
        ),

        field(
          "ram",
          "RAM",
          "16GB",
          true
        ),

        field(
          "storage",
          "Storage",
          "512GB SSD",
          true
        ),

        field(
          "condition",
          "Condition",
          "Good / Excellent",
          true
        ),

        field(
          "budget",
          "Budget",
          "PKR 150,000",
          true
        ),

        field(
          "location",
          "Location",
          "Lahore",
          true
        ),
      ],
    };
  }

  return {
    title:
      "Buyer Requirement",

    category:
      "Other",

    subCategory:
      "General",

    fields: [
      field(
        "requirement",
        "Requirement",
        text,
        true
      ),

      field(
        "quantity",
        "Quantity",
        "",
        false
      ),

      field(
        "condition",
        "Condition",
        "",
        false
      ),

      field(
        "budget",
        "Budget",
        "",
        false
      ),

      field(
        "location",
        "Location",
        "",
        true
      ),
    ],
  };
}

function field(
  id: string,
  label: string,
  value: string,
  required: boolean
): RequirementField {
  return {
    id,
    label,
    value,
    required,
  };
}

// =====================================================
// SMALL COMPONENTS
// =====================================================

function HowCard({
  number,
  icon,
  title,
  text,
}: {
  number: string;

  icon: ReactNode;

  title: string;

  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <span className="text-sm font-black text-slate-300">
          {number}
        </span>
      </div>

      <h3 className="mt-6 font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function TrustItem({
  title,
  text,
}: {
  title: string;

  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <BadgeCheck
        size={19}
        className="text-emerald-400"
      />

      <h3 className="mt-4 font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;

  items: string[];
}) {
  return (
    <div>
      <h3 className="font-bold">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {items.map(
          (item) => (
            <p
              key={item}
              className="text-sm text-slate-500"
            >
              {item}
            </p>
          )
        )}
      </div>
    </div>
  );
}