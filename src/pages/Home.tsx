import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  LogOut,
  MessageCircle,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import AiInput from "../components/chat/AiInput";

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

import type { User as AuthUser } from "../types/auth";

// =====================================================
// HOME
// =====================================================

export default function Home() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const [role, setRole] =
    useState<UserRole>("buyer");

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
  ] = useState<AuthUser | null>(() =>
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
  // RESUME REQUIREMENT AFTER LOGIN / REGISTER
  // =====================================================

  useEffect(() => {
    const user = getCurrentUser();

    setCurrentUser(user);

    const shouldResume =
      searchParams.get(
        "resumeRequirement"
      ) === "true";

    if (!user || !shouldResume) {
      return;
    }

    const pendingRequirement =
      getPendingRequirement();

    if (!pendingRequirement) {
      navigate("/", {
        replace: true,
      });

      return;
    }

    setRole("buyer");

    setRequirement(
      pendingRequirement
    );

    setShowRequirementModal(false);

    setShowFastVerification(true);

    navigate("/", {
      replace: true,
    });
  }, [navigate, searchParams]);

  // =====================================================
  // SUCCESS MESSAGE TIMER
  // =====================================================

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        setSuccessMessage("");
      },
      4500
    );

    return () =>
      window.clearTimeout(timer);
  }, [successMessage]);

  // =====================================================
  // MOCK AI - GENERATE REQUIREMENT
  // =====================================================

  const handleSend = (
    text: string
  ) => {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    const lower =
      cleanText.toLowerCase();

    // -----------------------------------------
    // SELLER FLOW
    // -----------------------------------------

    if (role === "seller") {
      alert(
        "Seller listing generation next flow mein connect hogi. Filhal buyer requirement flow complete hai."
      );

      return;
    }

    // -----------------------------------------
    // LAPTOP MOCK
    // -----------------------------------------

    if (
      lower.includes("laptop") ||
      lower.includes("dell") ||
      lower.includes("i7") ||
      lower.includes("16gb") ||
      lower.includes("16 gb")
    ) {
      const generatedRequirement: StructuredRequirement =
        {
          category: "Electronics",

          subCategory: "Laptop",

          title:
            "Dell Laptop Required",

          fields: [
            {
              id: "brand",
              label: "Brand",

              value:
                lower.includes(
                  "dell"
                )
                  ? "Dell"
                  : "",

              required: true,
            },

            {
              id: "model",
              label: "Model",
              value: "",
              required: false,
            },

            {
              id: "processor",
              label: "Processor",

              value:
                lower.includes("i7")
                  ? "Intel Core i7"
                  : "",

              required: true,
            },

            {
              id: "ram",
              label: "RAM",

              value:
                lower.includes(
                  "16gb"
                ) ||
                lower.includes(
                  "16 gb"
                )
                  ? "16 GB"
                  : "",

              required: true,
            },

            {
              id: "storage",
              label: "Storage",

              value:
                lower.includes("512")
                  ? "512 GB SSD"
                  : "",

              required: true,
            },

            {
              id: "condition",
              label: "Condition",

              value:
                lower.includes(
                  "used"
                )
                  ? "Used"
                  : lower.includes(
                        "new"
                      )
                    ? "New"
                    : "",

              required: true,
            },

            {
              id: "budget",
              label:
                "Budget Range",

              value:
                lower.includes(
                  "150k"
                ) ||
                lower.includes(
                  "150000"
                )
                  ? "Up to PKR 150,000"
                  : "",

              required: true,
            },

            {
              id: "location",
              label: "Location",

              value:
                lower.includes(
                  "karachi"
                )
                  ? "Karachi"
                  : lower.includes(
                        "lahore"
                      )
                    ? "Lahore"
                    : lower.includes(
                          "islamabad"
                        )
                      ? "Islamabad"
                      : "",

              required: true,
            },

            {
              id: "area",
              label: "Area",

              value:
                lower.includes(
                  "gulshan"
                )
                  ? "Gulshan-e-Iqbal"
                  : "",

              required: false,
            },

            {
              id: "warranty",
              label: "Warranty",
              value: "",
              required: false,
            },
          ],
        };

      setRequirement(
        generatedRequirement
      );

      setShowRequirementModal(
        true
      );

      return;
    }

    // -----------------------------------------
    // CAR MOCK
    // -----------------------------------------

    if (
      lower.includes("car") ||
      lower.includes(
        "corolla"
      ) ||
      lower.includes(
        "civic"
      ) ||
      lower.includes(
        "vehicle"
      )
    ) {
      const carRequirement: StructuredRequirement =
        {
          category: "Vehicles",

          subCategory: "Cars",

          title:
            lower.includes(
              "corolla"
            )
              ? "Toyota Corolla Required"
              : "Car Required",

          fields: [
            {
              id: "make",
              label: "Make",

              value:
                lower.includes(
                  "toyota"
                ) ||
                lower.includes(
                  "corolla"
                )
                  ? "Toyota"
                  : "",

              required: true,
            },

            {
              id: "model",
              label: "Model",

              value:
                lower.includes(
                  "corolla"
                )
                  ? "Corolla"
                  : lower.includes(
                        "civic"
                      )
                    ? "Civic"
                    : "",

              required: true,
            },

            {
              id: "year",
              label: "Model Year",
              value: "",
              required: true,
            },

            {
              id: "variant",
              label: "Variant",
              value: "",
              required: false,
            },

            {
              id: "transmission",
              label:
                "Transmission",

              value:
                lower.includes(
                  "automatic"
                )
                  ? "Automatic"
                  : lower.includes(
                        "manual"
                      )
                    ? "Manual"
                    : "",

              required: false,
            },

            {
              id: "condition",
              label: "Condition",

              value:
                lower.includes(
                  "used"
                )
                  ? "Used"
                  : "",

              required: true,
            },

            {
              id: "budget",
              label:
                "Budget Range",
              value: "",
              required: true,
            },

            {
              id: "location",
              label: "Location",

              value:
                lower.includes(
                  "karachi"
                )
                  ? "Karachi"
                  : lower.includes(
                        "lahore"
                      )
                    ? "Lahore"
                    : "",

              required: true,
            },
          ],
        };

      setRequirement(
        carRequirement
      );

      setShowRequirementModal(
        true
      );

      return;
    }

    // -----------------------------------------
    // GENERIC DYNAMIC FALLBACK
    // -----------------------------------------

    const genericRequirement: StructuredRequirement =
      {
        category: "Other",

        title:
          "New Buyer Requirement",

        fields: [
          {
            id: "product",
            label: "Product",

            value: cleanText,

            required: true,
          },

          {
            id: "condition",
            label: "Condition",
            value: "",
            required: false,
          },

          {
            id: "budget",
            label:
              "Budget Range",
            value: "",
            required: true,
          },

          {
            id: "location",
            label: "Location",
            value: "",
            required: true,
          },
        ],
      };

    setRequirement(
      genericRequirement
    );

    setShowRequirementModal(
      true
    );
  };

  // =====================================================
  // UPDATE FIELD
  // =====================================================

  const handleFieldChange = (
    fieldId: string,
    value: string
  ) => {
    if (!requirement) {
      return;
    }

    const updatedFields =
      requirement.fields.map(
        (field) =>
          field.id === fieldId
            ? {
                ...field,
                value,
              }
            : field
      );

    setRequirement({
      ...requirement,

      fields: updatedFields,
    });
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
        requirement.fields.filter(
          (field) =>
            field.required &&
            !field.value.trim()
        );

      if (
        missingRequired.length > 0
      ) {
        alert(
          `Please complete: ${missingRequired
            .map(
              (field) =>
                field.label
            )
            .join(", ")}`
        );

        return;
      }

      const user =
        getCurrentUser();

      // -----------------------------------------
      // NOT LOGGED IN
      // -----------------------------------------

      if (!user) {
        savePendingRequirement(
          requirement
        );

        setShowRequirementModal(
          false
        );

        navigate("/login");

        return;
      }

      // -----------------------------------------
      // LOGGED IN
      // -----------------------------------------

      setCurrentUser(user);

      setShowRequirementModal(
        false
      );

      setShowFastVerification(
        true
      );
    };

  // =====================================================
  // OTP VERIFIED
  // =====================================================

  const handlePhoneVerified =
    () => {
      if (!requirement) {
        return;
      }

      const verifiedUser =
        markPhoneVerified();

      if (!verifiedUser) {
        savePendingRequirement(
          requirement
        );

        navigate("/login");

        return;
      }

      saveBuyerRequirement(
        requirement,
        verifiedUser,
        "ai_verification_pending"
      );

      clearPendingRequirement();

      setCurrentUser(
        verifiedUser
      );

      setShowFastVerification(
        false
      );

      setShowRequirementModal(
        false
      );

      setRequirement(null);

      setSuccessMessage(
        "Requirement submitted successfully. AI verification pending."
      );
    };

  // =====================================================
  // ROLE
  // =====================================================

  const handleRoleChange = (
    newRole: UserRole
  ) => {
    setRole(newRole);

    setRequirement(null);

    setShowRequirementModal(
      false
    );

    setShowFastVerification(
      false
    );
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logoutUser();

    setCurrentUser(null);

    setProfileMenuOpen(false);

    setSuccessMessage(
      "You have been signed out."
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            px-6
            py-4
          "
        >
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-slate-950
                text-white
              "
            >
              <Sparkles
                size={19}
              />
            </div>

            <div className="text-xl font-bold">
              Khoj
              <span className="text-blue-600">
                Market
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/find"
              className="text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              Find
            </Link>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              How It Works
            </a>
          </nav>

          {/* AUTH */}

          {!currentUser ? (
            <Link
              to="/login"
              className="
                rounded-xl
                border
                border-slate-200
                px-5
                py-2.5
                text-sm
                font-semibold
                text-slate-700
                transition
                hover:border-blue-200
                hover:text-blue-600
              "
            >
              Sign In
            </Link>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen(
                    (value) =>
                      !value
                  )
                }
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-2
                  transition
                  hover:border-blue-200
                  hover:shadow-sm
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-950
                    text-sm
                    font-black
                    text-white
                  "
                >
                  {currentUser.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="max-w-[130px] truncate text-sm font-bold">
                    {
                      currentUser.name
                    }
                  </p>

                  <p className="text-[11px] capitalize text-slate-400">
                    {
                      currentUser.role
                    }
                    {currentUser.phoneVerified
                      ? " • Verified"
                      : ""}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className="text-slate-400"
                />
              </button>

              {profileMenuOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-[calc(100%+10px)]
                    w-64
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-xl
                  "
                >
                  <div className="border-b border-slate-100 p-4">
                    <p className="font-bold text-slate-900">
                      {
                        currentUser.name
                      }
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      {
                        currentUser.email
                      }
                    </p>

                    {currentUser.phoneVerified && (
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle2
                          size={13}
                        />

                        Phone Verified
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() =>
                        setProfileMenuOpen(
                          false
                        )
                      }
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-600
                        hover:bg-slate-50
                        hover:text-blue-600
                      "
                    >
                      <User
                        size={17}
                      />

                      My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        text-sm
                        font-semibold
                        text-red-500
                        hover:bg-red-50
                      "
                    >
                      <LogOut
                        size={17}
                      />

                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main>
        {/* =================================================
            HERO
        ================================================= */}

        <section
          id="find"
          className="
            mx-auto
            max-w-7xl
            px-6
            pb-24
            pt-16
          "
        >
          <div className="mb-10 text-center">
            <div
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-200
                bg-white
                px-4
                py-2
                text-xs
                font-semibold
                text-blue-600
                shadow-sm
              "
            >
              <Sparkles
                size={15}
              />

              AI-powered marketplace
              for Pakistan

              <ArrowRight
                size={14}
              />
            </div>

            <h1
              className="
                mx-auto
                max-w-4xl
                text-5xl
                font-black
                tracking-tight
                md:text-6xl
              "
            >
              What do you want?
            </h1>

            <p
              className="
                mx-auto
                mt-5
                max-w-2xl
                text-lg
                leading-8
                text-slate-500
              "
            >
              Bas apni requirement
              batao. AI details
              samjhega aur relevant
              sellers identify karega.
            </p>

            {/* ROLE */}

            <div
              className="
                mt-8
                inline-flex
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-1.5
                shadow-sm
              "
            >
              <button
                type="button"
                onClick={() =>
                  handleRoleChange(
                    "buyer"
                  )
                }
                className={`
                  rounded-xl
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  transition

                  ${
                    role ===
                    "buyer"
                      ? "bg-slate-950 text-white"
                      : "text-slate-500 hover:text-slate-950"
                  }
                `}
              >
                I want to Buy
              </button>

              <button
                type="button"
                onClick={() =>
                  handleRoleChange(
                    "seller"
                  )
                }
                className={`
                  rounded-xl
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  transition

                  ${
                    role ===
                    "seller"
                      ? "bg-slate-950 text-white"
                      : "text-slate-500 hover:text-slate-950"
                  }
                `}
              >
                I want to Sell
              </button>
            </div>
          </div>

          {/* AI INPUT */}

          <div className="mx-auto w-full max-w-6xl">
            <AiInput
              role={role}
              onSend={
                handleSend
              }
            />

            <div
              className="
                mt-6
                flex
                flex-wrap
                justify-center
                gap-6
                text-xs
                text-slate-500
              "
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={15}
                  className="text-emerald-500"
                />

                Verified users
              </span>

              <span className="flex items-center gap-1.5">
                <ShieldCheck
                  size={15}
                  className="text-blue-500"
                />

                Trusted sellers
              </span>

              <span className="flex items-center gap-1.5">
                <Sparkles
                  size={15}
                  className="text-blue-500"
                />

                AI-powered
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            HOW IT WORKS
        ================================================= */}

        <section
          id="how-it-works"
          className="border-y border-slate-200 bg-white py-24"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Simple Process
              </p>

              <h2 className="mt-3 text-4xl font-black">
                How it works
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-slate-500">
                Requirement se
                verified marketplace
                post tak simple aur
                trusted process.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-4">
              <HowCard
                icon={
                  <MessageCircle />
                }
                number="01"
                title="Batao kya chahiye"
                description="Text, voice ya image se apni requirement batao."
              />

              <HowCard
                icon={<Sparkles />}
                number="02"
                title="AI requirement banaye"
                description="AI product aur important details identify karke structured requirement banayega."
              />

              <HowCard
                icon={
                  <ShieldCheck />
                }
                number="03"
                title="Fast Verification"
                description="Phone OTP ke through buyer account verify hoga."
              />

              <HowCard
                icon={<Search />}
                number="04"
                title="Sellers match hon"
                description="Verification ke baad relevant sellers requirement ke against identify honge."
              />
            </div>
          </div>
        </section>

        {/* =================================================
            TRUST
        ================================================= */}

        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                  Trust & Verification
                </p>

                <h2 className="mt-3 max-w-xl text-4xl font-black leading-tight">
                  Real requirements.
                  Better seller
                  opportunities.
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-slate-500">
                  KhojMarket ka goal
                  sirf posts collect
                  karna nahi. Buyer
                  phone verification
                  aur requirement
                  verification se
                  sellers ko better
                  quality leads dena
                  hai.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TrustCard
                  icon={
                    <CheckCircle2 />
                  }
                  title="Phone Verified"
                  text="OTP ke through account phone verify hota hai."
                />

                <TrustCard
                  icon={
                    <ShieldCheck />
                  }
                  title="Requirement Verification"
                  text="AI ya admin requirement authenticity confirm kar sakta hai."
                />

                <TrustCard
                  icon={<Sparkles />}
                  title="AI Structured"
                  text="Different categories ke liye relevant details generate hoti hain."
                />

                <TrustCard
                  icon={<Search />}
                  title="Relevant Matching"
                  text="Sellers ko relevant buyer requirements discover karne mein help milti hai."
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <section className="border-t border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Customers
            </p>

            <h2 className="mt-3 text-4xl font-black">
              What people say
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <Review
                name="Ahmed"
                city="Karachi"
                text="Requirement banana bohat simple tha."
              />

              <Review
                name="Usman"
                city="Lahore"
                text="Relevant sellers ek hi jagah mil gaye."
              />

              <Review
                name="Ali"
                city="Islamabad"
                text="AI ne meri laptop requirement properly samajh li."
              />
            </div>
          </div>
        </section>
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-slate-950 text-white">
        {/* SUPPORT CTA */}

        <div className="border-b border-slate-800">
          <div
            className="
              mx-auto
              flex
              max-w-7xl
              flex-col
              items-center
              justify-between
              gap-8
              px-6
              py-14
              text-center
              md:flex-row
              md:text-left
            "
          >
            <div>
              <p className="text-sm font-semibold text-blue-400">
                Need Help?
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Buying ya selling
                mein help chahiye?
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                Hamari support team
                requirement create
                karne, seller find
                karne aur platform
                use karne mein help
                karegi.
              </p>
            </div>

            <button
              type="button"
              className="
                flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                bg-white
                px-6
                py-3.5
                font-semibold
                text-slate-950
                transition
                hover:bg-blue-500
                hover:text-white
              "
            >
              <MessageCircle
                size={19}
              />

              Chat on WhatsApp
            </button>
          </div>
        </div>

        {/* MAIN FOOTER */}

        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            {/* BRAND */}

            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-slate-950
                  "
                >
                  <Sparkles
                    size={20}
                  />
                </div>

                <div className="text-2xl font-bold">
                  Khoj
                  <span className="text-blue-500">
                    Market
                  </span>
                </div>
              </div>

              <p className="mt-5 max-w-md leading-7 text-slate-400">
                Pakistan ka
                AI-powered
                buyer-supplier
                marketplace. Bas
                apni requirement
                batao, AI usay
                structure karega aur
                relevant sellers tak
                pohanchne mein help
                karega.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <FooterTag text="AI Powered" />

                <FooterTag text="Verified Users" />

                <FooterTag text="Pakistan" />
              </div>
            </div>

            <FooterColumn
              title="Product"
              links={[
                "Find",
                "Buyer Requirements",
                "Seller Listings",
                "How It Works",
              ]}
            />

            <FooterColumn
              title="Support"
              links={[
                "Help Center",
                "WhatsApp Support",
                "Contact Us",
                "FAQs",
              ]}
            />

            <FooterColumn
              title="Trust & Safety"
              links={[
                "User Verification",
                "Privacy Policy",
                "Terms & Conditions",
                "Report an Issue",
              ]}
            />
          </div>

          {/* CONTACT */}

          <div
            className="
              mt-14
              grid
              gap-4
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/60
              p-5
              md:grid-cols-3
            "
          >
            <FooterContact
              title="WhatsApp"
              value="+92 3XX XXXXXXX"
            />

            <FooterContact
              title="Email"
              value="support@khojmarket.pk"
            />

            <FooterContact
              title="Location"
              value="Pakistan"
            />
          </div>
        </div>

        {/* BOTTOM */}

        <div className="border-t border-slate-800">
          <div
            className="
              mx-auto
              flex
              max-w-7xl
              flex-col
              items-center
              justify-between
              gap-4
              px-6
              py-6
              text-center
              text-sm
              text-slate-500
              md:flex-row
            "
          >
            <p>
              © 2026 KhojMarket.
              All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-5">
              <button
                type="button"
                className="transition hover:text-white"
              >
                Privacy
              </button>

              <button
                type="button"
                className="transition hover:text-white"
              >
                Terms
              </button>

              <button
                type="button"
                className="transition hover:text-white"
              >
                Cookies
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* =================================================
          REQUIREMENT MODAL
      ================================================= */}

      {showRequirementModal &&
        requirement && (
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
              handleFieldChange
            }
            onRequirementChange={
              setRequirement
            }
            onSave={
              handleSaveRequirement
            }
          />
        )}

      {/* =================================================
          OTP / FAST VERIFICATION
      ================================================= */}

      <FastVerificationModal
        open={
          showFastVerification
        }
        phone={
          currentUser?.phone || ""
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

      {/* =================================================
          SUCCESS TOAST
      ================================================= */}

      {successMessage && (
        <div
          className="
            fixed
            bottom-6
            right-6
            z-[80]
            flex
            max-w-sm
            items-start
            gap-3
            rounded-2xl
            bg-emerald-600
            px-5
            py-4
            text-sm
            font-semibold
            text-white
            shadow-2xl
          "
        >
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>
            {successMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="ml-2 text-white/70 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================
// REQUIREMENT MODAL
// =====================================================

interface RequirementModalProps {
  requirement: StructuredRequirement;

  onClose: () => void;

  onFieldChange: (
    fieldId: string,
    value: string
  ) => void;

  onRequirementChange: (
    requirement: StructuredRequirement
  ) => void;

  onSave: () => void;
}

function RequirementModal({
  requirement,
  onClose,
  onFieldChange,
  onRequirementChange,
  onSave,
}: RequirementModalProps) {
  const missingRequired =
    requirement.fields.filter(
      (field) =>
        field.required &&
        !field.value.trim()
    );

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/55
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          max-h-[90vh]
          w-full
          max-w-3xl
          overflow-y-auto
          rounded-3xl
          bg-white
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            sticky
            top-0
            z-10
            flex
            items-start
            justify-between
            border-b
            border-slate-200
            bg-white
            px-7
            py-6
          "
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              AI Generated
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Review Your
              Requirement
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              AI ne ye details
              identify ki hain.
              Missing information
              complete karke save
              karein.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              hover:bg-slate-100
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="p-7">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-start gap-3">
              <Sparkles
                size={18}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="text-sm font-bold text-slate-900">
                  AI generated
                  requirement
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Details verify
                  karna buyer ki
                  responsibility
                  hogi. Save ke baad
                  phone verification
                  hogi.
                </p>
              </div>
            </div>
          </div>

          {/* CATEGORY */}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Category
              </label>

              <input
                value={
                  requirement.category
                }
                onChange={(event) =>
                  onRequirementChange({
                    ...requirement,

                    category:
                      event.target
                        .value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Sub Category
              </label>

              <input
                value={
                  requirement.subCategory ||
                  ""
                }
                onChange={(event) =>
                  onRequirementChange({
                    ...requirement,

                    subCategory:
                      event.target
                        .value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* TITLE */}

          <div className="mt-5">
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
              Requirement Title
            </label>

            <input
              value={
                requirement.title
              }
              onChange={(event) =>
                onRequirementChange({
                  ...requirement,

                  title:
                    event.target
                      .value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* DYNAMIC FIELDS */}

          <div className="mt-7">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">
                  Requirement
                  Details
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Category ke
                  according dynamic
                  fields.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {
                  requirement.fields
                    .length
                }{" "}
                fields
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {requirement.fields.map(
                (
                  field: RequirementField
                ) => {
                  const missing =
                    field.required &&
                    !field.value.trim();

                  return (
                    <div
                      key={
                        field.id
                      }
                    >
                      <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                        {
                          field.label
                        }

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
                            event
                              .target
                              .value
                          )
                        }
                        placeholder={`Enter ${field.label}`}
                        className={`
                          w-full
                          rounded-xl
                          border
                          px-4
                          py-3
                          outline-none
                          transition
                          focus:border-blue-500

                          ${
                            missing
                              ? "border-amber-300 bg-amber-50"
                              : "border-slate-200 bg-slate-50"
                          }
                        `}
                      />
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* MISSING */}

          {missingRequired.length >
            0 && (
            <div className="mt-6 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle
                size={19}
                className="shrink-0"
              />

              <div>
                <p className="font-bold">
                  Important details
                  missing
                </p>

                <p className="mt-1">
                  {missingRequired
                    .map(
                      (field) =>
                        field.label
                    )
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* VERIFICATION INFO */}

          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="text-sm font-bold">
                  What happens next?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Save ke baad
                  login/register
                  check hoga, phir
                  phone OTP
                  verification.
                  Requirement uske
                  baad AI verification
                  queue mein jayegi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        <div
          className="
            sticky
            bottom-0
            flex
            justify-end
            gap-3
            border-t
            border-slate-200
            bg-white
            px-7
            py-5
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-slate-950
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:bg-blue-600
            "
          >
            <Save size={17} />

            Save Requirement
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// HOW CARD
// =====================================================

interface HowCardProps {
  icon: ReactNode;
  number: string;
  title: string;
  description: string;
}

function HowCard({
  icon,
  number,
  title,
  description,
}: HowCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
          {icon}
        </div>

        <span className="text-3xl font-black text-slate-200">
          {number}
        </span>
      </div>

      <h3 className="mt-6 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

// =====================================================
// TRUST CARD
// =====================================================

function TrustCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="mt-5 font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

// =====================================================
// REVIEW
// =====================================================

interface ReviewProps {
  name: string;
  city: string;
  text: string;
}

function Review({
  name,
  city,
  text,
}: ReviewProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5 text-lg">
        ★★★★★
      </div>

      <p className="leading-7 text-slate-600">
        "{text}"
      </p>

      <div className="mt-6">
        <p className="font-bold">
          {name}
        </p>

        <p className="text-sm text-slate-400">
          {city}
        </p>
      </div>
    </div>
  );
}

// =====================================================
// FOOTER TAG
// =====================================================

function FooterTag({
  text,
}: {
  text: string;
}) {
  return (
    <span
      className="
        rounded-full
        border
        border-slate-800
        bg-slate-900
        px-3
        py-1.5
        text-xs
        text-slate-400
      "
    >
      {text}
    </span>
  );
}

// =====================================================
// FOOTER COLUMN
// =====================================================

interface FooterColumnProps {
  title: string;
  links: string[];
}

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-bold text-white">
        {title}
      </h3>

      <div className="mt-5 space-y-3">
        {links.map((link) => (
          <button
            key={link}
            type="button"
            className="
              block
              text-sm
              text-slate-400
              transition
              hover:text-white
            "
          >
            {link}
          </button>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// FOOTER CONTACT
// =====================================================

interface FooterContactProps {
  title: string;
  value: string;
}

function FooterContact({
  title,
  value,
}: FooterContactProps) {
  return (
    <div className="text-center md:text-left">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-1 font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}