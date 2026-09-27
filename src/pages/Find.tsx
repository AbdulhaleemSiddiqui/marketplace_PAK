import {
  CheckCircle2,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import AuthModal from "../components/auth/AuthModal";
import {
  createRequirement,
} from "../services/requirementCreateApiService.ts";
import {
  sendSellerInquiry,
} from "../services/inquiryApiService.ts";
import { generateAiRequirement } from "../services/aiRequirementApiService";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import PhoneOtpModal from "../components/auth/PhoneOtpModal";
import SendInquiryModal from "../components/seller/SendInquiryModal";

import {
  getCurrentUser,
  logoutUser,
  refreshCurrentUser,
} from "../services/authService";

import {
  getSellerWallet,
  getSellerInquiriesApi,
} from "../services/sellerProfileApiService";

import {
  clearPendingRequirement,
  getPendingRequirement,
  savePendingRequirement,
} from "../services/requirementService";

import {
  getPublicRequirements,
  getRequirementDetails,
  getRequirementImageUrl,
  uploadRequirementImages,
  type RequirementDetail,
  type RequirementListItem,
} from "../services/requirementApiService";


import type { User } from "../types/auth";

import type {
  SavedBuyerRequirement,
  StructuredRequirement,
} from "../types/marketplace";

import type { PublicRequirement } from "../types/find";
import RequirementDetailModal from "../components/find/RequirementDetailModal";
import FindFilters from "../components/find/FindFilters";
import AiRequirementComposer from "../components/find/AiRequirementComposer";
import FindHeader from "../components/find/FindHeader";
import FindInfoModals from "../components/find/FindInfoModals";
import FindResults from "../components/find/FindResults";

// ======================================================
// TYPES
// ======================================================

type RequirementTypeFilter =
  | "all"
  | "product"
  | "service";

type ActivityFilter =
  | "all"
  | "active"
  | "inactive";

type PostedDateFilter =
  | "any"
  | "today"
  | "7days"
  | "30days";



function toInquiryModalRequirement(
  requirement:
    PublicRequirement | null,
): SavedBuyerRequirement | null {
  if (!requirement) {
    return null;
  }

  return {
    id:
      requirement.id,

    userId:
      requirement.userId ??
      `public-${requirement.id}`,

    category:
      requirement.category ??
      "Other",

    title:
      requirement.title,

    requirementType:
      requirement.requirementType ??
      "product",

    fields: [
      {
        id:
          "description",
        label:
          "Description",
        value:
          requirement.description,
        required:
          false,
      },
      {
        id:
          "location",
        label:
          "Location",
        value:
          requirement.location,
        required:
          false,
      },
      ...(requirement.budget
        ? [
            {
              id:
                "budget",
              label:
                "Range",
              value:
                requirement.budget,
              required:
                false,
            },
          ]
        : []),
      ...(requirement.imageUrl
        ? [
            {
              id:
                "image",
              label:
                "Image",
              value:
                requirement.imageUrl,
              required:
                false,
            },
          ]
        : []),
    ],

    status:
      "verified",

    activityStatus:
      requirement.activityStatus,

    phoneVerified:
      true,

    aiVerified:
      true,

    createdAt:
      requirement.createdAt ??
      new Date().toISOString(),

    updatedAt:
      requirement.createdAt ??
      new Date().toISOString(),
  };
}

// Auth modal state is declared inside Find().
// ======================================================
// PUBLIC REQUIREMENTS NOW COME FROM ASP.NET CORE API
// ======================================================

const PAGE_SIZE =
  10;

const MAX_RANGE =
  500_000_000; // PKR 50 Crore





// ======================================================
// PAGE
// ======================================================

export default function Find() {
  const navigate =
    useNavigate();

  const [
    showAuthModal,
    setShowAuthModal,
  ] = useState(false);
  
  const otpAction = useRef<
    | { kind: "buyer" }
    | { kind: "seller"; requirement: PublicRequirement; offer?: { message: string; offeredPrice?: number } }
    | null
  >(null);
  const buyerInFlight = useRef(false);
  const sellerInFlight = useRef(false);
  const sentInquiryIds = useRef(new Set<string>());
  const [submittingRequirement, setSubmittingRequirement] = useState(false);
  const [generatingRequirement, setGeneratingRequirement] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const resumeHandled = useRef(false);

  const [
    authRole,
    setAuthRole,
  ] = useState<"buyer" | "seller">("buyer");

  const [
    pendingAuthAction,
    setPendingAuthAction,
  ] = useState<"inquiry" | "requirement" | null>(null);

  const [
    pendingInquiryAfterAuth,
    setPendingInquiryAfterAuth,
  ] = useState<PublicRequirement | null>(null);

  const [
    searchParams,
  ] =
    useSearchParams();

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<User | null>(
      () =>
        getCurrentUser(),
    );

  const [sellerBalance, setSellerBalance] = useState(0);
  const [sentInquiryRequirementIds, setSentInquiryRequirementIds] =
    useState<Set<string>>(() => new Set());
  const INQUIRY_COST = 10;

  const refreshSellerWallet = useCallback(async () => {
    const user = getCurrentUser();

    if (!user || user.role !== "seller") {
      setSellerBalance(0);
      return;
    }

    try {
      const wallet = await getSellerWallet();
      setSellerBalance(wallet.balance);
    } catch (error) {
      console.error("Unable to load seller wallet.", error);
      setSellerBalance(0);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "seller") {
      void refreshSellerWallet();
    } else {
      setSellerBalance(0);
    }
  }, [currentUser?.id, currentUser?.role, refreshSellerWallet]);

  useEffect(() => {
    if (currentUser?.role !== "seller") {
      sentInquiryIds.current.clear();
      setSentInquiryRequirementIds(new Set());
      return;
    }

    let cancelled = false;

    const loadSentInquiries = async () => {
      try {
        const inquiries = await getSellerInquiriesApi();
        if (cancelled) return;

        const requirementIds = new Set(
          inquiries.map((inquiry) => inquiry.requirementId),
        );

        sentInquiryIds.current = new Set(
          inquiries.map(
            (inquiry) => currentUser.id + ":" + inquiry.requirementId,
          ),
        );
        setSentInquiryRequirementIds(requirementIds);
      } catch (error) {
        console.error("Unable to load seller inquiries.", error);
      }
    };

    void loadSentInquiries();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.role]);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    countryFilter,
    setCountryFilter,
  ] =
    useState("");

  const [
    provinceFilter,
    setProvinceFilter,
  ] =
    useState("");

  const [
    cityFilter,
    setCityFilter,
  ] =
    useState("");

  const [
    areaFilter,
    setAreaFilter,
  ] =
    useState("");

  const [
    postalCodeFilter,
    setPostalCodeFilter,
  ] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] =
    useState("all");

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<RequirementTypeFilter>(
      "all",
    );

  const [
    activityFilter,
    setActivityFilter,
  ] =
    useState<ActivityFilter>(
      "all",
    );

  const [
    postedDateFilter,
    setPostedDateFilter,
  ] =
    useState<PostedDateFilter>(
      "any",
    );

  const [
    minPrice,
    setMinPrice,
  ] =
    useState(0);

  const [
    maxPrice,
    setMaxPrice,
  ] =
    useState(MAX_RANGE);

  const [
    verifiedOnly,
    setVerifiedOnly,
  ] =
    useState(false);

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(1);

  const [
    showMobileFilters,
    setShowMobileFilters,
  ] =
    useState(false);

  const [
    selectedRequirement,
    setSelectedRequirement,
  ] =
    useState<PublicRequirement | null>(
      null,
    );
  const [
    selectedRequirementDetails,
    setSelectedRequirementDetails,
  ] = useState<RequirementDetail | null>(
    null,
  );

    const [
      requirementDetailsLoading,
      setRequirementDetailsLoading,
    ] = useState(false);
    
    const [
      requirementDetailsError,
      setRequirementDetailsError,
    ] = useState("");
  const [
    inquiryRequirement,
    setInquiryRequirement,
  ] =
    useState<PublicRequirement | null>(
      null,
    );

  const [
    showAiComposer,
    setShowAiComposer,
  ] =
    useState(false);

  const [
    composerInput,
    setComposerInput,
  ] =
    useState("");

    const [
      composerImages,
      setComposerImages,
    ] =
      useState<string[]>([]);
      const [
        composerImageFiles,
        setComposerImageFiles,
        
      ] = useState<File[]>([]);
  const [
    generatedRequirement,
    setGeneratedRequirement,
  ] =
    useState<StructuredRequirement | null>(
      null,
    );

  const [
    showOtp,
    setShowOtp,
  ] =
    useState(false);

  const [
    showHowItWorks,
    setShowHowItWorks,
  ] =
    useState(false);

  const [
    showHelp,
    setShowHelp,
  ] =
    useState(false);

  const [
    showProfileMenu,
    setShowProfileMenu,
  ] =
    useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");

  const [
    successReference,
    setSuccessReference,
  ] =
    useState("");

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
      setSuccessReference("");
    }, 10_000);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(0);

  const [
    publicRequirements,
    setPublicRequirements,
  ] = useState<PublicRequirement[]>([]);

  const [
    requirementsLoading,
    setRequirementsLoading,
  ] = useState(true);

  const [
    ,
    setRequirementsError,
  ] = useState("");

  const completeRequirementSubmission = useCallback(async () => {
    if (buyerInFlight.current) return;
    const pending = getPendingRequirement();
    if (!pending) return; // Already consumed by a successful callback.
    buyerInFlight.current = true;
    setSubmittingRequirement(true);
    try {
      const user = await refreshCurrentUser();
      setCurrentUser(user);
      if (user.role !== "buyer") throw new Error("Requirement add karne ke liye Buyer account use karein.");
      if (!user.phoneVerified) {
        otpAction.current = { kind: "buyer" };
        setShowAiComposer(false);
        setShowOtp(true);
        return;
      }
      const created =
      await createRequirement(pending);
    
    if (composerImageFiles.length === 0) {
      throw new Error(
        "At least one requirement image is required.",
      );
    }
    
    await uploadRequirementImages(
      created.id,
      composerImageFiles,
    );
    
    clearPendingRequirement();
      otpAction.current = null;
      setGeneratedRequirement(null);
      setComposerInput("");
      setComposerImages([]);
      setComposerImageFiles([]);
      setShowAiComposer(false);
      setSuccessReference(created.referenceNo);
      setSuccessMessage("Requirement submitted. Pending admin review.");
      setRefreshKey(value => value + 1);
    } catch (error) {
      setShowAiComposer(true);
      alert(error instanceof Error ? error.message : "Requirement submit nahi ho saki.");
    } finally {
      buyerInFlight.current = false;
      setSubmittingRequirement(false);
    }
  }, [
    composerImageFiles,
    setCurrentUser,
    setSubmittingRequirement,
    setShowAiComposer,
    setShowOtp,
    setGeneratedRequirement,
    setComposerInput,
    setComposerImages,
    setComposerImageFiles,
    setSuccessReference,
    setSuccessMessage,
    setRefreshKey,
  ]);

  // Consume redirects once, including React StrictMode effect replays.
  useEffect(() => {
    if (searchParams.get("resumeRequirement") !== "true" || resumeHandled.current) return;
    resumeHandled.current = true;
    const pending = getPendingRequirement();
    navigate("/find", { replace: true });
    if (!pending || !getCurrentUser()) return;
    setGeneratedRequirement(pending);
    void completeRequirementSubmission();
  }, [navigate, searchParams, completeRequirementSubmission]);

  // ====================================================
  // PUBLIC REQUIREMENTS - REAL BACKEND API + DB FILTERS
  // ====================================================

  useEffect(() => {
    let cancelled = false;

    // Avoid firing a request on every keystroke / slider movement.
    const timer = window.setTimeout(
      () => {
        const loadRequirements =
          async () => {
            setRequirementsLoading(
              true,
            );

            setRequirementsError(
              "",
            );

            try {
              const response =
                await getPublicRequirements({
                  search:
                    search.trim() ||
                    undefined,

                  country:
                    countryFilter.trim() ||
                    undefined,

                  city:
                    cityFilter.trim() ||
                    undefined,

                  area:
                    areaFilter.trim() ||
                    undefined,

                  postalCode:
                    postalCodeFilter.trim() ||
                    undefined,

                  category:
                    categoryFilter ===
                    "all"
                      ? undefined
                      : categoryFilter,

                  requirementType:
                    typeFilter ===
                    "all"
                      ? undefined
                      : typeFilter,

                  budgetMin:
                    minPrice > 0
                      ? minPrice
                      : undefined,

                  budgetMax:
                    maxPrice <
                    MAX_RANGE
                      ? maxPrice
                      : undefined,

                  postedDate:
                    postedDateFilter ===
                    "any"
                      ? undefined
                      : postedDateFilter,

                  page: 1,
                  pageSize: 50,
                });

              if (cancelled) {
                return;
              }

              const mapped =
                response.items.map(
                  (
                    item:
                      RequirementListItem,
                  ): PublicRequirement => {
                    const location = [
                      item.area,
                      item.city,
                      item.country,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    let budget:
                      | string
                      | undefined;

                    if (
                      item.budgetMin !=
                        null &&
                      item.budgetMax !=
                        null
                    ) {
                      budget =
                        `PKR ${item.budgetMin.toLocaleString()} - ${item.budgetMax.toLocaleString()}`;
                    } else if (
                      item.budgetMax !=
                      null
                    ) {
                      budget =
                        `Up to PKR ${item.budgetMax.toLocaleString()}`;
                    } else if (
                      item.budgetMin !=
                      null
                    ) {
                      budget =
                        `From PKR ${item.budgetMin.toLocaleString()}`;
                    }

                    const description = [
                      item.subCategory,
                      item.category,
                    ]
                      .filter(Boolean)
                      .join(" • ");

                    return {
                      id: item.id,

                      userId:
                        `public-${item.id}`,

                      title:
                        item.title,

                      description,

                      location:
                        location ||
                        "Location not provided",

                      budget,

                      category:
                        item.category ||
                        "Other",

                      requirementType:
                        item.requirementType,

                      verified: true,

                      activityStatus:
                        item.activityStatus,

                      createdAt:
                        item.createdAt,

                      userName:
                        "KhojMarket User",

                      userRating: 0,

                      userReviewCount: 0,

                      queryCount:
                        item.inquiryCount ??
                        0,

                      imageUrl:
                        getRequirementImageUrl(
                          item.coverImagePath,
                        ),

                      budgetMin:
                        item.budgetMin,

                      budgetMax:
                        item.budgetMax,

                      summaryFields:
                        item.summaryFields ?? [],

                      source: "real",
                    };
                  },
                );

              setPublicRequirements(
                mapped,
              );
            } catch (error) {
              if (cancelled) {
                return;
              }

              setPublicRequirements(
                [],
              );

              setRequirementsError(
                error instanceof Error
                  ? error.message
                  : "Unable to load requirements from server.",
              );
            } finally {
              if (!cancelled) {
                setRequirementsLoading(
                  false,
                );
              }
            }
          };

        void loadRequirements();
      },
      300,
    );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timer,
      );
    };
  }, [
    refreshKey,
    search,
    countryFilter,
    cityFilter,
    areaFilter,
    postalCodeFilter,
    categoryFilter,
    typeFilter,
    minPrice,
    maxPrice,
    postedDateFilter,
  ]);

  // ====================================================
  // CATEGORIES
  // ====================================================

  const categories =
    useMemo(() => {
      return [
        ...new Set(
          publicRequirements
            .map(
              (item) =>
                item.category,
            )
            .filter(
              (
                item,
              ): item is string =>
                Boolean(
                  item,
                ),
            ),
        ),
      ].sort();
    }, [
      publicRequirements,
    ]);

  // ====================================================
  // FILTER
  // ====================================================

  const filteredRequirements =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const country =
        countryFilter
          .trim()
          .toLowerCase();

      const province =
        provinceFilter
          .trim()
          .toLowerCase();

      const city =
        cityFilter
          .trim()
          .toLowerCase();

      const area =
        areaFilter
          .trim()
          .toLowerCase();

      const postalCode =
        postalCodeFilter
          .trim()
          .toLowerCase();

      return publicRequirements.filter(
        (item) => {
          const matchesSearch =
            !query ||
            [
              item.title,
              item.description,
              item.category ??
                "",
              item.location,
              item.userName ??
                "",
            ]
              .join(
                " ",
              )
              .toLowerCase()
              .includes(
                query,
              );

          const normalizedLocation =
            item.location
              .toLowerCase();

          const matchesCountry =
            !country ||
            normalizedLocation.includes(
              country,
            ) ||
            (country === "pakistan" &&
              !normalizedLocation.includes(
                "india",
              ));

          const matchesProvince =
            !province ||
            normalizedLocation.includes(
              province,
            );

          const matchesCity =
            !city ||
            normalizedLocation.includes(
              city,
            );

          const matchesArea =
            !area ||
            normalizedLocation.includes(
              area,
            );

          const matchesPostalCode =
            !postalCode ||
            normalizedLocation.includes(
              postalCode,
            );

          const matchesCategory =
            categoryFilter ===
              "all" ||
            item.category ===
              categoryFilter;

          const matchesType =
            typeFilter ===
              "all" ||
            item.requirementType ===
              typeFilter;

          const matchesActivity =
            activityFilter ===
              "all" ||
            item.activityStatus ===
              activityFilter;

          const matchesVerified =
            !verifiedOnly ||
            item.verified;

          const itemBudgetMin =
            item.budgetMin ??
            parseMoney(item.budget);

          const itemBudgetMax =
            item.budgetMax ??
            itemBudgetMin;

          const matchesMin =
            itemBudgetMax == null ||
            itemBudgetMax >= minPrice;

          const matchesMax =
            itemBudgetMin == null ||
            itemBudgetMin <= maxPrice;

          const matchesDate =
            matchesPostedDate(
              item.createdAt,
              postedDateFilter,
            );

          return (
            matchesSearch &&
            matchesCountry &&
            matchesProvince &&
            matchesCity &&
            matchesArea &&
            matchesPostalCode &&
            matchesCategory &&
            matchesType &&
            matchesActivity &&
            matchesVerified &&
            matchesMin &&
            matchesMax &&
            matchesDate
          );
        },
      );
    }, [
      publicRequirements,
      search,
      countryFilter,
      provinceFilter,
      cityFilter,
      areaFilter,
      postalCodeFilter,
      categoryFilter,
      typeFilter,
      activityFilter,
      verifiedOnly,
      minPrice,
      maxPrice,
      postedDateFilter,
    ]);

  // ====================================================
  // RESET PAGE ON FILTER
  // ====================================================

  useEffect(() => {
    setCurrentPage(
      1,
    );
  }, [
    search,
    countryFilter,
    provinceFilter,
    cityFilter,
    areaFilter,
    postalCodeFilter,
    categoryFilter,
    typeFilter,
    activityFilter,
    verifiedOnly,
    minPrice,
    maxPrice,
    postedDateFilter,
  ]);

  // ====================================================
  // PAGINATION
  // ====================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredRequirements.length /
          PAGE_SIZE,
      ),
    );

  const paginatedRequirements =
    filteredRequirements.slice(
      (currentPage -
        1) *
        PAGE_SIZE,
      currentPage *
        PAGE_SIZE,
    );

  // ====================================================
  // CLEAR FILTERS
  // ====================================================

  const clearFilters =
    () => {
      setSearch(
        "",
      );

      setCountryFilter(
        "",
      );

      setProvinceFilter(
        "",
      );

      setCityFilter(
        "",
      );

      setAreaFilter(
        "",
      );

      setPostalCodeFilter(
        "",
      );

      setCategoryFilter(
        "all",
      );

      setTypeFilter(
        "all",
      );

      setActivityFilter(
        "all",
      );

      setPostedDateFilter(
        "any",
      );

      setMinPrice(
        0,
      );

      setMaxPrice(
        MAX_RANGE,
      );

      setVerifiedOnly(
        false,
      );
    };

  // ====================================================
  // INQUIRY
  // ====================================================

  const continueSellerInquiry = async (
    requirement: PublicRequirement,
    offer?: { message: string; offeredPrice?: number },
  ) => {
    if (sellerInFlight.current) return;
    sellerInFlight.current = true;
    setSubmittingInquiry(true);
    try {
      const user = await refreshCurrentUser();
      setCurrentUser(user);
      if (user.role !== "seller") {
        alert("Inquiry send karne ke liye Seller account use karein.");
        return;
      }
      if (user.sellerVerificationStatus !== "verified") {
        alert("Seller Verification complete karna required hai.");
        navigate("/profile");
        return;
      }
      if (!user.phoneVerified) {
        otpAction.current = { kind: "seller", requirement, offer };
        setInquiryRequirement(null);
        setShowOtp(true);
        return;
      }
      const inquiryKey = user.id + ":" + requirement.id;
      if (sentInquiryIds.current.has(inquiryKey)) {
        setInquiryRequirement(null);
        return;
      }
      if (!offer) {
        await refreshSellerWallet();
        setInquiryRequirement(requirement);
        return;
      }
      await sendSellerInquiry({ requirementId: requirement.id, ...offer });
      await refreshSellerWallet();
      sentInquiryIds.current.add(inquiryKey);
      setSentInquiryRequirementIds((previous) => {
        const next = new Set(previous);
        next.add(requirement.id);
        return next;
      });
      setInquiryRequirement(null);
      setRefreshKey(value => value + 1);
      setSuccessMessage("Inquiry submitted successfully.");
    } catch (error) {
      if (offer) setInquiryRequirement(requirement);
      alert(error instanceof Error ? error.message : "Inquiry could not be submitted.");
    } finally {
      sellerInFlight.current = false;
      setSubmittingInquiry(false);
    }
  };

  const handleViewRequirement =
  async (
    requirement: PublicRequirement,
  ) => {
    setSelectedRequirement(
      requirement,
    );

    setSelectedRequirementDetails(
      null,
    );

    setRequirementDetailsError(
      "",
    );

    // Demo requirement ho to old popup
    // fallback continue karega.
    if (requirement.source !== "real") {
      return;
    }

    setRequirementDetailsLoading(
      true,
    );

    try {
      const details =
        await getRequirementDetails(
          requirement.id,
        );

      setSelectedRequirementDetails(
        details,
      );
    } catch (error) {
      setRequirementDetailsError(
        error instanceof Error
          ? error.message
          : "Requirement details could not be loaded.",
      );
    } finally {
      setRequirementDetailsLoading(
        false,
      );
    }
  };

  const handleSendInquiry = (requirement: PublicRequirement) => {
    if (sellerInFlight.current || otpAction.current) return;
    if (requirement.activityStatus === "inactive") {
      alert("This requirement is closed and is not accepting new inquiries.");
      return;
    }
    if (!getCurrentUser()) {
      setAuthRole("seller");
      setPendingAuthAction("inquiry");
      setPendingInquiryAfterAuth(requirement);
      setShowAuthModal(true);
      return;
    }
    void continueSellerInquiry(requirement);
  };

  const confirmInquiry = (message: string, offeredPrice: string) => {
    if (!inquiryRequirement || sellerInFlight.current || otpAction.current) return;
    const parsedPrice = offeredPrice.trim() ? Number(offeredPrice.replace(/,/g, "")) : undefined;
    if (parsedPrice !== undefined && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      alert("Valid offered price enter karein.");
      return;
    }
    void continueSellerInquiry(inquiryRequirement, { message, offeredPrice: parsedPrice });
  };

  // ====================================================
  // GENERATE
  // ====================================================

  const generateRequirement =
    async () => {
      const text =
        composerInput.trim();

      if (!text || generatingRequirement) {
        return;
      }

      setGeneratingRequirement(true);
      setGenerationError("");

      try {
        const generated =
          await generateAiRequirement(text);

        setGeneratedRequirement(
          generated,
        );
      } catch (error) {
        setGenerationError(
          error instanceof Error
            ? error.message
            : "AI requirement generate nahi kar saka.",
        );
      } finally {
        setGeneratingRequirement(false);
      }
    };

  const updateGeneratedField =
    (
      fieldId: string,
      value: string,
    ) => {
      setGeneratedRequirement(
        (previous) => {
          if (
            !previous
          ) {
            return previous;
          }

          return {
            ...previous,

            fields:
              previous.fields.map(
                (field) =>
                  field.id ===
                  fieldId
                    ? {
                        ...field,
                        value,
                      }
                    : field,
              ),
          };
        },
      );
    };
    const submitRequirement =
    async () => {
      if (buyerInFlight.current || otpAction.current) return;
      if (
        !generatedRequirement
      ) {
        return;
      }

      if (
        composerImages.length ===
        0
      ) {
        return;
      }

      const countryField =
        generatedRequirement.fields.find(
          (field) =>
            normalize(
              field.id,
            ) ===
            "country",
        );

      const cityField =
        generatedRequirement.fields.find(
          (field) =>
            normalize(
              field.id,
            ) ===
            "city",
        );

      if (
        !countryField?.value.trim() ||
        !cityField?.value.trim()
      ) {
        return;
      }

      const missing =
        generatedRequirement.fields.some(
          (field) =>
            field.required &&
            !field.value.trim(),
        );

      if (missing) {
        return;
      }

      const requirementToSave:
        StructuredRequirement = {
          ...generatedRequirement,

          fields:
            generatedRequirement.fields.filter(
              (field) =>
                !normalize(
                  field.id,
                ).startsWith(
                  "image",
                ),
            ),
        };

      savePendingRequirement(
        requirementToSave,
      );

      const user =
        getCurrentUser();

      if (!user) {
        setAuthRole(
          "buyer",
        );

        setPendingAuthAction(
          "requirement",
        );

        setShowAuthModal(
          true,
        );

        return;
      }

      if (
        user.role !==
        "buyer"
      ) {
        alert(
          "Requirement add karne ke liye Buyer account use karein.",
        );

        return;
      }

      await completeRequirementSubmission();
    };

  const handleOtpVerified = (user: User) => {
    if (!user.phoneVerified) return;
    const action = otpAction.current;
    if (!action) return;
    // Consume before any async continuation or modal state transition.
    otpAction.current = null;
    setCurrentUser(user);
    setShowOtp(false);
    if (action.kind === "buyer" && user.role === "buyer") {
      void completeRequirementSubmission();
    } else if (action.kind === "seller" && user.role === "seller") {
      void continueSellerInquiry(action.requirement, action.offer);
    }
  };

  const handleLogout =
    () => {
      logoutUser();

      setCurrentUser(
        null,
      );

      setShowProfileMenu(
        false,
      );
    };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <FindHeader
        currentUser={currentUser}
        showProfileMenu={showProfileMenu}
        onToggleProfileMenu={() =>
          setShowProfileMenu(!showProfileMenu)
        }
        onLogin={() => {
          setAuthRole("buyer");
          setPendingAuthAction(null);
          setPendingInquiryAfterAuth(null);
          setShowAuthModal(true);
        }}
        onHowItWorks={() =>
          setShowHowItWorks(true)
        }
        onHelp={() =>
          setShowHelp(true)
        }
        onLogout={handleLogout}
      />

      {/* MAIN */}

      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-12">

        {/* SEARCH */}

        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex gap-3">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search requirements..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setShowMobileFilters(
                  true,
                )
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold lg:hidden"
            >
              <Filter
                size={17}
              />

              Filters
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[270px_1fr]">

          {/* FILTERS */}

          <aside className="hidden lg:block">
            <div className="sticky top-[95px] rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black">
                  <SlidersHorizontal
                    size={17}
                  />

                  Filters
                </div>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="text-xs font-bold text-blue-600"
                >
                  Clear
                </button>
              </div>

              <FindFilters
                country={
                  countryFilter
                }
                setCountry={
                  setCountryFilter
                }
                province={
                  provinceFilter
                }
                setProvince={
                  setProvinceFilter
                }
                city={
                  cityFilter
                }
                setCity={
                  setCityFilter
                }
                area={
                  areaFilter
                }
                setArea={
                  setAreaFilter
                }
                postalCode={
                  postalCodeFilter
                }
                setPostalCode={
                  setPostalCodeFilter
                }
                category={
                  categoryFilter
                }
                setCategory={
                  setCategoryFilter
                }
                categories={
                  categories
                }
                type={
                  typeFilter
                }
                setType={
                  setTypeFilter
                }
                activity={
                  activityFilter
                }
                setActivity={
                  setActivityFilter
                }
                postedDate={
                  postedDateFilter
                }
                setPostedDate={
                  setPostedDateFilter
                }
                minPrice={
                  minPrice
                }
                setMinPrice={
                  setMinPrice
                }
                maxPrice={
                  maxPrice
                }
                setMaxPrice={
                  setMaxPrice
                }
                verifiedOnly={
                  verifiedOnly
                }
                setVerifiedOnly={
                  setVerifiedOnly
                }
              />
            </div>
          </aside>

          <FindResults
            requirementsLoading={requirementsLoading}
            filteredRequirements={filteredRequirements}
            paginatedRequirements={paginatedRequirements}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            currentUserRole={currentUser?.role}
            sentInquiryRequirementIds={sentInquiryRequirementIds}
            onViewRequirement={handleViewRequirement}
            onSendInquiry={handleSendInquiry}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>

      {/* MOBILE FILTERS */}

      {showMobileFilters && (
        <div className="fixed inset-0 z-[80] bg-slate-950/40">
          <div className="absolute right-0 top-0 h-full w-[90%] max-w-sm overflow-y-auto bg-white p-6">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">
                Filters
              </h2>

              <button
                onClick={() =>
                  setShowMobileFilters(
                    false,
                  )
                }
              >
                <X />
              </button>
            </div>

            <FindFilters
              country={
                countryFilter
              }
              setCountry={
                setCountryFilter
              }
              province={
                provinceFilter
              }
              setProvince={
                setProvinceFilter
              }
              city={
                cityFilter
              }
              setCity={
                setCityFilter
              }
              area={
                areaFilter
              }
              setArea={
                setAreaFilter
              }
              postalCode={
                postalCodeFilter
              }
              setPostalCode={
                setPostalCodeFilter
              }
              category={
                categoryFilter
              }
              setCategory={
                setCategoryFilter
              }
              categories={
                categories
              }
              type={
                typeFilter
              }
              setType={
                setTypeFilter
              }
              activity={
                activityFilter
              }
              setActivity={
                setActivityFilter
              }
              postedDate={
                postedDateFilter
              }
              setPostedDate={
                setPostedDateFilter
              }
              minPrice={
                minPrice
              }
              setMinPrice={
                setMinPrice
              }
              maxPrice={
                maxPrice
              }
              setMaxPrice={
                setMaxPrice
              }
              verifiedOnly={
                verifiedOnly
              }
              setVerifiedOnly={
                setVerifiedOnly
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowMobileFilters(
                  false,
                )
              }
              className="mt-7 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
            >
              Show Results
            </button>
          </div>
        </div>
      )}

      {/* FLOATING CTA */}

      <button
        type="button"
        onClick={() =>
          setShowAiComposer(
            true,
          )
        }
        className="fixed bottom-7 right-7 z-50 flex items-center gap-3 rounded-2xl border border-blue-400/50 bg-slate-950 px-4 py-3 text-white shadow-[0_0_18px_rgba(37,99,235,0.55),0_0_40px_rgba(37,99,235,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-blue-600 hover:shadow-[0_0_24px_rgba(37,99,235,0.75),0_0_55px_rgba(37,99,235,0.35)]"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <Plus
            size={20}
          />
        </div>

        <div className="text-left">
          <p className="text-sm font-black">
            Add Requirement
          </p>

          <p className="hidden items-center gap-1 text-[11px] text-white/60 sm:flex">
            <Sparkles
              size={10}
            />

            AI assisted
          </p>
        </div>
      </button>

      {/* DETAIL */}

      {selectedRequirement && (
        <RequirementDetailModal
          requirement={
            selectedRequirement
          }
          details={
            selectedRequirementDetails
          }
          loading={
            requirementDetailsLoading
          }
          error={
            requirementDetailsError
          }
          currentUserRole={currentUser?.role}
          onClose={() => {
            setSelectedRequirement(
              null,
            );
            setSelectedRequirementDetails(
              null,
            );
            setRequirementDetailsError(
              "",
            );
          }}
          onInquiry={() => {
            const item =
              selectedRequirement;

            setSelectedRequirement(
              null,
            );
            setSelectedRequirementDetails(
              null,
            );
            setRequirementDetailsError(
              "",
            );

            handleSendInquiry(
              item,
            );
          }}
        />
      )}

      {/* INQUIRY MODAL */}

      <SendInquiryModal
        submitting={submittingInquiry}
        open={
          Boolean(
            inquiryRequirement,
          )
        }
        requirement={
          toInquiryModalRequirement(
            inquiryRequirement,
          )
        }
        currentBalance={
          currentUser?.role === "seller"
            ? sellerBalance
            : 0
        }
        inquiryCost={INQUIRY_COST}
        onClose={() => {
          if (!sellerInFlight.current) setInquiryRequirement(null);
        }}
        onConfirm={
          confirmInquiry
        }
      />

      {/* AI */}

      {showAiComposer && (
        <AiRequirementComposer
  input={composerInput}
  requirement={generatedRequirement}
  setInput={setComposerInput}
  images={composerImages}
  setImages={setComposerImages}
  imageFiles={composerImageFiles}
  setImageFiles={setComposerImageFiles}
  onGenerate={generateRequirement}
  onFieldChange={updateGeneratedField}
  submitting={submittingRequirement}
  generating={generatingRequirement}
  generationError={generationError}
  onSubmit={submitRequirement}
  onClose={() =>
    setShowAiComposer(false)
  }
/>
      )}

      {/* HOW / HELP */}

      <FindInfoModals
        showHowItWorks={showHowItWorks}
        showHelp={showHelp}
        onCloseHowItWorks={() =>
          setShowHowItWorks(false)
        }
        onCloseHelp={() =>
          setShowHelp(false)
        }
      />

      <AuthModal
        open={showAuthModal}
        initialMode="login"
        initialRole={authRole}
        lockRole={
          pendingAuthAction !== null
        }
        onClose={() => {
          setShowAuthModal(false);
          setPendingAuthAction(null);
          setPendingInquiryAfterAuth(null);
        }}
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setShowAuthModal(false);
          const action = pendingAuthAction;
          const requirement = pendingInquiryAfterAuth;
          setPendingAuthAction(null);
          setPendingInquiryAfterAuth(null);
          if (action === "inquiry" && requirement && user.role === "seller") {
            void continueSellerInquiry(requirement);
          } else if (action === "requirement" && user.role === "buyer") {
            void completeRequirementSubmission();
          }
        }}
      />

      {showOtp && (
        <PhoneOtpModal
          open
          phone={currentUser?.phone ?? ""}
          onClose={() => {
            const action = otpAction.current;
            otpAction.current = null;
            setShowOtp(false);
            if (action?.kind === "buyer") setShowAiComposer(true);
            if (action?.kind === "seller" && action.offer) setInquiryRequirement(action.requirement);
          }}
          onVerified={handleOtpVerified}
        />
      )}

      {successMessage && (
        <div className="fixed left-1/2 top-24 z-[110] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-black text-slate-950">
                {successMessage}
              </p>

              {successReference && (
                <p className="mt-1 break-all text-xs font-semibold text-slate-500">
                  Reference: {successReference}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessMessage("");
                setSuccessReference("");
              }}
              className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// FILTERS
// ======================================================



// ======================================================
// CARD
// ======================================================

// ======================================================
// DETAIL
// ======================================================

// ======================================================
// AI COMPOSER
// ======================================================



// ======================================================
// COMMON
// ======================================================













// ======================================================
// HELPERS
// ======================================================

function normalize(
  value: string,
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      "",
    );
}

function parseMoney(
  value?: string,
): number | null {
  if (!value) {
    return null;
  }

  const cleaned =
    value.replace(
      /[^0-9.]/g,
      "",
    );

  if (!cleaned) {
    return null;
  }

  const result =
    Number(
      cleaned,
    );

  return Number.isFinite(
    result,
  )
    ? result
    : null;
}

function matchesPostedDate(
  value:
    | string
    | undefined,
  filter:
    PostedDateFilter,
) {
  if (
    filter ===
      "any" ||
    !value
  ) {
    return true;
  }

  const created =
    new Date(
      value,
    ).getTime();

  const now =
    Date.now();

  const diff =
    now -
    created;

  const day =
    24 *
    60 *
    60 *
    1000;

  if (
    filter ===
    "today"
  ) {
    return (
      diff <=
      day
    );
  }

  if (
    filter ===
    "7days"
  ) {
    return (
      diff <=
      day * 7
    );
  }

  return (
    diff <=
    day * 30
  );
}
