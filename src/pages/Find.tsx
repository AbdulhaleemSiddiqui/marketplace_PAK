import {
    BadgeCheck,
    Coins,
    Filter,
    MapPin,
    MessageCircle,
    Phone,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Store,
    X,
  } from "lucide-react";
  
  import {
    useMemo,
    useState,
  } from "react";
  
  import {
    Link,
    useNavigate,
  } from "react-router-dom";
  
  import SendInquiryModal from "../components/seller/SendInquiryModal";
  
  import {
    getCurrentUser,
  } from "../services/authService";
  
  import {
    getCreditBalance,
  } from "../services/creditService";
  
  import {
    DEFAULT_INQUIRY_COST,
    hasSellerAlreadyInquired,
    sendInquiry,
  } from "../services/inquiryService";
  
  import {
    getVerifiedBuyerRequirements,
  } from "../services/requirementService";
  
  import type {
    SavedBuyerRequirement,
  } from "../types/marketplace";
  
  type FindTab =
    | "requirements"
    | "listings";
  
  interface DemoSellerListing {
    id: string;
  
    title: string;
  
    category: string;
  
    subCategory?: string;
  
    location: string;
  
    price: string;
  
    sellerName: string;
  
    sellerPhone: string;
  
    sellerEmail: string;
  
    description: string;
  
    verified: boolean;
  }
  
  // =====================================================
  // DEMO REQUIREMENTS
  // =====================================================
  
  const demoBuyerRequirements:
    SavedBuyerRequirement[] = [
    {
      id: "demo-corolla",
  
      userId:
        "demo-buyer-corolla",
  
      title:
        "Toyota Corolla Required",
  
      category: "Vehicles",
  
      subCategory: "Cars",
  
      status: "verified",
  
      phoneVerified: true,
  
      aiVerified: true,
  
      createdAt:
        "2026-09-05T10:00:00.000Z",
  
      updatedAt:
        "2026-09-05T10:00:00.000Z",
  
      fields: [
        {
          id: "make",
          label: "Make",
          value: "Toyota",
          required: true,
        },
  
        {
          id: "model",
          label: "Model",
          value: "Corolla",
          required: true,
        },
  
        {
          id: "year",
          label: "Year",
          value:
            "2020 - 2023",
          required: true,
        },
  
        {
          id: "condition",
          label: "Condition",
          value:
            "Excellent",
          required: true,
        },
  
        {
          id: "budget",
          label: "Budget",
          value:
            "PKR 5,500,000",
          required: true,
        },
  
        {
          id: "location",
          label: "Location",
          value: "Lahore",
          required: true,
        },
      ],
    },
  
    {
      id: "demo-rado",
  
      userId:
        "demo-buyer-rado",
  
      title:
        "Original Rado Watch Required",
  
      category: "Fashion",
  
      subCategory:
        "Watches",
  
      status: "verified",
  
      phoneVerified: true,
  
      aiVerified: true,
  
      createdAt:
        "2026-09-04T10:00:00.000Z",
  
      updatedAt:
        "2026-09-04T10:00:00.000Z",
  
      fields: [
        {
          id: "brand",
          label: "Brand",
          value: "Rado",
          required: true,
        },
  
        {
          id: "condition",
          label: "Condition",
          value:
            "New / Like New",
          required: true,
        },
  
        {
          id: "authenticity",
          label:
            "Authenticity",
          value: "Original",
          required: true,
        },
  
        {
          id: "budget",
          label: "Budget",
          value:
            "PKR 250,000",
          required: true,
        },
  
        {
          id: "location",
          label: "Location",
          value: "Karachi",
          required: true,
        },
      ],
    },
  
    {
      id: "demo-cement",
  
      userId:
        "demo-buyer-cement",
  
      title:
        "Cement Required for House Construction",
  
      category:
        "Construction",
  
      subCategory:
        "Building Material",
  
      status: "verified",
  
      phoneVerified: true,
  
      aiVerified: true,
  
      createdAt:
        "2026-09-03T10:00:00.000Z",
  
      updatedAt:
        "2026-09-03T10:00:00.000Z",
  
      fields: [
        {
          id: "material",
          label: "Material",
          value: "Cement",
          required: true,
        },
  
        {
          id: "quantity",
          label: "Quantity",
          value: "400 Bags",
          required: true,
        },
  
        {
          id: "brand",
          label:
            "Preferred Brand",
          value:
            "Lucky / Bestway",
          required: false,
        },
  
        {
          id: "delivery",
          label: "Delivery",
          value:
            "Within 3 Days",
          required: true,
        },
  
        {
          id: "location",
          label: "Location",
          value: "Islamabad",
          required: true,
        },
      ],
    },
  
    {
      id: "demo-iphone",
  
      userId:
        "demo-buyer-iphone",
  
      title:
        "iPhone 16 Pro Required",
  
      category:
        "Electronics",
  
      subCategory:
        "Mobile Phones",
  
      status: "verified",
  
      phoneVerified: true,
  
      aiVerified: true,
  
      createdAt:
        "2026-09-02T10:00:00.000Z",
  
      updatedAt:
        "2026-09-02T10:00:00.000Z",
  
      fields: [
        {
          id: "model",
          label: "Model",
          value:
            "iPhone 16 Pro",
          required: true,
        },
  
        {
          id: "storage",
          label: "Storage",
          value: "256GB",
          required: true,
        },
  
        {
          id: "pta",
          label:
            "PTA Status",
          value:
            "PTA Approved",
          required: true,
        },
  
        {
          id: "budget",
          label: "Budget",
          value:
            "PKR 380,000",
          required: false,
        },
  
        {
          id: "location",
          label: "Location",
          value:
            "Rawalpindi",
          required: true,
        },
      ],
    },
  ];
  
  // =====================================================
  // DEMO SELLER LISTINGS
  // =====================================================
  
  const demoSellerListings:
    DemoSellerListing[] = [
    {
      id: "listing-samsung",
  
      title:
        "Samsung Galaxy S25 Ultra",
  
      category:
        "Electronics",
  
      subCategory:
        "Mobile Phones",
  
      location: "Karachi",
  
      price:
        "PKR 365,000",
  
      sellerName:
        "Tech Zone",
  
      sellerPhone:
        "+92 300 1234567",
  
      sellerEmail:
        "sales@techzone.pk",
  
      description:
        "Brand new Samsung Galaxy S25 Ultra. PTA approved. Official warranty available.",
  
      verified: true,
    },
  
    {
      id: "listing-corolla",
  
      title:
        "Toyota Corolla Altis 2022",
  
      category:
        "Vehicles",
  
      subCategory: "Cars",
  
      location: "Lahore",
  
      price:
        "PKR 5,750,000",
  
      sellerName:
        "Pak Motors",
  
      sellerPhone:
        "+92 301 5557788",
  
      sellerEmail:
        "sales@pakmotors.pk",
  
      description:
        "Toyota Corolla Altis automatic, excellent condition and complete documents.",
  
      verified: true,
    },
  
    {
      id: "listing-cement",
  
      title:
        "Lucky Cement Bulk Supply",
  
      category:
        "Construction",
  
      subCategory:
        "Building Material",
  
      location:
        "Islamabad",
  
      price:
        "Market Rate",
  
      sellerName:
        "Capital Building Supplies",
  
      sellerPhone:
        "+92 333 7865544",
  
      sellerEmail:
        "sales@capitalbuilding.pk",
  
      description:
        "Bulk cement supply available for residential and commercial projects.",
  
      verified: true,
    },
  
    {
      id: "listing-rado",
  
      title:
        "Original Rado Watches",
  
      category:
        "Fashion",
  
      subCategory:
        "Watches",
  
      location: "Karachi",
  
      price:
        "From PKR 180,000",
  
      sellerName:
        "Royal Watches",
  
      sellerPhone:
        "+92 321 9876543",
  
      sellerEmail:
        "sales@royalwatches.pk",
  
      description:
        "Original luxury watches with box and papers. Multiple Rado models available.",
  
      verified: true,
    },
  ];
  
  // =====================================================
  // FIND
  // =====================================================
  
  export default function Find() {
    const navigate =
      useNavigate();
  
    const currentUser =
      getCurrentUser();
  
    const [
      activeTab,
      setActiveTab,
    ] =
      useState<FindTab>(
        "requirements"
      );
  
    const [
      searchText,
      setSearchText,
    ] = useState("");
  
    const [
      location,
      setLocation,
    ] = useState("");
  
    const [
      category,
      setCategory,
    ] = useState("");
  
    const [
      verifiedOnly,
      setVerifiedOnly,
    ] = useState(false);
  
    const [
      showMobileFilters,
      setShowMobileFilters,
    ] = useState(false);
  
    const [
      selectedRequirement,
      setSelectedRequirement,
    ] =
      useState<SavedBuyerRequirement | null>(
        null
      );
  
    const [
      detailRequirement,
      setDetailRequirement,
    ] =
      useState<SavedBuyerRequirement | null>(
        null
      );
  
    const [
      selectedListing,
      setSelectedListing,
    ] =
      useState<DemoSellerListing | null>(
        null
      );
  
    const [
      successMessage,
      setSuccessMessage,
    ] = useState("");
  
    const [
      refreshKey,
      setRefreshKey,
    ] = useState(0);
  
    void refreshKey;
  
    // =====================================================
    // REAL + DEMO
    // =====================================================
  
    const realRequirements =
      getVerifiedBuyerRequirements();
  
    const publicRequirements = [
      ...realRequirements,
      ...demoBuyerRequirements,
    ];
  
    const sellerBalance =
      currentUser?.role ===
      "seller"
        ? getCreditBalance(
            currentUser.id
          )
        : 0;
  
    // =====================================================
    // FILTER REQUIREMENTS
    // =====================================================
  
    const filteredRequirements =
      useMemo(() => {
        const query =
          searchText
            .trim()
            .toLowerCase();
  
        return publicRequirements.filter(
          (item) => {
            const searchable = [
              item.title,
              item.category,
              item.subCategory ??
                "",
  
              ...item.fields.map(
                (field) =>
                  `${field.label} ${field.value}`
              ),
            ]
              .join(" ")
              .toLowerCase();
  
            const itemLocation =
              getFieldValue(
                item,
                "location"
              ).toLowerCase();
  
            return (
              (!query ||
                searchable.includes(
                  query
                )) &&
              (!location ||
                itemLocation.includes(
                  location.toLowerCase()
                )) &&
              (!category ||
                item.category
                  .toLowerCase()
                  .includes(
                    category.toLowerCase()
                  )) &&
              (!verifiedOnly ||
                item.aiVerified)
            );
          }
        );
      }, [
        publicRequirements,
        searchText,
        location,
        category,
        verifiedOnly,
      ]);
  
    // =====================================================
    // FILTER LISTINGS
    // =====================================================
  
    const filteredListings =
      useMemo(() => {
        const query =
          searchText
            .trim()
            .toLowerCase();
  
        return demoSellerListings.filter(
          (item) => {
            const searchable =
              `${item.title} ${item.category} ${item.subCategory ?? ""} ${item.location} ${item.sellerName} ${item.description}`.toLowerCase();
  
            return (
              (!query ||
                searchable.includes(
                  query
                )) &&
              (!location ||
                item.location
                  .toLowerCase()
                  .includes(
                    location.toLowerCase()
                  )) &&
              (!category ||
                item.category
                  .toLowerCase()
                  .includes(
                    category.toLowerCase()
                  )) &&
              (!verifiedOnly ||
                item.verified)
            );
          }
        );
      }, [
        searchText,
        location,
        category,
        verifiedOnly,
      ]);
  
    // =====================================================
    // INQUIRY
    // =====================================================
  
    const handleOpenInquiry = (
      requirement:
        SavedBuyerRequirement
    ) => {
      const user =
        getCurrentUser();
  
      if (!user) {
        navigate(
          `/login?role=seller&returnUrl=${encodeURIComponent(
            "/find"
          )}`
        );
  
        return;
      }
  
      if (
        user.role !==
        "seller"
      ) {
        alert(
          "Inquiry send karne ke liye Seller account required hai."
        );
  
        return;
      }
  
      if (
        user.sellerVerificationStatus !==
        "verified"
      ) {
        alert(
          "Pehle Seller Verification complete karein."
        );
  
        navigate(
          "/profile"
        );
  
        return;
      }
  
      if (
        hasSellerAlreadyInquired(
          requirement.id,
          user.id
        )
      ) {
        alert(
          "Aap is requirement par already inquiry send kar chuke hain."
        );
  
        return;
      }
  
      setDetailRequirement(
        null
      );
  
      setSelectedRequirement(
        requirement
      );
    };
  
    const handleConfirmInquiry = (
      message: string,
      offeredPrice: string
    ) => {
      const user =
        getCurrentUser();
  
      if (
        !user ||
        !selectedRequirement
      ) {
        return;
      }
  
      try {
        sendInquiry({
          requirement:
            selectedRequirement,
  
          seller: user,
  
          message,
  
          offeredPrice,
        });
  
        setSelectedRequirement(
          null
        );
  
        setSuccessMessage(
          `Inquiry sent successfully. ${DEFAULT_INQUIRY_COST} credits deducted.`
        );
  
        setRefreshKey(
          (value) =>
            value + 1
        );
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Inquiry failed."
        );
      }
    };
  
    // =====================================================
    // CONTACT SELLER
    // =====================================================
  
    const handleContactSeller = (
      listing:
        DemoSellerListing
    ) => {
      const user =
        getCurrentUser();
  
      if (!user) {
        navigate(
          `/login?role=buyer&returnUrl=${encodeURIComponent(
            "/find"
          )}`
        );
  
        return;
      }
  
      if (
        user.role !==
        "buyer"
      ) {
        alert(
          "Seller ko contact karne ke liye Buyer account required hai."
        );
  
        return;
      }
  
      setSelectedListing(
        listing
      );
    };
  
    return (
      <div className="min-h-screen bg-slate-50">
        {/* HEADER */}
  
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
              to="/"
              className="text-xl font-black"
            >
              Khoj
              <span className="text-blue-600">
                Market
              </span>
            </Link>
  
            <nav className="hidden items-center gap-7 md:flex">
              <Link
                to="/find"
                className="font-semibold text-blue-600"
              >
                Find
              </Link>
  
              <Link
                to="/#how-it-works"
                className="text-sm font-semibold text-slate-600"
              >
                How It Works
              </Link>
            </nav>
  
            <div className="flex items-center gap-3">
              {currentUser?.role ===
                "seller" && (
                <div className="hidden items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 sm:flex">
                  <Coins
                    size={17}
                  />
  
                  {sellerBalance} Credits
                </div>
              )}
  
              {currentUser ? (
                <Link
                  to="/profile"
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                >
                  My Profile
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>
  
        {/* MAIN */}
  
        <main className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm font-bold text-blue-600">
            MARKETPLACE
          </p>
  
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Find what Pakistan
            needs & sells
          </h1>
  
          <p className="mt-3 text-slate-500">
            Buyer requirements aur
            seller listings ek hi
            marketplace mein.
          </p>
  
          {/* TABS */}
  
          <div className="mt-8 inline-flex rounded-2xl border border-slate-200 bg-white p-1.5">
            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "requirements"
                )
              }
              className={`rounded-xl px-5 py-3 text-sm font-bold ${
                activeTab ===
                "requirements"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500"
              }`}
            >
              Buyer Requirements
  
              <span className="ml-2">
                {
                  publicRequirements.length
                }
              </span>
            </button>
  
            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "listings"
                )
              }
              className={`rounded-xl px-5 py-3 text-sm font-bold ${
                activeTab ===
                "listings"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500"
              }`}
            >
              Seller Listings
  
              <span className="ml-2">
                {
                  demoSellerListings.length
                }
              </span>
            </button>
          </div>
  
          {/* SEARCH */}
  
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
  
              <input
                value={
                  searchText
                }
                onChange={(
                  event
                ) =>
                  setSearchText(
                    event.target
                      .value
                  )
                }
                placeholder="Search..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />
            </div>
  
            <div className="relative md:w-64">
              <MapPin
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
  
              <input
                value={location}
                onChange={(
                  event
                ) =>
                  setLocation(
                    event.target
                      .value
                  )
                }
                placeholder="Location"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />
            </div>
  
            <button
              type="button"
              onClick={() =>
                setShowMobileFilters(
                  true
                )
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold lg:hidden"
            >
              <SlidersHorizontal
                size={18}
              />
  
              Filters
            </button>
          </div>
  
          {/* BODY */}
  
          <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
            <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:block">
              <Filters
                category={
                  category
                }
                setCategory={
                  setCategory
                }
                verifiedOnly={
                  verifiedOnly
                }
                setVerifiedOnly={
                  setVerifiedOnly
                }
              />
            </aside>
  
            <section>
              <p className="mb-4 text-sm text-slate-500">
                {activeTab ===
                "requirements"
                  ? `${filteredRequirements.length} buyer requirements`
                  : `${filteredListings.length} seller listings`}
              </p>
  
              {activeTab ===
              "requirements" ? (
                <div className="space-y-4">
                  {filteredRequirements.map(
                    (item) => (
                      <RequirementCard
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                        alreadyInquired={
                          currentUser?.role ===
                          "seller"
                            ? hasSellerAlreadyInquired(
                                item.id,
                                currentUser.id
                              )
                            : false
                        }
                        onView={() =>
                          setDetailRequirement(
                            item
                          )
                        }
                        onSendInquiry={() =>
                          handleOpenInquiry(
                            item
                          )
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                // IMPORTANT:
                // ONE CARD PER ROW
                <div className="space-y-4">
                  {filteredListings.map(
                    (item) => (
                      <ListingCard
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                        onContact={() =>
                          handleContactSeller(
                            item
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
  
        {/* MOBILE FILTERS */}
  
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6">
              <div className="flex justify-between">
                <h2 className="font-black">
                  Filters
                </h2>
  
                <button
                  onClick={() =>
                    setShowMobileFilters(
                      false
                    )
                  }
                >
                  <X size={20} />
                </button>
              </div>
  
              <div className="mt-6">
                <Filters
                  category={
                    category
                  }
                  setCategory={
                    setCategory
                  }
                  verifiedOnly={
                    verifiedOnly
                  }
                  setVerifiedOnly={
                    setVerifiedOnly
                  }
                />
              </div>
            </div>
          </div>
        )}
  
        {/* REQUIREMENT DETAIL */}
  
        {detailRequirement && (
          <RequirementDetailModal
            requirement={
              detailRequirement
            }
            alreadyInquired={
              currentUser?.role ===
              "seller"
                ? hasSellerAlreadyInquired(
                    detailRequirement.id,
                    currentUser.id
                  )
                : false
            }
            onClose={() =>
              setDetailRequirement(
                null
              )
            }
            onSendInquiry={() =>
              handleOpenInquiry(
                detailRequirement
              )
            }
          />
        )}
  
        {/* INQUIRY */}
  
        <SendInquiryModal
          open={
            !!selectedRequirement
          }
          requirement={
            selectedRequirement
          }
          currentBalance={
            currentUser?.role ===
            "seller"
              ? getCreditBalance(
                  currentUser.id
                )
              : 0
          }
          inquiryCost={
            DEFAULT_INQUIRY_COST
          }
          onClose={() =>
            setSelectedRequirement(
              null
            )
          }
          onConfirm={
            handleConfirmInquiry
          }
        />
  
        {/* CONTACT SELLER */}
  
        {selectedListing && (
          <SellerContactModal
            listing={
              selectedListing
            }
            onClose={() =>
              setSelectedListing(
                null
              )
            }
          />
        )}
  
        {successMessage && (
          <div className="fixed bottom-6 right-6 z-[150] rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white shadow-xl">
            {successMessage}
          </div>
        )}
      </div>
    );
  }
  
  // =====================================================
  // REQUIREMENT CARD
  // =====================================================
  
  function RequirementCard({
    item,
    alreadyInquired,
    onView,
    onSendInquiry,
  }: {
    item:
      SavedBuyerRequirement;
  
    alreadyInquired: boolean;
  
    onView: () => void;
  
    onSendInquiry: () => void;
  }) {
    const location =
      getFieldValue(
        item,
        "location"
      );
  
    const budget =
      getFieldValue(
        item,
        "budget"
      );
  
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black">
                {item.title}
              </h2>
  
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                <BadgeCheck
                  size={13}
                />
  
                Verified Requirement
              </span>
            </div>
  
            <p className="mt-2 text-sm text-slate-500">
              {item.category}
  
              {item.subCategory
                ? ` • ${item.subCategory}`
                : ""}
            </p>
  
            {location && (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <MapPin
                  size={15}
                />
  
                {location}
              </p>
            )}
  
            <div className="mt-5 flex flex-wrap gap-2">
              {item.fields
                .filter(
                  (field) =>
                    field.value &&
                    field.id !==
                      "location" &&
                    field.id !==
                      "budget"
                )
                .slice(0, 4)
                .map(
                  (field) => (
                    <span
                      key={
                        field.id
                      }
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600"
                    >
                      {field.label}:{" "}
                      {
                        field.value
                      }
                    </span>
                  )
                )}
            </div>
  
            {budget && (
              <p className="mt-5 font-bold">
                Budget:{" "}
  
                <span className="text-blue-600">
                  {budget}
                </span>
              </p>
            )}
          </div>
  
          <div className="flex shrink-0 flex-col justify-end gap-2">
            <button
              type="button"
              onClick={onView}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
            >
              View Requirement
            </button>
  
            {alreadyInquired ? (
              <div className="rounded-xl bg-emerald-50 px-5 py-3 text-center text-sm font-semibold text-emerald-600">
                Inquiry Sent
              </div>
            ) : (
              <button
                type="button"
                onClick={
                  onSendInquiry
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
              >
                <MessageCircle
                  size={17}
                />
  
                Send Inquiry
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }
  
  // =====================================================
  // SELLER LISTING
  // =====================================================
  
  function ListingCard({
    item,
    onContact,
  }: {
    item:
      DemoSellerListing;
  
    onContact: () => void;
  }) {
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase text-blue-600">
                {item.category}
              </p>
  
              {item.verified && (
                <BadgeCheck
                  size={16}
                  className="text-emerald-600"
                />
              )}
            </div>
  
            <h2 className="mt-3 text-xl font-black">
              {item.title}
            </h2>
  
            <p className="mt-2 text-sm text-slate-500">
              {item.subCategory}
              {" • "}
              {item.location}
            </p>
  
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              {item.description}
            </p>
  
            <div className="mt-5 flex items-center gap-2 text-sm">
              <Store
                size={15}
                className="text-slate-400"
              />
  
              <span className="font-semibold">
                {
                  item.sellerName
                }
              </span>
  
              <span className="text-xs font-semibold text-emerald-600">
                Verified Seller
              </span>
            </div>
          </div>
  
          <div className="shrink-0">
            <p className="mb-4 text-xl font-black text-blue-600">
              {item.price}
            </p>
  
            <button
              type="button"
              onClick={
                onContact
              }
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
            >
              <Phone
                size={16}
              />
  
              Contact Seller
            </button>
          </div>
        </div>
      </article>
    );
  }
  
  // =====================================================
  // CONTACT MODAL
  // =====================================================
  
  function SellerContactModal({
    listing,
    onClose,
  }: {
    listing:
      DemoSellerListing;
  
    onClose: () => void;
  }) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-600">
                <BadgeCheck
                  size={14}
                />
  
                Verified Seller
              </p>
  
              <h2 className="mt-2 text-2xl font-black">
                {
                  listing.sellerName
                }
              </h2>
  
              <p className="mt-2 text-sm text-slate-500">
                {
                  listing.title
                }
              </p>
            </div>
  
            <button
              onClick={
                onClose
              }
            >
              <X size={20} />
            </button>
          </div>
  
          <div className="mt-6 space-y-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Phone
              </p>
  
              <p className="mt-1 font-bold">
                {
                  listing.sellerPhone
                }
              </p>
            </div>
  
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Email
              </p>
  
              <p className="mt-1 font-bold">
                {
                  listing.sellerEmail
                }
              </p>
            </div>
          </div>
  
          <a
            href={`tel:${listing.sellerPhone}`}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white"
          >
            <Phone
              size={17}
            />
  
            Call Seller
          </a>
        </div>
      </div>
    );
  }
  
  // =====================================================
  // REQUIREMENT DETAIL
  // =====================================================
  
  function RequirementDetailModal({
    requirement,
    alreadyInquired,
    onClose,
    onSendInquiry,
  }: {
    requirement:
      SavedBuyerRequirement;
  
    alreadyInquired: boolean;
  
    onClose: () => void;
  
    onSendInquiry: () => void;
  }) {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7">
          <div className="flex justify-between gap-5">
            <div>
              <h2 className="text-2xl font-black">
                {
                  requirement.title
                }
              </h2>
  
              <p className="mt-2 text-sm text-slate-500">
                {
                  requirement.category
                }{" "}
                •{" "}
                {
                  requirement.subCategory
                }
              </p>
            </div>
  
            <button
              onClick={
                onClose
              }
            >
              <X size={20} />
            </button>
          </div>
  
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {requirement.fields
              .filter(
                (field) =>
                  field.value
              )
              .map(
                (field) => (
                  <div
                    key={
                      field.id
                    }
                    className="rounded-xl bg-slate-50 p-4"
                  >
                    <p className="text-xs text-slate-400">
                      {
                        field.label
                      }
                    </p>
  
                    <p className="mt-1 font-bold">
                      {
                        field.value
                      }
                    </p>
                  </div>
                )
              )}
          </div>
  
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            <ShieldCheck className="mr-2 inline h-4 w-4" />
  
            Verified Requirement
          </div>
  
          {!alreadyInquired && (
            <button
              type="button"
              onClick={
                onSendInquiry
              }
              className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white hover:bg-blue-600"
            >
              Send Inquiry •{" "}
              {
                DEFAULT_INQUIRY_COST
              }{" "}
              Credits
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // =====================================================
  // FILTERS
  // =====================================================
  
  function Filters({
    category,
    setCategory,
    verifiedOnly,
    setVerifiedOnly,
  }: {
    category: string;
  
    setCategory: (
      value: string
    ) => void;
  
    verifiedOnly: boolean;
  
    setVerifiedOnly: (
      value: boolean
    ) => void;
  }) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Filter size={17} />
  
          <h3 className="font-bold">
            Filters
          </h3>
        </div>
  
        <select
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value
            )
          }
          className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
        >
          <option value="">
            All Categories
          </option>
  
          <option value="Electronics">
            Electronics
          </option>
  
          <option value="Vehicles">
            Vehicles
          </option>
  
          <option value="Fashion">
            Fashion
          </option>
  
          <option value="Construction">
            Construction
          </option>
        </select>
  
        <label className="mt-5 flex items-center gap-3">
          <input
            type="checkbox"
            checked={
              verifiedOnly
            }
            onChange={(
              event
            ) =>
              setVerifiedOnly(
                event.target
                  .checked
              )
            }
          />
  
          <span className="text-sm font-semibold">
            Verified only
          </span>
        </label>
      </div>
    );
  }
  
  // =====================================================
  // FIELD VALUE
  // =====================================================
  
  function getFieldValue(
    requirement:
      SavedBuyerRequirement,
    fieldName: string
  ) {
    const target =
      fieldName
        .trim()
        .toLowerCase();
  
    return (
      requirement.fields.find(
        (field) =>
          field.id
            .trim()
            .toLowerCase() ===
            target ||
          field.label
            .trim()
            .toLowerCase() ===
            target
      )?.value ?? ""
    );
  }