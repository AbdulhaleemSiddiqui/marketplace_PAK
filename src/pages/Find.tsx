import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Filter,
  MapPin,
  MessageSquareText,
  Mic,
  PackageSearch,
  Paperclip,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import FastVerificationModal from "../components/auth/FastVerificationModal";
import SendInquiryModal from "../components/seller/SendInquiryModal";

import {
  getCurrentUser,
  logoutUser,
  markPhoneVerified,
} from "../services/authService";

import {
  getCreditBalance,
} from "../services/creditService";

import {
  DEFAULT_INQUIRY_COST,
  getInquiryCountByRequirement,
  sendInquiry,
} from "../services/inquiryService";

import {
  clearPendingRequirement,
  getPendingRequirement,
  getVerifiedBuyerRequirements,
  saveBuyerRequirement,
  savePendingRequirement,
} from "../services/requirementService";

import {
  getCitiesByCountry,
  getCountries,
} from "../services/locationService";

import type { User } from "../types/auth";

import type {
  BuyerRequirement,
  RequirementActivityStatus,
  RequirementField,
  RequirementType,
  SavedBuyerRequirement,
  StructuredRequirement,
} from "../types/marketplace";

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


interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]:
      SpeechRecognitionResultLike;
    length: number;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((
        event:
          SpeechRecognitionEventLike,
      ) => void)
    | null;
  onerror:
    | (() => void)
    | null;
  onend:
    | (() => void)
    | null;
}

type SpeechRecognitionConstructor =
  new () => SpeechRecognitionLike;

interface PublicRequirement
  extends BuyerRequirement {
  source:
    | "real"
    | "demo";

  activityStatus:
    RequirementActivityStatus;

  queryCount: number;

  imageUrl?: string;
}

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

// ======================================================
// DEMO REQUIREMENTS
// ======================================================

