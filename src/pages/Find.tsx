import {
    BadgeCheck,
    Coins,
    Filter,
    MapPin,
    MessageCircle,
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
  
  // =====================================================
  // TYPES
  // =====================================================
  
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
  
    description: string;
  
    verified: boolean;
  }
  
  // =====================================================
  // DEMO BUYER REQUIREMENTS
  //
  // YAHI wo jagah hai:
  // imports ke baad,
  // export default function Find() se PEHLE.
  // =====================================================
  
  const demoBuyerRequirements: SavedBuyerRequirement[] =
    [
      {
        id: "demo-req-car-1",
  
        userId:
          "demo-buyer-car",
  
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
            value: "2020 - 2023",
            required: true,
          },
  
          {
            id: "transmission",
            label: "Transmission",
            value: "Automatic",
            required: false,
          },
  
          {
            id: "condition",
            label: "Condition",
            value: "Used - Excellent",
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
        id: "demo-req-watch-1",
  
        userId:
          "demo-buyer-watch",
  
        title:
          "Original Rado Watch Required",
  
        category: "Fashion",
  
        subCategory:
          "Watches",
  
        status: "verified",
  
        phoneVerified: true,
  
        aiVerified: true,
  
        createdAt:
          "2026-09-04T11:00:00.000Z",
  
        updatedAt:
          "2026-09-04T11:00:00.000Z",
  
        fields: [
          {
            id: "brand",
            label: "Brand",
            value: "Rado",
            required: true,
          },
  
          {
            id: "authenticity",
            label: "Authenticity",
            value: "Original",
            required: true,
          },
  
          {
            id: "condition",
            label: "Condition",
            value:
              "New / Like New",
            required: false,
          },
  
          {
            id: "boxpapers",
            label: "Box & Papers",
            value: "Preferred",
            required: false,
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
        id: "demo-req-construction-1",
  
        userId:
          "demo-buyer-construction",
  
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
          "2026-09-03T12:00:00.000Z",
  
        updatedAt:
          "2026-09-03T12:00:00.000Z",
  
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
              "Bestway / Lucky",
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
        id: "demo-req-mobile-1",
  
        userId:
          "demo-buyer-mobile",
  
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
          "2026-09-02T13:00:00.000Z",
  
        updatedAt:
          "2026-09-02T13:00:00.000Z",
  
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
            id: "condition",
            label: "Condition",
            value: "New",
            required: true,
          },
  
          {
            id: "pta",
            label: "PTA Status",
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
  
      {
        id: "demo-req-ac-1",
  
        userId:
          "demo-buyer-ac",
  
        title:
          "1.5 Ton Inverter AC Required",
  
        category:
          "Electronics",
  
        subCategory:
          "Home Appliances",
  
        status: "verified",
  
        phoneVerified: true,
  
        aiVerified: true,
  
        createdAt:
          "2026-09-01T14:00:00.000Z",
  
        updatedAt:
          "2026-09-01T14:00:00.000Z",
  
        fields: [
          {
            id: "capacity",
            label: "Capacity",
            value: "1.5 Ton",
            required: true,
          },
  
          {
            id: "type",
            label: "Type",
            value: "Inverter",
            required: true,
          },
  
          {
            id: "condition",
            label: "Condition",
            value: "New",
            required: true,
          },
  
          {
            id: "brand",
            label:
              "Preferred Brands",
            value:
              "Gree / Haier / Dawlance",
            required: false,
          },
  
          {
            id: "location",
            label: "Location",
            value: "Faisalabad",
            required: true,
          },
        ],
      },
    ];
  
  // =====================================================
  // DEMO SELLER LISTINGS
  // =====================================================
  
  const demoSellerListings: DemoSellerListing[] =
    [
      {
        id: "listing-1",
  
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
  
        description:
          "Brand new Samsung Galaxy S25 Ultra. PTA approved. Official warranty available.",
  
        verified: true,
      },
  
      {
        id: "listing-2",
  
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
  
        description:
          "Toyota Corolla Altis automatic, excellent condition, complete documents.",
  
        verified: true,
      },
  
      {
        id: "listing-3",
  
        title:
          "Lucky Cement Bulk Supply",
  
        category:
          "Construction",
  
        subCategory:
          "Building Material",
  
        location: "Islamabad",
  
        price:
          "Market Rate",
  
        sellerName:
          "Capital Building Supplies",
  
        description:
          "Cement supply available for residential and commercial construction projects.",
  
        verified: true,
      },
  
      {
        id: "listing-4",
  
        title:
          "Original Rado Watches",
  
        category: "Fashion",
  
        subCategory:
          "Watches",
  
        location: "Karachi",
  
        price:
          "From PKR 180,000",
  
        sellerName:
          "Royal Watches",
  
        description:
          "Original luxury watches with box and papers. Multiple Rado models available.",
  
        verified: true,
      },
    ];
  
  // =====================================================
  // FIND PAGE
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
      successMessage,
      setSuccessMessage,
    ] = useState("");
  
    const [
      refreshKey,
      setRefreshKey,
    ] = useState(0);
  
    void refreshKey;
  
    // =====================================================
    // REAL + DEMO REQUIREMENTS
    // =====================================================
  
    const realRequirements =
      getVerifiedBuyerRequirements();
  
    const publicRequirements = [
      ...realRequirements,
      ...demoBuyerRequirements,
    ];
  
    // =====================================================
    // SELLER BALANCE
    // =====================================================
  
    const sellerBalance =
      currentUser?.role ===
      "seller"
        ? getCreditBalance(
            currentUser.id
          )
        : 0;
  
    // =====================================================
    // FILTER BUYER REQUIREMENTS
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
  
              item.subCategory ||
                "",
  
              ...item.fields.map(
                (field) =>
                  `${field.label} ${field.value}`
              ),
            ]
              .join(" ")
              .toLowerCase();
  
            const requirementLocation =
              getFieldValue(
                item,
                "location"
              ).toLowerCase();
  
            const matchesSearch =
              !query ||
              searchable.includes(
                query
              );
  
            const matchesLocation =
              !location ||
              requirementLocation.includes(
                location.toLowerCase()
              );
  
            const matchesCategory =
              !category ||
              item.category
                .toLowerCase()
                .includes(
                  category.toLowerCase()
                );
  
            const matchesVerified =
              !verifiedOnly ||
              item.aiVerified;
  
            return (
              matchesSearch &&
              matchesLocation &&
              matchesCategory &&
              matchesVerified
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
    // FILTER SELLER LISTINGS
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
              `${item.title} ${item.category} ${item.subCategory ?? ""} ${item.location} ${item.sellerName} ${item.description}`
                .toLowerCase();
  
            const matchesSearch =
              !query ||
              searchable.includes(
                query
              );
  
            const matchesLocation =
              !location ||
              item.location
                .toLowerCase()
                .includes(
                  location.toLowerCase()
                );
  
            const matchesCategory =
              !category ||
              item.category
                .toLowerCase()
                .includes(
                  category.toLowerCase()
                );
  
            const matchesVerified =
              !verifiedOnly ||
              item.verified;
  
            return (
              matchesSearch &&
              matchesLocation &&
              matchesCategory &&
              matchesVerified
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
    // VIEW REQUIREMENT
    // =====================================================
  
    const handleViewRequirement = (
      requirement:
        SavedBuyerRequirement
    ) => {
      setDetailRequirement(
        requirement
      );
    };
  
    // =====================================================
    // OPEN INQUIRY
    // =====================================================
  
    const handleOpenInquiry = (
      requirement:
        SavedBuyerRequirement
    ) => {
      const user =
        getCurrentUser();
  
      if (!user) {
        navigate("/login");
  
        return;
      }
  
      if (
        user.role !== "seller"
      ) {
        alert(
          "Inquiry send karne ke liye Seller account se login karein."
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
        requirement.userId ===
        user.id
      ) {
        alert(
          "Aap apni requirement par inquiry nahi bhej sakte."
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
  
    // =====================================================
    // CONFIRM INQUIRY
    // =====================================================
  
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
          (value) => value + 1
        );
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Inquiry failed."
        );
      }
    };
  
    return (
      <div className="min-h-screen bg-slate-50">
        {/* =====================================================
            HEADER
        ===================================================== */}
  
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            {/* LOGO */}
  
            <Link
              to="/"
              className="text-xl font-black"
            >
              Khoj
              <span className="text-blue-600">
                Market
              </span>
            </Link>
  
            {/* NAVIGATION */}
  
            <nav className="hidden items-center gap-7 md:flex">
              <Link
                to="/find"
                className="font-semibold text-blue-600"
              >
                Find
              </Link>
  
              <Link
                to="/#how-it-works"
                className="text-sm font-semibold text-slate-600 hover:text-slate-950"
              >
                How It Works
              </Link>
            </nav>
  
            {/* ACCOUNT */}
  
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
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
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
  
        {/* =====================================================
            CONTENT
        ===================================================== */}
  
        <main className="mx-auto max-w-7xl px-6 py-8">
          {/* TITLE */}
  
          <div>
            <p className="text-sm font-bold text-blue-600">
              MARKETPLACE
            </p>
  
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Find what Pakistan
              needs & sells
            </h1>
  
            <p className="mt-3 max-w-2xl text-slate-500">
              Buyer requirements aur
              verified seller listings
              ek hi marketplace mein.
            </p>
          </div>
  
          {/* =====================================================
              IMPORTANT TABS
          ===================================================== */}
  
          <div className="mt-8 inline-flex max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5">
            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "requirements"
                )
              }
              className={`
                whitespace-nowrap
                rounded-xl
                px-5
                py-3
                text-sm
                font-bold
                transition
  
                ${
                  activeTab ===
                  "requirements"
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }
              `}
            >
              Buyer Requirements
  
              <span
                className={`
                  ml-2
                  rounded-full
                  px-2
                  py-0.5
                  text-xs
  
                  ${
                    activeTab ===
                    "requirements"
                      ? "bg-white/15"
                      : "bg-slate-100"
                  }
                `}
              >
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
              className={`
                whitespace-nowrap
                rounded-xl
                px-5
                py-3
                text-sm
                font-bold
                transition
  
                ${
                  activeTab ===
                  "listings"
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }
              `}
            >
              Seller Listings
  
              <span
                className={`
                  ml-2
                  rounded-full
                  px-2
                  py-0.5
                  text-xs
  
                  ${
                    activeTab ===
                    "listings"
                      ? "bg-white/15"
                      : "bg-slate-100"
                  }
                `}
              >
                {
                  demoSellerListings.length
                }
              </span>
            </button>
          </div>
  
          {/* SEARCH */}
  
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
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
                placeholder={
                  activeTab ===
                  "requirements"
                    ? "Search buyer requirements..."
                    : "Search seller listings..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white"
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
  
          {/* =====================================================
              BODY
          ===================================================== */}
  
          <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
            {/* FILTERS */}
  
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
  
            {/* RESULTS */}
  
            <section>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {activeTab ===
                  "requirements"
                    ? `${filteredRequirements.length} buyer requirements`
                    : `${filteredListings.length} seller listings`}
                </p>
  
                {currentUser?.role ===
                  "seller" &&
                  currentUser.sellerVerificationStatus !==
                    "verified" && (
                    <Link
                      to="/profile"
                      className="text-sm font-bold text-blue-600"
                    >
                      Verify Seller →
                    </Link>
                  )}
              </div>
  
              {/* BUYER REQUIREMENTS */}
  
              {activeTab ===
              "requirements" ? (
                filteredRequirements.length ===
                0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    {filteredRequirements.map(
                      (item) => (
                        <RequirementCard
                          key={
                            item.id
                          }
                          item={item}
                          alreadyInquired={
                            currentUser?.role ===
                            "seller"
                              ? hasSellerAlreadyInquired(
                                  item.id,
                                  currentUser.id
                                )
                              : false
                          }
                          sellerVerified={
                            currentUser?.role ===
                              "seller" &&
                            currentUser.sellerVerificationStatus ===
                              "verified"
                          }
                          onView={() =>
                            handleViewRequirement(
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
                )
              ) : filteredListings.length ===
                0 ? (
                <EmptyState />
              ) : (
                /* SELLER LISTINGS */
  
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredListings.map(
                    (item) => (
                      <ListingCard
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                      />
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
  
        {/* =====================================================
            MOBILE FILTER
        ===================================================== */}
  
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="font-black">
                  Filters
                </h2>
  
                <button
                  type="button"
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
  
        {/* =====================================================
            REQUIREMENT DETAIL
        ===================================================== */}
  
        {detailRequirement && (
          <RequirementDetailModal
            requirement={
              detailRequirement
            }
            sellerLoggedIn={
              currentUser?.role ===
              "seller"
            }
            sellerVerified={
              currentUser?.role ===
                "seller" &&
              currentUser.sellerVerificationStatus ===
                "verified"
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
  
        {/* =====================================================
            SEND INQUIRY
        ===================================================== */}
  
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
  // REQUIREMENT CARD
  // =====================================================
  
  function RequirementCard({
    item,
    alreadyInquired,
    sellerVerified,
    onView,
    onSendInquiry,
  }: {
    item:
      SavedBuyerRequirement;
  
    alreadyInquired: boolean;
  
    sellerVerified: boolean;
  
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
  
    const previewFields =
      item.fields
        .filter(
          (field) =>
            field.value &&
            ![
              "location",
              "budget",
            ].includes(
              field.id
            )
        )
        .slice(0, 4);
  
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-md">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-950">
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
              <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin
                  size={15}
                />
  
                {location}
              </p>
            )}
  
            <div className="mt-5 flex flex-wrap gap-2">
              {previewFields.map(
                (field) => (
                  <span
                    key={
                      field.id
                    }
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
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
              <p className="mt-5 font-bold text-slate-900">
                Budget:{" "}
  
                <span className="text-blue-600">
                  {budget}
                </span>
              </p>
            )}
  
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck
                size={14}
                className="text-emerald-500"
              />
  
              Buyer phone verified
            </p>
          </div>
  
          <div className="flex shrink-0 flex-col justify-end gap-2">
            <button
              type="button"
              onClick={onView}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Requirement
            </button>
  
            {alreadyInquired ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-600">
                <MessageCircle
                  size={16}
                />
  
                Inquiry Sent
              </div>
            ) : (
              <button
                type="button"
                onClick={
                  onSendInquiry
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                <MessageCircle
                  size={17}
                />
  
                {sellerVerified
                  ? "Send Inquiry"
                  : "Send Inquiry"}
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }
  
  // =====================================================
  // REQUIREMENT DETAIL MODAL
  // =====================================================
  
  function RequirementDetailModal({
    requirement,
    sellerLoggedIn,
    sellerVerified,
    alreadyInquired,
    onClose,
    onSendInquiry,
  }: {
    requirement:
      SavedBuyerRequirement;
  
    sellerLoggedIn: boolean;
  
    sellerVerified: boolean;
  
    alreadyInquired: boolean;
  
    onClose: () => void;
  
    onSendInquiry: () => void;
  }) {
    const location =
      getFieldValue(
        requirement,
        "location"
      );
  
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 p-7">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black">
                  {
                    requirement.title
                  }
                </h2>
  
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <BadgeCheck
                    size={13}
                  />
  
                  Verified Requirement
                </span>
              </div>
  
              <p className="mt-2 text-sm text-slate-500">
                {
                  requirement.category
                }
  
                {requirement.subCategory
                  ? ` • ${requirement.subCategory}`
                  : ""}
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
            {location && (
              <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600">
                <MapPin
                  size={17}
                  className="text-blue-600"
                />
  
                {location}
              </div>
            )}
  
            <div className="grid gap-3 sm:grid-cols-2">
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
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {
                          field.label
                        }
                      </p>
  
                      <p className="mt-2 font-bold text-slate-900">
                        {
                          field.value
                        }
                      </p>
                    </div>
                  )
                )}
            </div>
  
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <ShieldCheck
                  size={17}
                />
  
                KhojMarket Verified
                Requirement
              </p>
            </div>
  
            <div className="mt-6">
              {alreadyInquired ? (
                <div className="rounded-xl bg-emerald-50 px-5 py-4 text-center font-semibold text-emerald-600">
                  Inquiry already sent
                </div>
              ) : (
                <button
                  type="button"
                  onClick={
                    onSendInquiry
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white hover:bg-blue-600"
                >
                  <MessageCircle
                    size={18}
                  />
  
                  {!sellerLoggedIn
                    ? "Login as Seller to Send Inquiry"
                    : !sellerVerified
                      ? "Verify Seller to Send Inquiry"
                      : `Send Inquiry • ${DEFAULT_INQUIRY_COST} Credits`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // =====================================================
  // SELLER LISTING CARD
  // =====================================================
  
  function ListingCard({
    item,
  }: {
    item:
      DemoSellerListing;
  }) {
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              {item.category}
            </p>
  
            <h2 className="mt-2 text-xl font-black">
              {item.title}
            </h2>
          </div>
  
          {item.verified && (
            <BadgeCheck
              size={19}
              className="shrink-0 text-emerald-600"
            />
          )}
        </div>
  
        <p className="mt-2 text-sm text-slate-500">
          {item.subCategory
            ? `${item.subCategory} • `
            : ""}
  
          {item.location}
        </p>
  
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
          {item.description}
        </p>
  
        <div className="mt-5 flex items-center gap-2">
          <Store
            size={15}
            className="text-slate-400"
          />
  
          <span className="text-sm font-semibold text-slate-600">
            {
              item.sellerName
            }
          </span>
  
          <span className="text-xs font-semibold text-emerald-600">
            Verified Seller
          </span>
        </div>
  
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="font-black text-blue-600">
            {item.price}
          </p>
  
          <button
            type="button"
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            View Listing
          </button>
        </div>
      </article>
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
          <Filter
            size={17}
          />
  
          <h3 className="font-bold">
            Filters
          </h3>
        </div>
  
        <div className="mt-6">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Category
          </label>
  
          <select
            value={category}
            onChange={(
              event
            ) =>
              setCategory(
                event.target
                  .value
              )
            }
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500"
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
  
            <option value="Services">
              Services
            </option>
          </select>
        </div>
  
        <label className="mt-6 flex cursor-pointer items-center gap-3">
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
  
          <span className="text-sm font-semibold text-slate-600">
            Verified only
          </span>
        </label>
  
        {(category ||
          verifiedOnly) && (
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setVerifiedOnly(
                false
              );
            }}
            className="mt-6 text-sm font-bold text-blue-600"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }
  
  // =====================================================
  // EMPTY STATE
  // =====================================================
  
  function EmptyState() {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <Search
          size={32}
          className="mx-auto text-slate-300"
        />
  
        <h3 className="mt-4 font-bold">
          No results found
        </h3>
  
        <p className="mt-2 text-sm text-slate-400">
          Search ya filters change
          karke try karein.
        </p>
      </div>
    );
  }
  
  // =====================================================
  // GET DYNAMIC FIELD
  // =====================================================
  
  function getFieldValue(
    requirement:
      SavedBuyerRequirement,
    fieldId: string
  ) {
    return (
      requirement.fields.find(
        (field) =>
          field.id.toLowerCase() ===
            fieldId.toLowerCase() ||
          field.label.toLowerCase() ===
            fieldId.toLowerCase()
      )?.value || ""
    );
  }