const demoBuyerRequirements: PublicRequirement[] = [
  {
    id:
      "demo-corolla",

    userId:
      "demo-user-corolla",

    title:
      "Toyota Corolla 2021–2023 Automatic Required",

    description:
      "Looking for a clean Toyota Corolla automatic. Genuine condition preferred.",

    location:
      "Lahore",

    budget:
      "PKR 5,500,000",

    category:
      "Vehicles",

    requirementType:
      "product",

    verified:
      true,

    activityStatus:
      "active",

    createdAt:
      new Date(
        Date.now() -
          2 *
            24 *
            60 *
            60 *
            1000,
      ).toISOString(),

    userName:
      "Hamza Ahmed",

    userRating:
      4.8,

    userReviewCount:
      18,

    queryCount:
      4,

    source:
      "demo",
  },

  {
    id:
      "demo-rado",

    userId:
      "demo-user-rado",

    title:
      "Original Rado Watch Required",

    description:
      "Original Rado watch required in good condition. Box and papers preferred.",

    location:
      "Islamabad",

    budget:
      "PKR 250,000",

    category:
      "Watches",

    requirementType:
      "product",

    verified:
      true,

    activityStatus:
      "active",

    createdAt:
      new Date(
        Date.now() -
          5 *
            24 *
            60 *
            60 *
            1000,
      ).toISOString(),

    userName:
      "Saad Malik",

    userRating:
      4.9,

    userReviewCount:
      31,

    queryCount:
      7,

    source:
      "demo",
  },

  {
    id:
      "demo-cement",

    userId:
      "demo-user-cement",

    title:
      "Cement Required for House Construction",

    description:
      "Need cement for residential construction. Looking for competitive bulk pricing.",

    location:
      "Rawalpindi",

    budget:
      "PKR 600,000",

    category:
      "Construction",

    requirementType:
      "product",

    verified:
      true,

    activityStatus:
      "inactive",

    createdAt:
      new Date(
        Date.now() -
          15 *
            24 *
            60 *
            60 *
            1000,
      ).toISOString(),

    userName:
      "Usman Khan",

    userRating:
      4.7,

    userReviewCount:
      11,

    queryCount:
      12,

    source:
      "demo",
  },

  {
    id:
      "demo-iphone",

    userId:
      "demo-user-iphone",

    title:
      "iPhone 16 Pro Required",

    description:
      "Looking for PTA approved iPhone 16 Pro, sealed or excellent condition.",

    location:
      "Karachi",

    budget:
      "PKR 400,000",

    category:
      "Mobiles",

    requirementType:
      "product",

    verified:
      true,

    activityStatus:
      "active",

    createdAt:
      new Date().toISOString(),

    userName:
      "Adeel Shah",

    userRating:
      4.6,

    userReviewCount:
      24,

    queryCount:
      3,

    source:
      "demo",
  },

  {
    id:
      "demo-electrician",

    userId:
      "demo-user-electrician",

    title:
      "Electrician Needed for Complete House Wiring",

    description:
      "Need an experienced electrician for complete wiring of a new 10 marla house.",

    location:
      "DHA Lahore",

    budget:
      "PKR 80,000",

    category:
      "Home Services",

    requirementType:
      "service",

    verified:
      true,

    activityStatus:
      "active",

    createdAt:
      new Date(
        Date.now() -
          1 *
            24 *
            60 *
            60 *
            1000,
      ).toISOString(),

    userName:
      "Ali Raza",

    userRating:
      4.9,

    userReviewCount:
      27,

    queryCount:
      4,

    source:
      "demo",
  },

  {
    id:
      "demo-ac",

    userId:
      "demo-user-ac",

    title:
      "AC Technician Required",

    description:
      "1.5 ton inverter AC needs service and cooling inspection.",

    location:
      "Gulberg Lahore",

    budget:
      "PKR 5,000",

    category:
      "Home Services",

    requirementType:
      "service",

    verified:
      true,

    activityStatus:
      "inactive",

    createdAt:
      new Date(
        Date.now() -
          35 *
            24 *
            60 *
            60 *
            1000,
      ).toISOString(),

    userName:
      "Farhan Ahmed",

    userRating:
      4.5,

    userReviewCount:
      9,

    queryCount:
      5,

    source:
      "demo",
  },
];

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
    refreshKey,
    setRefreshKey,
  ] =
    useState(0);

  // ====================================================
  // RESUME AFTER LOGIN
  // ====================================================

  useEffect(() => {
    const resume =
      searchParams.get(
        "resumeRequirement",
      );

    if (
      resume !==
      "true"
    ) {
      return;
    }

    const user =
      getCurrentUser();

    const pending =
      getPendingRequirement();

    if (
      !user ||
      !pending
    ) {
      navigate(
        "/find",
        {
          replace:
            true,
        },
      );

      return;
    }

    setCurrentUser(
      user,
    );

    setGeneratedRequirement(
      pending,
    );

    setShowAiComposer(
      true,
    );

    if (
      !user.phoneVerified
    ) {
      setShowOtp(
        true,
      );

      navigate(
        "/find",
        {
          replace:
            true,
        },
      );

      return;
    }

    saveBuyerRequirement(
      pending,
      user,
      "ai_verification_pending",
    );

    clearPendingRequirement();

    setGeneratedRequirement(
      null,
    );

    setShowAiComposer(
      false,
    );

    setSuccessMessage(
      "Requirement submitted. Verification pending.",
    );

    setRefreshKey(
      (value) =>
        value + 1,
    );

    navigate(
      "/find",
      {
        replace:
          true,
      },
    );
  }, [
    navigate,
    searchParams,
  ]);

  // ====================================================
  // REAL REQUIREMENTS
  // ====================================================

  const realRequirements =
    useMemo(() => {
      void refreshKey;

      return getVerifiedBuyerRequirements().map(
        (
          requirement,
        ): PublicRequirement => {
          const getField =
            (
              names: string[],
            ) => {
              const normalized =
                names.map(
                  normalize,
                );

              const match =
                requirement.fields.find(
                  (field) =>
                    normalized.includes(
                      normalize(
                        field.id,
                      ),
                    ) ||
                    normalized.includes(
                      normalize(
                        field.label,
                      ),
                    ),
                );

              return (
                match?.value ??
                ""
              );
            };

          return {
            id:
              requirement.id,

            userId:
              requirement.userId,

            title:
              requirement.title,

            description:
              requirement.fields
                .filter(
                  (field) =>
                    field.value,
                )
                .slice(
                  0,
                  4,
                )
                .map(
                  (field) =>
                    `${field.label}: ${field.value}`,
                )
                .join(
                  " • ",
                ),

            location:
              buildLocationFromFields(
                requirement.fields,
              ),

            budget:
              getField([
                "budget",
                "price",
                "expected budget",
              ]) ||
              undefined,

            category:
              requirement.category,

            requirementType:
              requirement.requirementType ??
              inferRequirementType(
                requirement,
              ),

            verified:
              true,

            activityStatus:
              requirement.activityStatus ??
              "active",

            createdAt:
              requirement.createdAt,

            userName:
              "KhojMarket User",

            userRating:
              5,

            userReviewCount:
              0,

            queryCount:
              getInquiryCountByRequirement(
                requirement.id,
              ),

            imageUrl:
              getField([
                "image",
                "photo",
                "image url",
                "photo url",
              ]) ||
              undefined,

            source:
              "real",
          };
        },
      );
    }, [
      refreshKey,
    ]);

  const publicRequirements =
    useMemo(
      () => [
        ...realRequirements,
        ...demoBuyerRequirements,
      ],
      [
        realRequirements,
      ],
    );

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

          const price =
            parseMoney(
              item.budget,
            );

          const matchesMin =
            price ===
              null ||
            price >=
              minPrice;

          const matchesMax =
            price ===
              null ||
            price <=
              maxPrice;

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

  const handleSendInquiry =
    (
      requirement:
        PublicRequirement,
    ) => {
      if (
        requirement.activityStatus ===
        "inactive"
      ) {
        alert(
          "This requirement is closed and is not accepting new inquiries.",
        );

        return;
      }

      const user =
        getCurrentUser();

      if (!user) {
        navigate(
          "/login?role=seller&returnUrl=/find",
        );

        return;
      }

      if (
        user.role !==
        "seller"
      ) {
        alert(
          "Inquiry send karne ke liye Seller account use karein.",
        );

        return;
      }

      if (
        user.sellerVerificationStatus !==
        "verified"
      ) {
        alert(
          "Seller Verification complete karna required hai.",
        );

        navigate(
          "/profile",
        );

        return;
      }

      setCurrentUser(
        user,
      );

      setInquiryRequirement(
        requirement,
      );
    };

  const confirmInquiry =
    (
      message: string,
      offeredPrice: string,
    ) => {
      if (
        !inquiryRequirement
      ) {
        return;
      }

      const seller =
        getCurrentUser();

      if (
        !seller ||
        seller.role !==
          "seller"
      ) {
        return;
      }

      try {
        sendInquiry({
          requirementId:
            inquiryRequirement.id,

          buyerUserId:
            inquiryRequirement.userId ??
            `demo-${inquiryRequirement.id}`,

          seller,

          message,

          offeredPrice:
            offeredPrice ||
            undefined,

          creditCost:
            DEFAULT_INQUIRY_COST,
        });

        setInquiryRequirement(
          null,
        );

        setRefreshKey(
          (value) =>
            value + 1,
        );

        setSuccessMessage(
          "Inquiry submitted successfully.",
        );
      } catch (
        error
      ) {
        alert(
          error instanceof
            Error
            ? error.message
            : "Inquiry could not be submitted.",
        );
      }
    };

  // ====================================================
  // GENERATE
  // ====================================================

  const generateRequirement =
    () => {
      if (
        !composerInput.trim()
      ) {
        return;
      }

      const generated =
        generateMockRequirement(
          composerInput,
        );

      if (
        composerImages.length >
        0
      ) {
        generated.fields = [
          ...generated.fields.filter(
            (field) =>
              !normalize(
                field.id,
              ).startsWith(
                "image",
              ),
          ),
          ...composerImages.map(
            (
              image,
              index,
            ) =>
              createField(
                `image${index + 1}`,
                `Image ${index + 1}`,
                image,
                index === 0,
              ),
          ),
        ];
      }

      setGeneratedRequirement(
        generated,
      );
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
    () => {
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

      if (
        missing
      ) {
        return;
      }

      const requirementToSave:
        StructuredRequirement = {
          ...generatedRequirement,
          fields: [
            ...generatedRequirement.fields.filter(
              (field) =>
                !normalize(
                  field.id,
                ).startsWith(
                  "image",
                ),
            ),
            ...composerImages.map(
              (
                image,
                index,
              ) =>
                createField(
                  `image${index + 1}`,
                  `Image ${index + 1}`,
                  image,
                  index === 0,
                ),
            ),
          ],
        };

      savePendingRequirement(
        requirementToSave,
      );

      const user =
        getCurrentUser();

      if (!user) {
        navigate(
          "/login?role=buyer&returnUrl=/find",
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

      if (
        !user.phoneVerified
      ) {
        setShowOtp(
          true,
        );

        return;
      }

      saveBuyerRequirement(
        requirementToSave,
        user,
        "ai_verification_pending",
      );

      clearPendingRequirement();

      setGeneratedRequirement(
        null,
      );

      setComposerInput(
        "",
      );

      setComposerImages([]);

      setShowAiComposer(
        false,
      );

      setSuccessMessage(
        "Requirement submitted. Verification pending.",
      );

      setRefreshKey(
        (value) =>
          value + 1,
      );
    };

  const handleOtpVerified =
    () => {
      const user =
        getCurrentUser();

      const pending =
        getPendingRequirement();

      if (
        !user ||
        !pending
      ) {
        return;
      }

      const verified =
        markPhoneVerified(
          user.id,
        );

      if (!verified) {
        return;
      }

      saveBuyerRequirement(
        pending,
        verified,
        "ai_verification_pending",
      );

      clearPendingRequirement();

      setCurrentUser(
        verified,
      );

      setShowOtp(
        false,
      );

      setShowAiComposer(
        false,
      );

      setGeneratedRequirement(
        null,
      );

      setSuccessMessage(
        "Phone verified and requirement submitted.",
      );

      setRefreshKey(
        (value) =>
          value + 1,
      );
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

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">

          <Link
            to="/find"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Search
                size={18}
              />
            </div>

            <div className="text-lg font-black">
              Khoj
              <span className="text-blue-600">
                Market
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">

            <HeaderIcon
              title="How It Works"
              onClick={() =>
                setShowHowItWorks(
                  true,
                )
              }
            >
              <WandSparkles
                size={19}
              />
            </HeaderIcon>

            <HeaderIcon
              title="Help"
              onClick={() =>
                setShowHelp(
                  true,
                )
              }
            >
              <CircleHelp
                size={19}
              />
            </HeaderIcon>

            {!currentUser ? (
              <Link
                to="/login"
                className="ml-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
              >
                Sign In
              </Link>
            ) : (
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowProfileMenu(
                      !showProfileMenu,
                    )
                  }
                  className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <UserRound
                      size={17}
                    />
                  </div>

                  <span className="hidden text-sm font-bold md:block">
                    {
                      currentUser.name
                    }
                  </span>

                  <ChevronDown
                    size={14}
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-48 rounded-2xl border bg-white p-2 shadow-xl">
                    <Link
                      to="/profile"
                      className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

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

              <Filters
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

          {/* RESULTS */}

          <section>

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black">
                  User Requirements
                </h1>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    filteredRequirements.length
                  }{" "}
                  requirements found
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {paginatedRequirements.map(
                (
                  requirement,
                ) => (
                  <RequirementCard
                    key={
                      requirement.id
                    }
                    requirement={
                      requirement
                    }
                    onView={() =>
                      setSelectedRequirement(
                        requirement,
                      )
                    }
                    onInquiry={() =>
                      handleSendInquiry(
                        requirement,
                      )
                    }
                  />
                ),
              )}
            </div>

            {/* PAGINATION */}

            {filteredRequirements.length >
              0 && (
              <Pagination
                currentPage={
                  currentPage
                }
                totalPages={
                  totalPages
                }
                totalItems={
                  filteredRequirements.length
                }
                pageSize={
                  PAGE_SIZE
                }
                onPageChange={
                  setCurrentPage
                }
              />
            )}
          </section>
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

            <Filters
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
        className="fixed bottom-7 right-7 z-50 flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-2xl transition hover:-translate-y-1 hover:bg-blue-600"
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
        <RequirementDetail
          requirement={
            selectedRequirement
          }
          onClose={() =>
            setSelectedRequirement(
              null,
            )
          }
          onInquiry={() => {
            const item =
              selectedRequirement;

            setSelectedRequirement(
              null,
            );

            handleSendInquiry(
              item,
            );
          }}
        />
      )}

      {/* INQUIRY MODAL */}

      <SendInquiryModal
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
          currentUser?.role ===
          "seller"
            ? getCreditBalance(
                currentUser.id,
              )
            : 0
        }
        inquiryCost={
          DEFAULT_INQUIRY_COST
        }
        onClose={() =>
          setInquiryRequirement(
            null,
          )
        }
        onConfirm={
          confirmInquiry
        }
      />

      {/* AI */}

      {showAiComposer && (
  <AiComposer
  input={composerInput}
  requirement={generatedRequirement}
  setInput={setComposerInput}
  images={composerImages}
  setImages={setComposerImages}
  onGenerate={generateRequirement}
  onFieldChange={updateGeneratedField}
  onSubmit={submitRequirement}
  onClose={() =>
    setShowAiComposer(false)
  }
/>
      )}

      {/* HOW */}

      {showHowItWorks && (
        <BasicModal
          title="How It Works"
          onClose={() =>
            setShowHowItWorks(
              false,
            )
          }
        >
          <div className="space-y-5">
            <div className="rounded-2xl bg-blue-50 p-5">
              <h3 className="font-black text-slate-900">
                KhojMarket ka complete process
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Product ya service Roman Urdu, Urdu ya English mein describe karein. Voice aur multiple images bhi use kar sakte hain.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["1", "Requirement Add Karein", "Text, voice aur maximum 5 images ke sath requirement add karein."],
                ["2", "Details Review Karein", "Generated fields, location, budget aur category ko review/edit karein."],
                ["3", "Verification Complete Karein", "Phone aur requirement verification complete hone ke baad post public hoti hai."],
                ["4", "Seller Inquiries", "Verified sellers active requirement par inquiry ya quotation bhejte hain."],
              ].map(([number, stepTitle, description]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    {number}
                  </div>

                  <h4 className="mt-4 font-black">
                    {stepTitle}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex gap-3">
                <BadgeCheck className="mt-0.5 shrink-0 text-emerald-600" />

                <div>
                  <h4 className="font-black">
                    Verified Requirement
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Badge requirement ki verification show karta hai. Ye automatically user ko Verified User declare nahi karta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </BasicModal>
      )}

      {showHelp && (
        <BasicModal
          title="Help"
          onClose={() =>
            setShowHelp(
              false,
            )
          }
        >
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-black">
                Help & Icons Guide
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Har important action ka icon aur purpose neeche diya gaya hai.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Mic size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Voice Input</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Roman Urdu ya Urdu mein requirement bolne ke liye.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Paperclip size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Images</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Maximum 5 product/service images attach karne ke liye.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Sparkles size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Generate Fields</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Customer ke text ke hisab se relevant fields generate karta hai.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Map Location</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Filter mein map/current location se location select karne ke liye.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BadgeCheck size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Verified Requirement</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Requirement verification complete hone ka badge.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Send size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Send Inquiry</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Verified seller active requirement par inquiry bhejta hai.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h4 className="font-black">
                Submit issue?
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Red * wale fields complete karein, Country aur City select karein, aur kam az kam 1 image upload karein.
              </p>
            </div>
          </div>
        </BasicModal>
      )}

      <FastVerificationModal
        open={
          showOtp
        }
        phone={
          currentUser?.phone ??
          getCurrentUser()?.phone ??
          ""
        }
        onClose={() =>
          setShowOtp(
            false,
          )
        }
        onVerified={
          handleOtpVerified
        }
      />

      {successMessage && (
        <div className="fixed bottom-24 left-1/2 z-[110] -translate-x-1/2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white shadow-xl">
          <CheckCircle2
            size={17}
            className="mr-2 inline"
          />

          {
            successMessage
          }
        </div>
      )}
    </div>
  );
}

// ======================================================
// FILTERS
// ======================================================

function Filters({
  country,
  setCountry,
  province,
  setProvince,
  city,
  setCity,
  area,
  setArea,
  postalCode,
  setPostalCode,
  category,
  setCategory,
  categories,
  type,
  setType,
  activity,
  setActivity,
  postedDate,
  setPostedDate,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  verifiedOnly,
  setVerifiedOnly,
}: {
  country: string;
  setCountry: (value: string) => void;

  province: string;
  setProvince: (value: string) => void;

  city: string;
  setCity: (value: string) => void;

  area: string;
  setArea: (value: string) => void;

  postalCode: string;
  setPostalCode: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  categories: string[];

  type: RequirementTypeFilter;
  setType: (value: RequirementTypeFilter) => void;

  activity: ActivityFilter;
  setActivity: (value: ActivityFilter) => void;

  postedDate: PostedDateFilter;
  setPostedDate: (value: PostedDateFilter) => void;

  minPrice: number;
  setMinPrice: (value: number) => void;

  maxPrice: number;
  setMaxPrice: (value: number) => void;

  verifiedOnly: boolean;
  setVerifiedOnly: (value: boolean) => void;
}) {
  const [
    countryOptions,
    setCountryOptions,
  ] =
    useState<string[]>(
      [],
    );

  const [
    cityOptions,
    setCityOptions,
  ] =
    useState<string[]>(
      [],
    );

  const [
    locationLoading,
    setLocationLoading,
  ] =
    useState(false);


  const [
    showMapPicker,
    setShowMapPicker,
  ] =
    useState(false);

  useEffect(() => {
    let cancelled =
      false;

    getCountries()
      .then(
        (items) => {
          if (
            !cancelled
          ) {
            setCountryOptions(
              items,
            );
          }
        },
      )
      .catch(
        () => {
          if (
            !cancelled
          ) {
            setCountryOptions(
              [],
            );
          }
        },
      );

    return () => {
      cancelled =
        true;
    };
  }, []);

  useEffect(() => {
    let cancelled =
      false;

    if (!country) {
      setCityOptions(
        [],
      );

      return () => {
        cancelled =
          true;
      };
    }

    setLocationLoading(
      true,
    );

    getCitiesByCountry(
      country,
    )
      .then(
        (items) => {
          if (
            !cancelled
          ) {
            setCityOptions(
              items,
            );
          }
        },
      )
      .catch(
        () => {
          if (
            !cancelled
          ) {
            setCityOptions(
              [],
            );
          }
        },
      )
      .finally(
        () => {
          if (
            !cancelled
          ) {
            setLocationLoading(
              false,
            );
          }
        },
      );

    return () => {
      cancelled =
        true;
    };
  }, [country]);

  return (
    <div className="mt-6 space-y-6">

      <FilterGroup
        title="Location"
      >
        <div className="grid gap-2">
          <select
            value={country}
            onChange={(event) => {
              const nextCountry =
                event.target.value;

              setCountry(
                nextCountry,
              );

              setCity("");
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">
              All Countries
            </option>

            {countryOptions.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}
          </select>

          <select
            value={city}
            onChange={(event) =>
              setCity(
                event.target.value,
              )
            }
            disabled={!country}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {locationLoading
                ? "Loading Cities..."
                : country
                  ? "All Cities"
                  : "Select Country First"}
            </option>

            {cityOptions.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}
          </select>

          <input
            value={province}
            onChange={(event) =>
              setProvince(
                event.target.value,
              )
            }
            placeholder="Province / State"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <input
            value={area}
            onChange={(event) =>
              setArea(
                event.target.value,
              )
            }
            placeholder="Area / Locality"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <div className="relative">
            <MapPin
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={postalCode}
              onChange={(event) =>
                setPostalCode(
                  event.target.value,
                )
              }
              placeholder="Postal Code"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>


          <button
            type="button"
            onClick={() =>
              setShowMapPicker(
                true,
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-100"
          >
            <MapPin
              size={16}
            />
            Select Location on Map
          </button>
        </div>
      </FilterGroup>

      <FilterGroup
        title="Category"
      >
        <select
          value={
            category
          }
          onChange={(
            event,
          ) =>
            setCategory(
              event.target.value,
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
        >
          <option value="all">
            All Categories
          </option>

          {categories.map(
            (
              item,
            ) => (
              <option
                key={
                  item
                }
                value={
                  item
                }
              >
                {item}
              </option>
            ),
          )}
        </select>
      </FilterGroup>

      <FilterGroup
        title="Range"
      >
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>
              {formatRangeValue(
                minPrice,
              )}
            </span>

            <span>
              {formatRangeValue(
                maxPrice,
              )}
            </span>
          </div>

          <div className="relative h-7">
            <div className="absolute left-0 right-0 top-3 h-1.5 rounded-full bg-slate-200" />

            <div
              className="absolute top-3 h-1.5 rounded-full bg-blue-600"
              style={{
                left: `${(
                  minPrice /
                  MAX_RANGE
                ) * 100}%`,
                right: `${100 - (
                  maxPrice /
                  MAX_RANGE
                ) * 100}%`,
              }}
            />

            <input
              type="range"
              min={0}
              max={MAX_RANGE}
              step={100_000}
              value={minPrice}
              onChange={(event) => {
                const next = Math.min(
                  Number(
                    event.target.value,
                  ),
                  maxPrice,
                );

                setMinPrice(
                  next,
                );
              }}
              className="pointer-events-none absolute inset-0 h-7 w-full appearance-none bg-transparent
                [&::-webkit-slider-runnable-track]:h-1.5
                [&::-webkit-slider-runnable-track]:bg-transparent
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:mt-[-5px]
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-blue-600
                [&::-webkit-slider-thumb]:bg-white
                [&::-moz-range-track]:bg-transparent
                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-blue-600
                [&::-moz-range-thumb]:bg-white"
            />

            <input
              type="range"
              min={0}
              max={MAX_RANGE}
              step={100_000}
              value={maxPrice}
              onChange={(event) => {
                const next = Math.max(
                  Number(
                    event.target.value,
                  ),
                  minPrice,
                );

                setMaxPrice(
                  next,
                );
              }}
              className="pointer-events-none absolute inset-0 h-7 w-full appearance-none bg-transparent
                [&::-webkit-slider-runnable-track]:h-1.5
                [&::-webkit-slider-runnable-track]:bg-transparent
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:mt-[-5px]
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-blue-600
                [&::-webkit-slider-thumb]:bg-white
                [&::-moz-range-track]:bg-transparent
                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-blue-600
                [&::-moz-range-thumb]:bg-white"
            />
          </div>

          <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400">
            <span>PKR 0</span>
            <span>PKR 50 Cr</span>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup
        title="Requirement Type"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Radio
            label="All"
            checked={
              type ===
              "all"
            }
            onChange={() =>
              setType(
                "all",
              )
            }
          />

          <Radio
            label="Product"
            checked={
              type ===
              "product"
            }
            onChange={() =>
              setType(
                "product",
              )
            }
          />

          <Radio
            label="Service"
            checked={
              type ===
              "service"
            }
            onChange={() =>
              setType(
                "service",
              )
            }
          />
        </div>
      </FilterGroup>

      <FilterGroup
        title="Posted Date"
      >
        <Radio
          label="Any Time"
          checked={
            postedDate ===
            "any"
          }
          onChange={() =>
            setPostedDate(
              "any",
            )
          }
        />

        <Radio
          label="Today"
          checked={
            postedDate ===
            "today"
          }
          onChange={() =>
            setPostedDate(
              "today",
            )
          }
        />

        <Radio
          label="Last 7 Days"
          checked={
            postedDate ===
            "7days"
          }
          onChange={() =>
            setPostedDate(
              "7days",
            )
          }
        />

        <Radio
          label="Last 30 Days"
          checked={
            postedDate ===
            "30days"
          }
          onChange={() =>
            setPostedDate(
              "30days",
            )
          }
        />
      </FilterGroup>

      <FilterGroup
        title="Post Status"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Radio
            label="All"
            checked={
              activity ===
              "all"
            }
            onChange={() =>
              setActivity(
                "all",
              )
            }
          />

          <Radio
            label="Active"
            checked={
              activity ===
              "active"
            }
            onChange={() =>
              setActivity(
                "active",
              )
            }
          />

          <Radio
            label="Inactive"
            checked={
              activity ===
              "inactive"
            }
            onChange={() =>
              setActivity(
                "inactive",
              )
            }
          />
        </div>
      </FilterGroup>

      <FilterGroup
        title="Trust"
      >
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={
              verifiedOnly
            }
            onChange={(
              event,
            ) =>
              setVerifiedOnly(
                event.target.checked,
              )
            }
          />

          Verified Requirements
        </label>
      </FilterGroup>

      {showMapPicker && (
        <MapLocationModal
          onClose={() =>
            setShowMapPicker(
              false,
            )
          }
          onUseLocation={(
            latitude,
            longitude,
          ) => {
            setArea(
              `${latitude.toFixed(
                5,
              )}, ${longitude.toFixed(
                5,
              )}`,
            );

            setShowMapPicker(
              false,
            );
          }}
        />
      )}
    </div>
  );
}

// ======================================================
// CARD
// ======================================================

function RequirementCard({
  requirement,
  onView,
  onInquiry,
}: {
  requirement: PublicRequirement;
  onView: () => void;
  onInquiry: () => void;
}) {
  const active =
    requirement.activityStatus ===
    "active";

  return (
    <article
      className={`rounded-[24px] border bg-white p-4 shadow-sm transition sm:p-5 ${
        active
          ? "border-slate-200 hover:border-blue-200 hover:shadow-lg"
          : "border-slate-200 opacity-80"
      }`}
    >
      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        {/* IMAGE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {requirement.imageUrl ? (
            <img
              src={
                requirement.imageUrl
              }
              alt={
                requirement.title
              }
              className="h-48 w-full object-cover md:h-full md:min-h-[220px]"
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-slate-400 md:h-full md:min-h-[220px]">
              <div className="text-center">
                <PackageSearch
                  size={32}
                  className="mx-auto"
                />

                <p className="mt-2 text-xs font-semibold">
                  No image provided
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <UserRound
                size={18}
              />
            </div>

            <div>
              <p className="text-sm font-black">
                {
                  requirement.userName
                }
              </p>

              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Star
                  size={13}
                  className="fill-amber-400 text-amber-400"
                />

                <strong>
                  {
                    requirement.userRating
                  }
                </strong>

                <span>
                  (
                  {
                    requirement.userReviewCount
                  }{" "}
                  reviews)
                </span>
              </div>
            </div>

            <div className="ml-auto flex flex-wrap gap-2">
              <StatusBadge
                active={
                  active
                }
              />

              {requirement.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                  <BadgeCheck
                    size={14}
                  />
                  Verified Requirement
                </span>
              )}

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold">
                {requirement.requirementType ===
                "service"
                  ? "Service"
                  : "Product"}
              </span>
            </div>
          </div>

          <h2 className="mt-5 text-xl font-black">
            {
              requirement.title
            }
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {
              requirement.description
            }
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <MapPin
                size={15}
              />
              {
                requirement.location
              }
            </span>

            {requirement.category && (
              <span className="inline-flex items-center gap-2">
                <PackageSearch
                  size={15}
                />
                {
                  requirement.category
                }
              </span>
            )}

            {requirement.budget && (
              <strong className="text-slate-950">
                {
                  requirement.budget
                }
              </strong>
            )}

            {requirement.createdAt && (
              <span className="inline-flex items-center gap-2">
                <CalendarDays
                  size={15}
                />
                {new Date(
                  requirement.createdAt,
                ).toLocaleDateString(
                  "en-GB",
                  {
                    day:
                      "2-digit",
                    month:
                      "short",
                    year:
                      "numeric",
                  },
                )}
              </span>
            )}
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">
            <span className="inline-flex items-center gap-2">
              <MessageSquareText
                size={16}
                className="text-blue-600"
              />
              {
                requirement.queryCount
              }{" "}
              Queries Submitted
            </span>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={
                onView
              }
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:border-slate-300"
            >
              View Requirement
            </button>

            {active ? (
              <button
                type="button"
                onClick={
                  onInquiry
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                <Send
                  size={16}
                />
                Send Inquiry
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500"
              >
                Requirement Closed
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ======================================================
// PAGINATION
// ======================================================

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const start =
    (currentPage -
      1) *
      pageSize +
    1;

  const end =
    Math.min(
      currentPage *
        pageSize,
      totalItems,
    );

  const pages =
    Array.from(
      {
        length:
          totalPages,
      },
      (
        _,
        index,
      ) =>
        index + 1,
    );

  return (
    <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-slate-200 bg-white px-4 py-4 sm:flex-row">

      <p className="text-sm text-slate-500">
        Showing{" "}
        <strong>
          {start}
        </strong>{" "}
        –{" "}
        <strong>
          {end}
        </strong>{" "}
        of{" "}
        <strong>
          {totalItems}
        </strong>
      </p>

      <div className="flex items-center gap-1">

        <button
          type="button"
          disabled={
            currentPage ===
            1
          }
          onClick={() =>
            onPageChange(
              currentPage -
                1,
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
        >
          <ChevronLeft
            size={16}
          />
        </button>

        {pages.map(
          (
            page,
          ) => (
            <button
              key={
                page
              }
              type="button"
              onClick={() =>
                onPageChange(
                  page,
                )
              }
              className={`h-9 min-w-9 rounded-lg px-2 text-sm font-bold ${
                page ===
                currentPage
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            onPageChange(
              currentPage +
                1,
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
        >
          <ChevronRight
            size={16}
          />
        </button>
      </div>
    </div>
  );
}

// ======================================================
// DETAIL
// ======================================================

function RequirementDetail({
  requirement,
  onClose,
  onInquiry,
}: {
  requirement: PublicRequirement;
  onClose: () => void;
  onInquiry: () => void;
}) {
  const active =
    requirement.activityStatus ===
    "active";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-7">

        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-2">
              <strong>
                {
                  requirement.userName
                }
              </strong>

              <BadgeCheck
                size={16}
                className="text-blue-600"
              />
            </div>

            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Star
                size={13}
                className="fill-amber-400 text-amber-400"
              />

              {
                requirement.userRating
              }
            </div>
          </div>

          <button
            onClick={
              onClose
            }
          >
            <X />
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          <StatusBadge
            active={
              active
            }
          />

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            Verified Requirement
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-black">
          {
            requirement.title
          }
        </h2>

        <p className="mt-3 leading-7 text-slate-600">
          {
            requirement.description
          }
        </p>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 font-bold">
          {
            requirement.queryCount
          }{" "}
          Queries Submitted
        </div>

        <button
          type="button"
          disabled={
            !active
          }
          onClick={
            onInquiry
          }
          className={`mt-6 w-full rounded-xl px-4 py-3 font-bold ${
            active
              ? "bg-blue-600 text-white"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
        >
          {active
            ? "Send Inquiry"
            : "Requirement Closed"}
        </button>
      </div>
    </div>
  );
}

// ======================================================
// AI COMPOSER
// ======================================================

function AiComposer({
  input,
  requirement,
  setInput,
  images,
  setImages,
  onGenerate,
  onFieldChange,
  onSubmit,
  onClose,
}: {
  input: string;
  requirement: StructuredRequirement | null;
  setInput: (value: string) => void;
  images: string[];
  setImages: (value: string[]) => void;
  onGenerate: () => void;
  onFieldChange: (
    fieldId: string,
    value: string,
  ) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const fileRef =
    useRef<HTMLInputElement | null>(
      null,
    );


  const [
    isListening,
    setIsListening,
  ] =
    useState(false);


  const [
    voiceLanguage,
    setVoiceLanguage,
  ] =
    useState<
      "roman-urdu" |
      "urdu"
    >(
      "roman-urdu",
    );


  const [
    showValidation,
    setShowValidation,
  ] =
    useState(false);

  const imageMissing =
    showValidation &&
    images.length === 0;

  const isFieldMissing = (
    field:
      RequirementField,
  ) =>
    showValidation &&
    field.required &&
    !field.value.trim();

  const startVoiceInput =
    () => {
      const browserWindow =
        window as typeof window & {
          SpeechRecognition?:
            SpeechRecognitionConstructor;
          webkitSpeechRecognition?:
            SpeechRecognitionConstructor;
        };

      const Recognition =
        browserWindow.SpeechRecognition ??
        browserWindow.webkitSpeechRecognition;

      if (!Recognition) {
        alert(
          "Voice input is not supported in this browser. Chrome or Edge use karein.",
        );
        return;
      }

      const recognition =
        new Recognition();

      recognition.lang =
        voiceLanguage ===
        "urdu"
          ? "ur-PK"
          : "en-PK";
      recognition.interimResults =
        false;
      recognition.continuous =
        false;

      recognition.onresult =
        (
          event,
        ) => {
          const transcript =
            event.results[
              event.results.length -
                1
            ]?.[0]?.transcript?.trim();

          if (
            transcript
          ) {
            setInput(
              input.trim()
                ? `${input.trim()} ${transcript}`
                : transcript,
            );
          }
        };

      recognition.onerror =
        () => {
          setIsListening(
            false,
          );
        };

      recognition.onend =
        () => {
          setIsListening(
            false,
          );
        };

      try {
        setIsListening(
          true,
        );

        recognition.start();
      } catch {
        setIsListening(
          false,
        );
      }
    };

  const [
    countryOptions,
    setCountryOptions,
  ] =
    useState<string[]>(
      [],
    );

  const countryValue =
    requirement?.fields.find(
      (field) =>
        normalize(
          field.id,
        ) ===
        "country",
    )?.value ?? "";

  const [
    cityOptions,
    setCityOptions,
  ] =
    useState<string[]>(
      [],
    );

  useEffect(() => {
    getCountries()
      .then(
        setCountryOptions,
      )
      .catch(
        () =>
          setCountryOptions(
            [],
          ),
      );
  }, []);

  useEffect(() => {
    if (!countryValue) {
      setCityOptions(
        [],
      );

      return;
    }

    getCitiesByCountry(
      countryValue,
    )
      .then(
        setCityOptions,
      )
      .catch(
        () =>
          setCityOptions(
            [],
          ),
      );
  }, [
    countryValue,
  ]);

  const attach =
    (
      event:
        ChangeEvent<HTMLInputElement>,
    ) => {
      const availableSlots =
        Math.max(
          0,
          5 -
            images.length,
        );

      const files =
        Array.from(
          event.target.files ??
            [],
        ).slice(
          0,
          availableSlots,
        );

      if (
        files.length ===
        0
      ) {
        return;
      }

      Promise.all(
        files.map(
          (file) =>
            new Promise<string>(
              (
                resolve,
                reject,
              ) => {
                const reader =
                  new FileReader();

                reader.onload =
                  () => {
                    if (
                      typeof reader.result ===
                      "string"
                    ) {
                      resolve(
                        reader.result,
                      );
                    } else {
                      reject();
                    }
                  };

                reader.onerror =
                  () =>
                    reject();

                reader.readAsDataURL(
                  file,
                );
              },
            ),
        ),
      )
        .then(
          (
            newImages,
          ) => {
            setImages(
              [
                ...images,
                ...newImages,
              ].slice(
                0,
                5,
              ),
            );
          },
        )
        .catch(
          () => {
            // Local preview failure: keep current images unchanged.
          },
        );

      event.target.value =
        "";
    };

  const removeImage =
    (
      index: number,
    ) => {
      setImages(
        images.filter(
          (
            _,
            imageIndex,
          ) =>
            imageIndex !==
            index,
        ),
      );
    };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6">

        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-black">
              Add Requirement
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Product ya service describe karein.
            </p>
          </div>

          <button
            onClick={
              onClose
            }
          >
            <X />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">

          <textarea
            rows={5}
            value={
              input
            }
            onChange={(
              event,
            ) =>
              setInput(
                event.target.value,
              )
            }
            placeholder="Mujhe Lahore mein laptop chahiye..."
            className="w-full resize-none bg-transparent p-2 outline-none"
          />

          {isListening && (
            <div className="mt-2 text-xs font-semibold text-red-600">
              Listening... bolain
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500">
                Voice Language
              </p>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Roman Urdu mode English script recognition try karta hai.
              </p>
            </div>

            <select
              value={
                voiceLanguage
              }
              onChange={(
                event,
              ) =>
                setVoiceLanguage(
                  event.target.value as
                    | "roman-urdu"
                    | "urdu",
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
            >
              <option value="roman-urdu">
                Roman Urdu
              </option>

              <option value="urdu">
                Urdu
              </option>
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">

            <div className="flex gap-2">

              <input
                ref={
                  fileRef
                }
                type="file"
                accept="image/*"
                multiple
                onChange={
                  attach
                }
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileRef.current?.click()
                }
                className="rounded-xl p-2 text-slate-500 hover:bg-white"
              >
                <Paperclip />
              </button>

              <button
                type="button"
                onClick={
                  startVoiceInput
                }
                className={`rounded-xl p-2 transition ${
                  isListening
                    ? "bg-red-50 text-red-600"
                    : "text-slate-500 hover:bg-white"
                }`}
                title={
                  isListening
                    ? "Listening..."
                    : "Voice input"
                }
              >
                <Mic
                  className={
                    isListening
                      ? "animate-pulse"
                      : ""
                  }
                />
              </button>
            </div>

            <button
              type="button"
              onClick={
                onGenerate
              }
              disabled={
                !input.trim()
              }
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white ${
                input.trim()
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              <Sparkles
                size={15}
              />

              Generate
            </button>
          </div>
        </div>

        {requirement && (
          <div className="mt-6 rounded-2xl border border-slate-200 p-5">

            <h3 className="text-lg font-black">
              {
                requirement.title
              }
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {requirement.fields
                .filter(
                  (field) =>
                    !normalize(
                      field.id,
                    ).startsWith(
                      "image",
                    ),
                )
                .map(
                (
                  field,
                ) => (
                  <div
                    key={
                      field.id
                    }
                  >
                    <span className="mb-1 block text-xs font-bold text-slate-500">
                      {
                        field.label
                      }

                      {field.required && (
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      )}
                    </span>

                    {normalize(
                      field.id,
                    ) ===
                    "country" ? (
                      <select
                        value={
                          field.value
                        }
                        onChange={(
                          event,
                        ) => {
                          onFieldChange(
                            field.id,
                            event.target.value,
                          );

                          const cityField =
                            requirement.fields.find(
                              (
                                item,
                              ) =>
                                normalize(
                                  item.id,
                                ) ===
                                "city",
                            );

                          if (
                            cityField
                          ) {
                            onFieldChange(
                              cityField.id,
                              "",
                            );
                          }
                        }}
                        className={`w-full rounded-xl border bg-white px-3 py-3 outline-none ${
                          isFieldMissing(
                            field,
                          )
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-slate-200 focus:border-blue-500"
                        }`}
                      >
                        <option value="">
                          Select Country
                        </option>

                        {countryOptions.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          ),
                        )}
                      </select>
                    ) : normalize(
                        field.id,
                      ) ===
                      "city" ? (
                      <select
                        value={
                          field.value
                        }
                        onChange={(
                          event,
                        ) =>
                          onFieldChange(
                            field.id,
                            event.target.value,
                          )
                        }
                        disabled={
                          !countryValue
                        }
                        className={`w-full rounded-xl border bg-white px-3 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                          isFieldMissing(
                            field,
                          )
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-slate-200 focus:border-blue-500"
                        }`}
                      >
                        <option value="">
                          {countryValue
                            ? "Select City"
                            : "Select Country First"}
                        </option>

                        {cityOptions.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          ),
                        )}
                      </select>
                    ) : (
                      <input
                        value={
                          field.value
                        }
                        onChange={(
                          event,
                        ) =>
                          onFieldChange(
                            field.id,
                            event.target.value,
                          )
                        }
                        className={`w-full rounded-xl border px-3 py-3 outline-none ${
                          isFieldMissing(
                            field,
                          )
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-slate-200 focus:border-blue-500"
                        }`}
                      />
                    )}

                    {isFieldMissing(
                      field,
                    ) && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">
                        {field.label} is required.
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">
                  Requirement Images
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <span className="text-xs text-slate-400">
                  {images.length}/5
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  fileRef.current?.click()
                }
                className={`flex min-h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed p-4 transition ${
                  imageMissing
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <div className="text-center">
                  <Paperclip
                    size={25}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-2 text-sm font-bold text-slate-700">
                    Images upload karein
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Maximum 5 images — JPG, PNG, WEBP
                  </p>
                </div>
              </button>

              {imageMissing && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  Kam az kam 1 requirement image required hai.
                </p>
              )}

              {images.length >
                0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map(
                    (
                      image,
                      index,
                    ) => (
                      <div
                        key={index}
                        className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={image}
                          alt={`Requirement ${index + 1}`}
                          className="h-28 w-full object-cover"
                        />

                        {index ===
                          0 && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-bold text-white">
                            Cover
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              index,
                            )
                          }
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/75 text-white"
                          title="Remove image"
                        >
                          <X
                            size={14}
                          />
                        </button>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowValidation(
                  true,
                );

                onSubmit();
              }}
              className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"
            >
              Submit Requirement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================
// COMMON
// ======================================================

function HeaderIcon({
  title,
  children,
  onClick,
}: {
  title: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={
        title
      }
      onClick={
        onClick
      }
      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
    >
      {children}
    </button>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-black ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active
        ? "ACTIVE"
        : "INACTIVE"}
    </span>
  );
}


function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function Radio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600">
      <input
        type="radio"
        checked={
          checked
        }
        onChange={
          onChange
        }
      />

      {label}
    </label>
  );
}


function MapLocationModal({
  onClose,
  onUseLocation,
}: {
  onClose: () => void;
  onUseLocation: (
    latitude: number,
    longitude: number,
  ) => void;
}) {
  const [
    latitude,
    setLatitude,
  ] =
    useState(31.5204);

  const [
    longitude,
    setLongitude,
  ] =
    useState(74.3587);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const useCurrentLocation =
    () => {
      if (
        !navigator.geolocation
      ) {
        alert(
          "Browser location support available nahi hai.",
        );

        return;
      }

      setLoading(
        true,
      );

      navigator.geolocation.getCurrentPosition(
        (
          position,
        ) => {
          setLatitude(
            position.coords.latitude,
          );

          setLongitude(
            position.coords.longitude,
          );

          setLoading(
            false,
          );
        },
        () => {
          setLoading(
            false,
          );

          alert(
            "Location access allow karein.",
          );
        },
      );
    };

  const delta =
    0.03;

  const mapUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=${
      longitude - delta
    }%2C${
      latitude - delta
    }%2C${
      longitude + delta
    }%2C${
      latitude + delta
    }&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-black">
              Select Location on Map
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current location use karein ya latitude / longitude adjust karein.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X />
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <iframe
              title="Location map"
              src={mapUrl}
              className="h-80 w-full"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-bold text-slate-500">
                Latitude
              </span>

              <input
                type="number"
                step="0.00001"
                value={latitude}
                onChange={(event) =>
                  setLatitude(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-bold text-slate-500">
                Longitude
              </span>

              <input
                type="number"
                step="0.00001"
                value={longitude}
                onChange={(event) =>
                  setLongitude(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={useCurrentLocation}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-slate-50"
            >
              {loading
                ? "Getting Location..."
                : "Use My Current Location"}
            </button>

            <button
              type="button"
              onClick={() =>
                onUseLocation(
                  latitude,
                  longitude,
                )
              }
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Use This Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BasicModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">

        <div className="flex justify-between">
          <h2 className="text-xl font-black">
            {title}
          </h2>

          <button
            onClick={
              onClose
            }
          >
            <X />
          </button>
        </div>

        <div className="mt-5">
          {children}
        </div>
      </div>
    </div>
  );
}

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


function inferRequirementType(
  requirement:
    StructuredRequirement,
): RequirementType {
  const value = [
    requirement.category,
    requirement.subCategory ??
      "",
    requirement.title,
  ]
    .join(
      " ",
    )
    .toLowerCase();

  const words = [
    "service",
    "repair",
    "electric",
    "plumber",
    "technician",
    "developer",
  ];

  return words.some(
    (item) =>
      value.includes(
        item,
      ),
  )
    ? "service"
    : "product";
}

function formatRangeValue(
  value: number,
) {
  if (value >= 10_000_000) {
    const crore =
      value / 10_000_000;

    return `PKR ${Number.isInteger(crore) ? crore : crore.toFixed(1)} Cr`;
  }

  if (value >= 100_000) {
    const lakh =
      value / 100_000;

    return `PKR ${Number.isInteger(lakh) ? lakh : lakh.toFixed(1)} Lac`;
  }

  return `PKR ${value.toLocaleString()}`;
}

function buildLocationFromFields(
  fields: RequirementField[],
) {
  const aliases: Record<string, string[]> = {
    country: ["country"],
    province: ["province", "state", "province state"],
    city: ["city"],
    area: ["area", "locality", "location", "delivery location"],
    postalCode: ["postal code", "postalcode", "zip", "zipcode"],
  };

  const read = (names: string[]) => {
    const normalizedNames =
      names.map(normalize);

    return (
      fields.find(
        (field) =>
          normalizedNames.includes(
            normalize(field.id),
          ) ||
          normalizedNames.includes(
            normalize(field.label),
          ),
      )?.value.trim() ?? ""
    );
  };

  const country = read(aliases.country);
  const province = read(aliases.province);
  const city = read(aliases.city);
  const area = read(aliases.area);
  const postalCode = read(aliases.postalCode);

  const parts = [
    area,
    city,
    province,
    postalCode,
    country,
  ].filter(Boolean);

  return parts.length > 0
    ? [...new Set(parts)].join(", ")
    : "Pakistan";
}

function createLocationFields(
  input: string,
): RequirementField[] {
  const lower = input.toLowerCase();

  const city =
    lower.includes("lahore")
      ? "Lahore"
      : lower.includes("karachi")
        ? "Karachi"
        : lower.includes("islamabad")
          ? "Islamabad"
          : lower.includes("rawalpindi")
            ? "Rawalpindi"
            : "";

  const province =
    ["lahore", "rawalpindi"].some((value) => lower.includes(value))
      ? "Punjab"
      : lower.includes("karachi")
        ? "Sindh"
        : lower.includes("islamabad")
          ? "Islamabad Capital Territory"
          : "";

  const area =
    lower.includes("dha")
      ? "DHA"
      : lower.includes("gulberg")
        ? "Gulberg"
        : "";

  return [
    createField(
      "country",
      "Country",
      "Pakistan",
      true,
    ),
    createField(
      "province",
      "Province / State",
      province,
      false,
    ),
    createField(
      "city",
      "City",
      city,
      true,
    ),
    createField(
      "area",
      "Area / Locality",
      area,
      false,
    ),
    createField(
      "postalCode",
      "Postal Code",
      "",
      false,
    ),
  ];
}

function createField(
  id: string,
  label: string,
  value: string,
  required: boolean,
): RequirementField {
  return {
    id,
    label,
    value,
    required,
  };
}

function generateMockRequirement(
  input: string,
): StructuredRequirement {
  const lower =
    input.toLowerCase();

  const hasAny = (
    words: string[],
  ) =>
    words.some(
      (word) =>
        lower.includes(
          word,
        ),
    );

  const locationFields =
    createLocationFields(
      input,
    );

  const commonFields:
    RequirementField[] = [
      ...locationFields,
  ];

  // ====================================================
  // SERVICE
  // ====================================================

  if (
    hasAny([
      "electrician",
      "wiring",
      "bijli",
      "electric",
    ])
  ) {
    return {
      title:
        "Electrician Required",
      category:
        "Home Services",
      subCategory:
        "Electrical Work",
      requirementType:
        "service",
      fields: [
        createField(
          "service",
          "Service",
          "Electrical Work",
          true,
        ),
        createField(
          "workDetails",
          "Work Details",
          input,
          true,
        ),
        ...commonFields,
        createField(
          "preferredDate",
          "Preferred Date",
          hasAny([
            "kal",
            "tomorrow",
          ])
            ? "Tomorrow"
            : "",
          false,
        ),
        createField(
          "budget",
          "Budget / Range",
          "",
          false,
        ),
      ],
    };
  }

  if (
    hasAny([
      "ac repair",
      "ac service",
      "ac technician",
      "air conditioner",
    ])
  ) {
    return {
      title:
        "AC Service Required",
      category:
        "Home Services",
      subCategory:
        "AC Repair",
      requirementType:
        "service",
      fields: [
        createField(
          "service",
          "Service",
          "AC Repair / Service",
          true,
        ),
        createField(
          "details",
          "AC / Work Details",
          input,
          true,
        ),
        ...commonFields,
        createField(
          "preferredDate",
          "Preferred Date",
          hasAny([
            "kal",
            "tomorrow",
          ])
            ? "Tomorrow"
            : "",
          false,
        ),
        createField(
          "budget",
          "Budget / Range",
          "",
          false,
        ),
      ],
    };
  }

  if (
    hasAny([
      "plumber",
      "plumbing",
      "pipe leak",
      "water leakage",
    ])
  ) {
    return {
      title:
        "Plumber Required",
      category:
        "Home Services",
      subCategory:
        "Plumbing",
      requirementType:
        "service",
      fields: [
        createField(
          "service",
          "Service",
          "Plumbing",
          true,
        ),
        createField(
          "workDetails",
          "Work Details",
          input,
          true,
        ),
        ...commonFields,
        createField(
          "preferredDate",
          "Preferred Date",
          "",
          false,
        ),
        createField(
          "budget",
          "Budget / Range",
          "",
          false,
        ),
      ],
    };
  }

  if (
    hasAny([
      "web developer",
      "website",
      "software developer",
      "app developer",
      "mobile app",
    ])
  ) {
    return {
      title:
        "Developer Required",
      category:
        "Professional Services",
      subCategory:
        "Software Development",
      requirementType:
        "service",
      fields: [
        createField(
          "service",
          "Service",
          hasAny([
            "mobile app",
            "app developer",
          ])
            ? "Mobile App Development"
            : "Web / Software Development",
          true,
        ),
        createField(
          "projectDetails",
          "Project Details",
          input,
          true,
        ),
        ...commonFields,
        createField(
          "timeline",
          "Timeline",
          "",
          false,
        ),
        createField(
          "budget",
          "Budget / Range",
          "",
          false,
        ),
      ],
    };
  }

  // ====================================================
  // PRODUCT
  // ====================================================

  if (
    hasAny([
      "car",
      "corolla",
      "civic",
      "alto",
      "vehicle",
      "gaari",
    ])
  ) {
    return {
      title:
        "Vehicle Required",
      category:
        "Vehicles",
      requirementType:
        "product",
      fields: [
        createField(
          "vehicleDetails",
          "Vehicle Details",
          input,
          true,
        ),
        createField(
          "brand",
          "Brand",
          hasAny([
            "toyota",
            "corolla",
          ])
            ? "Toyota"
            : hasAny([
                  "honda",
                  "civic",
                ])
              ? "Honda"
              : "",
          false,
        ),
        createField(
          "model",
          "Model",
          hasAny([
            "corolla",
          ])
            ? "Corolla"
            : hasAny([
                  "civic",
                ])
              ? "Civic"
              : "",
          false,
        ),
        createField(
          "condition",
          "Condition",
          hasAny([
            "used",
            "second hand",
          ])
            ? "Used"
            : hasAny([
                  "new",
                  "brand new",
                ])
              ? "New"
              : "",
          false,
        ),
        ...commonFields,
        createField(
          "budget",
          "Budget / Range",
          "",
          false,
        ),
      ],
    };
  }

  if (
    hasAny([
      "laptop",
      "macbook",
      "computer",
      "notebook",
    ])
  ) {
    return {
      title:
        "Laptop Required",
      category:
        "Computers",
      requirementType:
        "product",
      fields: [
        createField(
          "productDetails",
          "Product Details",
          input,
          true,
        ),
        createField(
          "brand",
          "Brand",
          hasAny([
            "dell",
          ])
            ? "Dell"
            : hasAny([
                  "hp",
                ])
              ? "HP"
              : hasAny([
                    "lenovo",
                  ])
                ? "Lenovo"
                : hasAny([
                      "macbook",
                      "apple",
                    ])
                  ? "Apple"
                  : "",
          false,
        ),
        createField(
          "processor",
          "Processor",
          hasAny([
            "i7",
          ])
            ? "Intel Core i7"
            : hasAny([
                  "i5",
                ])
              ? "Intel Core i5"
              : "",
          false,
        ),
        createField(
          "ram",
          "RAM",
          hasAny([
            "16gb",
            "16 gb",
          ])
            ? "16 GB"
            : hasAny([
                  "8gb",
                  "8 gb",
                ])
              ? "8 GB"
              : "",
          false,
        ),
        createField(
          "storage",
          "Storage",
          hasAny([
            "512gb",
            "512 gb",
            "512",
          ])
            ? "512 GB"
            : "",
          false,
        ),
        ...commonFields,
        createField(
          "budget",
          "Budget / Range",
          "",
          false,
        ),
      ],
    };
  }

  if (
    hasAny([
      "mobile",
      "iphone",
      "phone",
      "samsung",
    ])
  ) {
    return {
      title:
        "Mobile Phone Required",
      category:
        "Mobiles",
      requirementType:
        "product",
      fields: [
        createField(
          "productDetails",
          "Product Details",
          input,
          true,
        ),
        createField(
          "brand",
          "Brand",
          hasAny([
            "iphone",
            "apple",
          ])
            ? "Apple"
            : hasAny([
                  "samsung",
                ])
              ? "Samsung"
              : "",
          false,
        ),
        createField(
          "model",
          "Model",
          "",
          false,
        ),
        createField(
          "condition",
          "Condition",
          "",
          false,
        ),
        ...commonFields,
        createField(
          "budget",
          "Budget / Range",
          "",
          false,
        ),
      ],
    };
  }

  if (
    hasAny([
      "watch",
      "rado",
      "rolex",
      "ghari",
    ])
  ) {
    return {
      title:
        "Watch Required",
      category:
        "Fashion & Accessories",
      subCategory:
        "Watches",
      requirementType:
        "product",
      fields: [
        createField(
          "productDetails",
          "Product Details",
          input,
          true,
        ),
        createField(
          "brand",
          "Brand",
          hasAny([
            "rado",
          ])
            ? "Rado"
            : hasAny([
                  "rolex",
                ])
              ? "Rolex"
              : "",
          false,
        ),
        createField(
          "condition",
          "Condition",
          "",
          false,
        ),
        ...commonFields,
        createField(
          "budget",
          "Budget / Range",
          "",
          false,
        ),
      ],
    };
  }

  // ====================================================
  // GENERIC / UNKNOWN
  // ====================================================
  // Unknown request ko kisi fixed product/service mein
  // force nahi karte. Customer ka original text preserve hota hai.

  const looksLikeService =
    hasAny([
      "chahiye service",
      "karwana",
      "repair",
      "service",
      "technician",
      "developer",
      "contractor",
      "mechanic",
      "cleaning",
      "installation",
    ]);

  return {
    title:
      looksLikeService
        ? "Service Required"
        : "Product / Requirement",
    category:
      "General",
    requirementType:
      looksLikeService
        ? "service"
        : "product",
    fields: [
      createField(
        "requirementDetails",
        "Requirement Details",
        input,
        true,
      ),
      ...commonFields,
      createField(
        "budget",
        "Budget / Range",
        "",
        false,
      ),
    ],
  };
}
