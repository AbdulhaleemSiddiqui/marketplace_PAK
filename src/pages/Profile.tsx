import {
  BadgeCheck,
  Box,
  CheckCircle2,
  Clock3,
  Coins,
  LogOut,
  MessageCircle,
  Pencil,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from "lucide-react";



import {
  useEffect,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import SellerVerificationModal from "../components/seller/SellerVerificationModal";

import {
  getCurrentUser,
  logoutUser,
  verifySellerForDemo,
} from "../services/authService";

import {
  getBuyerInquiriesForRequirement,
  markBuyerInquiryViewed,
  acceptBuyerInquiry,
  rejectBuyerInquiry,
} from "../services/buyerInquiryApiService";

import {
  getSellerWallet,
  getSellerWalletTransactions,
  getSellerInquiriesApi,
  type SellerWalletTransaction,
} from "../services/sellerProfileApiService";


import {
  getMyRequirements,
  getRequirementDetails,
  updateRequirement,
  uploadRequirementImages,
  deleteRequirementImage,
  getRequirementImageUrl,
  updateRequirementActivity,
  type RequirementListItem,
  type RequirementDetail,
} from "../services/requirementApiService";

import type {
  SellerInquiry,
} from "../types/marketplace";

import {
  startDealCompletion,
  getRequirementDeal,
  confirmSellerDealCompletion,
  cancelMarketplaceDeal,
  type MarketplaceDeal,
} from "../services/dealApiService";

import {
  createMarketplaceReview,
  getDealReviews,
} from "../services/reviewApiService";

import DealActionDialog, { type DealAction, type DealActionValues } from "../components/deals/DealActionDialog";

export default function Profile() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  const [
    requirements,
    setRequirements,
  ] = useState<RequirementListItem[]>([]);

  const [
    requirementsLoading,
    setRequirementsLoading,
  ] = useState(false);

  const [
    requirementsError,
    setRequirementsError,
  ] = useState("");

  const [dealAction, setDealAction] = useState<{ action: DealAction; inquiry: SellerInquiry } | null>(null);

  const [buyerInquiries, setBuyerInquiries] = useState<SellerInquiry[]>([]);
  const [buyerInquiriesLoading, setBuyerInquiriesLoading] = useState(false);
  const [buyerInquiriesError, setBuyerInquiriesError] = useState("");


  const [sellerCreditBalance, setSellerCreditBalance] = useState(0);
  const [sellerInquiries, setSellerInquiries] = useState<SellerInquiry[]>([]);
  const [creditTransactions, setCreditTransactions] =
    useState<SellerWalletTransaction[]>([]);
  const [sellerDataError, setSellerDataError] = useState("");


  const [sellerHistoryTab, setSellerHistoryTab] =
    useState<"active" | "closed" | "reviewed" | "other" | "credits">("active");
  const [dealByRequirement, setDealByRequirement] = useState<Record<string, MarketplaceDeal | null>>({});
  const [reviewedDealIds, setReviewedDealIds] = useState<Set<string>>(new Set());
  const [buyerInquiryTab, setBuyerInquiryTab] = useState<"current" | "reviewed">("current");
  const [buyerRequirementsTab, setBuyerRequirementsTab] = useState<"current" | "history">("current");
  const [sellerHistoryPage, setSellerHistoryPage] = useState(1);
  const SELLER_HISTORY_PAGE_SIZE = 5;


  const [
    editingRequirement,
    setEditingRequirement,
  ] =
    useState<RequirementDetail | null>(
      null,
    );
  

const [
    showSellerVerification,
    setShowSellerVerification,
  ] = useState(false);

  const initialMessage =
    (
      location.state as
        | {
            message?: string;
          }
        | null
    )?.message ?? "";

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState(
      initialMessage
    );

  void refreshKey;

  const user =
    getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      setRequirements([]);
      setRequirementsError("");
      setRequirementsLoading(false);
      return;
    }

    let cancelled = false;

    const loadRequirements = async () => {
      try {
        setRequirementsLoading(true);
        setRequirementsError("");

        const response = await getMyRequirements({
          page: 1,
          pageSize: 50,
        });

        if (!cancelled) {
          setRequirements(response.items ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setRequirementsError(
            error instanceof Error
              ? error.message
              : "Unable to load your requirements.",
          );
        }
      } finally {
        if (!cancelled) {
          setRequirementsLoading(false);
        }
      }
    };

    void loadRequirements();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role, refreshKey]);

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      setBuyerInquiries([]);
      setBuyerInquiriesError("");
      setBuyerInquiriesLoading(false);
      return;
    }

    if (requirementsLoading) return;

    if (requirements.length === 0) {
      setBuyerInquiries([]);
      setBuyerInquiriesError("");
      setBuyerInquiriesLoading(false);
      return;
    }

    let cancelled = false;

    const loadBuyerInquiries = async () => {
      setBuyerInquiriesLoading(true);
      setBuyerInquiriesError("");

      const results = await Promise.allSettled(
        requirements.map((requirement) =>
          getBuyerInquiriesForRequirement(requirement.id),
        ),
      );

      if (cancelled) return;

      const merged = results.flatMap((result) =>
        result.status === "fulfilled" ? result.value ?? [] : [],
      );

      const unique = Array.from(
        new Map(merged.map((inquiry) => [inquiry.id, inquiry])).values(),
      ).sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      );

      setBuyerInquiries(unique);

      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length === results.length) {
        const reason = failed[0]?.reason;
        setBuyerInquiriesError(
          reason instanceof Error
            ? reason.message
            : "Unable to load seller inquiries.",
        );
      } else if (failed.length > 0) {
        setBuyerInquiriesError(
          "Some seller inquiries could not be loaded. Please refresh.",
        );
      }

      setBuyerInquiriesLoading(false);
    };

    void loadBuyerInquiries();

    return () => {
      cancelled = true;
    };
  }, [
    user?.id,
    user?.role,
    requirements,
    requirementsLoading,
    refreshKey,
  ]);

  useEffect(() => {
    if (!user || user.role !== "seller") {
      setSellerCreditBalance(0);
      setSellerInquiries([]);
      setCreditTransactions([]);
      setSellerDataError("");
      return;
    }

    let cancelled = false;

    const loadSellerProfileData = async () => {
      try {
        setSellerDataError("");

        const [wallet, transactions, inquiries] = await Promise.all([
          getSellerWallet(),
          getSellerWalletTransactions(),
          getSellerInquiriesApi(),
        ]);

        if (cancelled) return;

        setSellerCreditBalance(wallet.balance ?? 0);
        setCreditTransactions(transactions ?? []);
        setSellerInquiries(inquiries ?? []);
      } catch (error) {
        if (!cancelled) {
          setSellerDataError(
            error instanceof Error
              ? error.message
              : "Unable to load seller data.",
          );
        }
      }
    };

    void loadSellerProfileData();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role, refreshKey]);

  useEffect(() => {
    const relevant = user?.role === "seller" ? sellerInquiries : buyerInquiries;
    const ids = Array.from(new Set(relevant.filter(x => x.status === "accepted" || x.status === "completed").map(x => x.requirementId)));
    if (ids.length === 0) return;

    let cancelled = false;
    void Promise.all(ids.map(async id => {
      try { return [id, await getRequirementDeal(id)] as const; }
      catch { return [id, null] as const; }
    })).then(async entries => {
      if (cancelled) return;
      const map = Object.fromEntries(entries);
      setDealByRequirement(prev => ({ ...prev, ...map }));
      const completedDeals = entries.map(x => x[1]).filter((x): x is MarketplaceDeal => !!x && x.status === "completed");
      const reviewChecks = await Promise.all(completedDeals.map(async deal => {
        try {
          const reviews = await getDealReviews(deal.id);
          return reviews.some(review => review.reviewerUserId === user?.id) ? deal.id : null;
        } catch { return null; }
      }));
      if (!cancelled) setReviewedDealIds(new Set(reviewChecks.filter((x): x is string => !!x)));
    });

    return () => { cancelled = true; };
  }, [user?.id, user?.role, sellerInquiries, buyerInquiries, refreshKey]);

  // =====================================================
  // SUCCESS
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
        3500
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [successMessage]);

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const isBuyer =
    user.role === "buyer";

  const isSeller =
    user.role === "seller";

  // =====================================================
  // BUYER
  // =====================================================



  // IMPORTANT COUNTS

  const totalRequirements =
    requirements.length;

  const pendingCount =
    requirements.filter(
      (item) =>
        item.status ===
        "admin_review_required"
    ).length;

  const verifiedCount =
    requirements.filter(
      (item) =>
        item.status ===
        "verified"
    ).length;

  const completedCount =
    requirements.filter(
      (item) =>
        item.status ===
        "completed"
    ).length;

  // =====================================================
  // SELLER
  // =====================================================

  const inquiryDeal = (inquiry: SellerInquiry) => {
    const deal = dealByRequirement[inquiry.requirementId];
    return deal?.inquiryId === inquiry.id ? deal : null;
  };

  const currentRequirements = requirements.filter(item => item.status !== "completed");
  const completedRequirements = requirements.filter(item => item.status === "completed");
  const visibleRequirements = buyerRequirementsTab === "history" ? completedRequirements : currentRequirements;
  const sellerReviewedInquiries = sellerInquiries.filter(inquiry => {
    const deal = inquiryDeal(inquiry);
    return deal?.status === "completed" && reviewedDealIds.has(deal.id);
  });
  const sellerClosedInquiries = sellerInquiries.filter(inquiry => {
    const deal = inquiryDeal(inquiry);
    return !sellerReviewedInquiries.includes(inquiry) && (deal?.status === "completed" || deal?.status === "cancelled" || inquiry.status === "completed");
  });
  const sellerOtherInquiries = sellerInquiries.filter(inquiry => !sellerClosedInquiries.includes(inquiry) && !sellerReviewedInquiries.includes(inquiry) && inquiry.status === "rejected");
  const sellerActiveInquiries = sellerInquiries.filter(inquiry => !sellerClosedInquiries.includes(inquiry) && !sellerReviewedInquiries.includes(inquiry) && !sellerOtherInquiries.includes(inquiry));
  const visibleSellerInquiries = sellerHistoryTab === "closed" ? sellerClosedInquiries : sellerHistoryTab === "reviewed" ? sellerReviewedInquiries : sellerHistoryTab === "other" ? sellerOtherInquiries : sellerActiveInquiries;

  const buyerReviewedInquiries = buyerInquiries.filter(inquiry => {
    const deal = inquiryDeal(inquiry);
    return deal?.status === "completed" && reviewedDealIds.has(deal.id);
  });
  const buyerCurrentInquiries = buyerInquiries.filter(inquiry => !buyerReviewedInquiries.includes(inquiry));
  const visibleBuyerInquiries = buyerInquiryTab === "reviewed" ? buyerReviewedInquiries : buyerCurrentInquiries;

  const creditBalance =
    isSeller
      ? sellerCreditBalance
      : 0;

  const sellerVerified =
    user.sellerVerificationStatus ===
    "verified";

  // =====================================================
  // ACTIONS
  // =====================================================

  const handleLogout =
    () => {
      logoutUser();

      navigate("/");
    };

    const handleSaveRequirementEdit = async (
      updatedRequirement: RequirementDetail,
      newImageFiles: File[],
      deletedImageIds: string[],
    ) => {
      if (!editingRequirement) {
        return;
      }
    
      try {
        const wasVerified =
          editingRequirement.status === "verified";
    
        await updateRequirement(
          editingRequirement.id,
          {
            title: updatedRequirement.title,
            category:
              updatedRequirement.category ?? null,
            subCategory:
              updatedRequirement.subCategory ?? null,
            requirementType:
              updatedRequirement.requirementType,
            budgetMin:
              updatedRequirement.budgetMin ?? null,
            budgetMax:
              updatedRequirement.budgetMax ?? null,
            country:
              updatedRequirement.country ?? null,
            city:
              updatedRequirement.city ?? null,
            area:
              updatedRequirement.area ?? null,
            postalCode:
              updatedRequirement.postalCode ?? null,
    
            fields:
              updatedRequirement.fields.map(
                (field, index) => ({
                  fieldKey: field.fieldKey,
                  label: field.label,
                  value: field.value,
                  isRequired: field.isRequired,
                  sortOrder: index,
                }),
              ),
          },
        );
    
// Upload new images FIRST so backend always
// retains at least one requirement image.
if (newImageFiles.length > 0) {
  await uploadRequirementImages(
    editingRequirement.id,
    newImageFiles,
  );
}

// Delete old images AFTER new images exist.
for (const imageId of deletedImageIds) {
  await deleteRequirementImage(
    editingRequirement.id,
    imageId,
  );
}
    
        setEditingRequirement(null);
    
        setSuccessMessage(
          wasVerified
            ? "Requirement updated and sent for admin review again."
            : "Requirement updated successfully.",
        );
    
        setRefreshKey(
          (value) => value + 1,
        );
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Unable to update requirement.",
        );
      }
    };
  const handleEditRequirement = async (
    requirement: RequirementListItem,
  ) => {
    if (requirement.status === "completed") return;
    try {
      const details =
        await getRequirementDetails(
          requirement.id,
        );
  
      setEditingRequirement(details);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to load requirement.",
      );
    }
  };

  const handleToggleRequirementActivity =
  async (
    requirement: RequirementListItem,
  ) => {
    try {
      const isActive =
        requirement.activityStatus !==
        "inactive";

      await updateRequirementActivity(
        requirement.id,
        isActive
          ? "inactive"
          : "active",
        isActive
          ? "Buyer temporarily paused this requirement."
          : undefined,
      );

      setSuccessMessage(
        isActive
          ? "Requirement is now inactive. Sellers can no longer send new inquiries."
          : "Requirement is active again and can receive seller inquiries.",
      );

      setRefreshKey(
        (value) => value + 1,
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update requirement.",
      );
    }
  };

  const handleCompleteDeal = (inquiry: SellerInquiry) => setDealAction({ action: "request", inquiry });
  const handleSellerCompleteDeal = (inquiry: SellerInquiry) => setDealAction({ action: "confirm", inquiry });
  const handleCancelDeal = (inquiry: SellerInquiry) => {
    if (inquiryDeal(inquiry)?.status === "pending_confirmation") setDealAction({ action: "cancel", inquiry });
  };
  const handleReviewDeal = (inquiry: SellerInquiry) => {
    const deal = inquiryDeal(inquiry);
    if (deal?.status === "completed" && !reviewedDealIds.has(deal.id)) setDealAction({ action: "review", inquiry });
  };

  const submitDealAction = async (values: DealActionValues) => {
    if (!dealAction) return;
    const { action, inquiry } = dealAction;
    const deal = inquiryDeal(inquiry);
    if (action === "request") {
      const response = await startDealCompletion(inquiry.requirementId, inquiry.id);
      setDealByRequirement(prev => ({ ...prev, [inquiry.requirementId]: response.deal }));
      setSuccessMessage("Completion requested. Waiting for the seller to confirm.");
    } else {
      if (!deal) throw new Error("Deal details are unavailable. Refresh your profile and try again.");
      if (action === "review") {
        await createMarketplaceReview(deal.id, values.rating, values.comment);
        setReviewedDealIds(prev => new Set(prev).add(deal.id));
        setSellerHistoryPage(1);
        setSuccessMessage("Review submitted. This deal is now in Review Submitted history.");
      } else {
        const updated = action === "confirm"
          ? await confirmSellerDealCompletion(deal.id)
          : await cancelMarketplaceDeal(deal.id, values.reason);
        setDealByRequirement(prev => ({ ...prev, [inquiry.requirementId]: updated }));
        setSellerHistoryPage(1);
        setSuccessMessage(action === "confirm" ? "Deal completed. You can now leave a review." : "Deal cancelled. Your reason has been saved.");
      }
    }
    setDealAction(null);
    if (action !== "review") setRefreshKey(value => value + 1);
  };

  const handleInquiryAction = async (
    inquiryId: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      if (status === "accepted") {
        await acceptBuyerInquiry(inquiryId);
      } else {
        await rejectBuyerInquiry(inquiryId);
      }

      setSuccessMessage(
        status === "accepted"
          ? "Seller inquiry accepted."
          : "Seller inquiry rejected.",
      );

      setRefreshKey((value) => value + 1);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update seller inquiry.",
      );
    }
  };

  const handleSellerVerification = (
    businessName: string,
    city: string,
    category: string
  ) => {
    verifySellerForDemo(
      user.id,
      businessName,
      city,
      category
    );

    setShowSellerVerification(
      false
    );

    setSuccessMessage(
      "Seller verified successfully."
    );

    setRefreshKey(
      (value) =>
        value + 1
    );

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles
                size={18}
              />
            </div>

            <div className="text-xl font-bold">
              Khoj
              <span className="text-blue-600">
                Market
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
            >
              <LogOut
                size={17}
              />

              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* PROFILE */}

        <div className="rounded-3xl bg-slate-950 p-8 text-white">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-400">
                {isBuyer
                  ? "Buyer Profile"
                  : "Seller Profile"}
              </p>

              <h1 className="mt-2 text-3xl font-black">
                {user.name}
              </h1>

              <p className="mt-3 text-slate-400">
                {user.email}
              </p>

              <p className="mt-1 text-slate-400">
                {user.phone}
              </p>

              {isSeller &&
                sellerVerified &&
                user.businessName && (
                  <div className="mt-5">
                    <p className="flex items-center gap-2 text-sm text-slate-300">
                      <Store
                        size={15}
                      />

                      {
                        user.businessName
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {
                        user.businessCity
                      }

                      {user.businessCategory
                        ? ` • ${user.businessCategory}`
                        : ""}
                    </p>
                  </div>
                )}
            </div>

            {/* BADGES */}

            <div className="flex flex-wrap gap-3">
              {user.phoneVerified ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300">
                  <BadgeCheck
                    size={17}
                  />

                  Phone Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-300">
                  <Clock3
                    size={17}
                  />

                  Phone Pending
                </span>
              )}

              {isSeller &&
                (sellerVerified ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-300">
                    <BadgeCheck
                      size={17}
                    />

                    Verified Seller
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setShowSellerVerification(
                        true
                      )
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Verify Seller
                  </button>
                ))}

              {isSeller && (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-300">
                  <Coins
                    size={17}
                  />

                  {creditBalance} Credits
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            BUYER
        ===================================================== */}

        {isBuyer && (
          <>
<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
<StatCard
  icon={<ShoppingBag />}
  label="Total Requirements"
  value={totalRequirements}
/>

<StatCard
  icon={<Clock3 />}
  label="Pending Admin Review"
  value={pendingCount}
/>

<StatCard
  icon={<CheckCircle2 />}
  label="Verified"
  value={verifiedCount}
/>

<StatCard
  icon={<Box />}
  label="Completed"
  value={completedCount}
/>

<StatCard
  icon={<MessageCircle />}
  label="Seller Inquiries"
  value={buyerInquiries.length}
/>
</div>

            {/* REQUIREMENTS */}
            <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="My requirements">
              {(["current", "history"] as const).map(tab => (
                <button key={tab} type="button" role="tab" aria-selected={buyerRequirementsTab === tab}
                  onClick={() => setBuyerRequirementsTab(tab)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${buyerRequirementsTab === tab ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                >{tab === "current" ? `Current (${currentRequirements.length})` : `History (${completedRequirements.length})`}</button>
              ))}
            </div>

            <HistoryCard
              title={buyerRequirementsTab === "history" ? "Completed Requirements" : "My Requirements"}
              subtitle={buyerRequirementsTab === "history" ? "Completed marketplace requirements" : "Current marketplace requirements"}
            >
              {requirementsLoading ? (
                <div className="py-14 text-center text-sm text-slate-400">
                  Requirements loading...
                </div>
              ) : requirementsError ? (
                <div className="py-14 text-center text-sm font-semibold text-red-500">
                  {requirementsError}
                </div>
              ) : visibleRequirements.length === 0 ? (
                <EmptyHistory text={buyerRequirementsTab === "history" ? "Abhi koi completed requirement nahi hai." : "Abhi koi current requirement nahi hai."} />
              ) : (
                visibleRequirements.map((item) => (
                  <RequirementRow
                    key={item.id}
                    item={item}
                    inquiryCount={
                      item.inquiryCount ?? 0
                    }
                    onEdit={item.status === "completed" ? undefined : () => void handleEditRequirement(item)}
                    onToggleActivity={item.status === "completed" ? undefined : () => void handleToggleRequirementActivity(item)}
                  />
                ))
              )}
            </HistoryCard>

            {/* INQUIRIES */}
            <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Seller inquiries">
              {(["current", "reviewed"] as const).map(tab => <button key={tab} type="button" role="tab" aria-selected={buyerInquiryTab === tab} onClick={() => setBuyerInquiryTab(tab)}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${buyerInquiryTab === tab ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-500"}`}>
                {tab === "current" ? `Offers & Deals (${buyerCurrentInquiries.length})` : `Review Submitted (${buyerReviewedInquiries.length})`}
              </button>)}
            </div>

            <HistoryCard
              title={buyerInquiryTab === "reviewed" ? "Reviewed Deals" : "Seller Inquiries"}
              subtitle="Aapki requirements par sellers ki offers"
            >
              {buyerInquiriesLoading ? (
                <div className="py-14 text-center text-sm text-slate-400">
                  Seller inquiries loading...
                </div>
              ) : buyerInquiriesError && buyerInquiries.length === 0 ? (
                <div className="py-14 text-center text-sm font-semibold text-red-500">
                  {buyerInquiriesError}
                </div>
              ) : visibleBuyerInquiries.length === 0 ? (
                <EmptyHistory
                  text={buyerInquiryTab === "reviewed" ? "Abhi koi review submit nahi hua." : "Abhi koi seller inquiry receive nahi hui."}
                />
              ) : (
                <>
                  {buyerInquiriesError && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                      {buyerInquiriesError}
                    </div>
                  )}

                  {visibleBuyerInquiries.map((inquiry) => (
                    <BuyerInquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      onViewed={async () => {
                        const updated = await markBuyerInquiryViewed(inquiry.id);
                        setBuyerInquiries((items) =>
                          items.map((item) =>
                            item.id === updated.id ? updated : item,
                          ),
                        );
                      }}
                      onAccept={() =>
                        void handleInquiryAction(inquiry.id, "accepted")
                      }
                      onReject={() =>
                        void handleInquiryAction(inquiry.id, "rejected")
                      }
                      deal={inquiryDeal(inquiry)}
                      reviewed={!!inquiryDeal(inquiry) && reviewedDealIds.has(inquiryDeal(inquiry)!.id)}
                      onComplete={() => void handleCompleteDeal(inquiry)}
                      onCancel={() => void handleCancelDeal(inquiry)}
                      onReview={() => void handleReviewDeal(inquiry)}
                    />
                  ))}
                </>
              )}
            </HistoryCard>
          </>
        )}

        {/* =====================================================
            SELLER
        ===================================================== */}

        {isSeller && (
          <>
            {sellerDataError && (
              <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                {sellerDataError}
              </div>
            )}
            {!sellerVerified && (
              <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <h2 className="font-black text-amber-900">
                      Seller Verification Required
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-amber-700">
                      Buyer requirements
                      browse kar sakte hain,
                      lekin inquiry send
                      karne se pehle seller
                      verification required
                      hai.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowSellerVerification(
                        true
                      )
                    }
                    className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Verify Seller
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={
                  <Coins />
                }
                label="Credit Balance"
                value={
                  creditBalance
                }
              />

              <StatCard
                icon={
                  <MessageCircle />
                }
                label="Inquiries Sent"
                value={
                  sellerInquiries.length
                }
              />

              <StatCard
                icon={
                  <CheckCircle2 />
                }
                label="Accepted"
                value={
                  sellerActiveInquiries.filter(item => item.status === "accepted").length
                }
              />

              <StatCard
                icon={<Box />}
                label="Completed"
                value={
                  sellerInquiries.filter(item => inquiryDeal(item)?.status === "completed" || item.status === "completed").length
                }
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Seller activity">
              {([
                ["active", "Active", sellerActiveInquiries.length],
                ["closed", "Closed Deals", sellerClosedInquiries.length],
                ["reviewed", "Review Submitted", sellerReviewedInquiries.length],
                ["other", "Other Inquiries", sellerOtherInquiries.length],
                ["credits", "Credit Transactions", creditTransactions.length],
              ] as const).map(([tab, label, count]) => (
                <button key={tab} type="button" role="tab" aria-selected={sellerHistoryTab === tab}
                  onClick={() => { setSellerHistoryTab(tab); setSellerHistoryPage(1); }}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${sellerHistoryTab === tab ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                >{label} ({count})</button>
              ))}
            </div>

            {sellerHistoryTab !== "credits" ? (
              <HistoryCard
                title={sellerHistoryTab === "closed" ? "Closed Deals" : sellerHistoryTab === "reviewed" ? "Reviewed Deals" : sellerHistoryTab === "other" ? "Other Inquiries" : "Active Inquiries"}
                subtitle={sellerHistoryTab === "closed" ? "Completed aur cancelled deals; completed deals ko yahan rate kar sakte hain" : sellerHistoryTab === "reviewed" ? "Jin deals par aap review submit kar chuke hain" : sellerHistoryTab === "other" ? "Rejected inquiries" : "Buyer requirements par active inquiries"}
              >
                {visibleSellerInquiries.length === 0 ? (
                  <EmptyHistory text="Is tab mein abhi koi inquiry nahi hai." />
                ) : (
                  <>
                    {visibleSellerInquiries
                      .slice(
                        (sellerHistoryPage - 1) * SELLER_HISTORY_PAGE_SIZE,
                        sellerHistoryPage * SELLER_HISTORY_PAGE_SIZE,
                      )
                      .map((inquiry) => (
                        <SellerInquiryCard
                          key={inquiry.id}
                          inquiry={inquiry}
                          deal={inquiryDeal(inquiry)}
                          reviewed={!!inquiryDeal(inquiry) && reviewedDealIds.has(inquiryDeal(inquiry)!.id)}
                          onComplete={() => void handleSellerCompleteDeal(inquiry)}
                          onCancel={() => void handleCancelDeal(inquiry)}
                          onReview={() => void handleReviewDeal(inquiry)}
                        />
                      ))}
                    <SimpleHistoryPagination
                      page={sellerHistoryPage}
                      totalItems={visibleSellerInquiries.length}
                      pageSize={SELLER_HISTORY_PAGE_SIZE}
                      onPageChange={setSellerHistoryPage}
                    />
                  </>
                )}
              </HistoryCard>
            ) : (
              <HistoryCard
                title="Credit Transactions"
                subtitle="Seller wallet ki transaction history"
              >
                {creditTransactions.length === 0 ? (
                  <EmptyHistory text="Abhi koi credit transaction nahi hai." />
                ) : (
                  <>
                    {creditTransactions
                      .slice(
                        (sellerHistoryPage - 1) * SELLER_HISTORY_PAGE_SIZE,
                        sellerHistoryPage * SELLER_HISTORY_PAGE_SIZE,
                      )
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center"
                        >
                          <div>
                            <p className="font-bold">{transaction.description}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <p
                              className={`font-black ${
                                transaction.amount > 0
                                  ? "text-emerald-600"
                                  : "text-red-500"
                              }`}
                            >
                              {transaction.amount > 0 ? "+" : ""}
                              {transaction.amount} Credits
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Balance: {transaction.balanceAfter}
                            </p>
                          </div>
                        </div>
                      ))}
                    <SimpleHistoryPagination
                      page={sellerHistoryPage}
                      totalItems={creditTransactions.length}
                      pageSize={SELLER_HISTORY_PAGE_SIZE}
                      onPageChange={setSellerHistoryPage}
                    />
                  </>
                )}
              </HistoryCard>
            )}
          </>
        )}
      </main>

      {dealAction && <DealActionDialog
        key={`${dealAction.action}-${dealAction.inquiry.id}`}
        action={dealAction.action}
        title={dealAction.inquiry.requirementTitle || inquiryDeal(dealAction.inquiry)?.requirementTitle || "Marketplace requirement"}
        counterpart={isSeller ? "the buyer" : dealAction.inquiry.sellerName || "the seller"}
        onClose={() => setDealAction(null)}
        onSubmit={submitDealAction}
      />}

      {/* EDIT REQUIREMENT */}

      <EditRequirementModal
        open={
          !!editingRequirement
        }
        requirement={
          editingRequirement
        }
        onClose={() =>
          setEditingRequirement(
            null
          )
        }
        onSave={
          handleSaveRequirementEdit
        }
      />

      {/* SELLER VERIFICATION */}

      <SellerVerificationModal
        open={
          showSellerVerification
        }
        onClose={() =>
          setShowSellerVerification(
            false
          )
        }
        onVerify={
          handleSellerVerification
        }
      />

      {/* SUCCESS */}

      {successMessage && (
        <div className="fixed bottom-6 right-6 z-[150] max-w-sm rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          ✓ {successMessage}
        </div>
      )}
    </div>
  );
}

// =====================================================
// REQUIREMENT
// =====================================================

function EditRequirementModal({
  open,
  requirement,
  onClose,
  onSave,
}: {
  open: boolean;
  requirement: RequirementDetail | null;
  onClose: () => void;
  onSave: (
    requirement: RequirementDetail,
    newImageFiles: File[],
    deletedImageIds: string[],
  ) => Promise<void>;
}) {
  const [
    form,
    setForm,
  ] = useState<RequirementDetail | null>(
    null,
  );

  const [
    newImageFiles,
    setNewImageFiles,
  ] = useState<File[]>([]);

  const [
    newImagePreviews,
    setNewImagePreviews,
  ] = useState<string[]>([]);

  const [
    deletedImageIds,
    setDeletedImageIds,
  ] = useState<string[]>([]);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!open || !requirement) {
      return;
    }

    setForm({
      ...requirement,
      fields: requirement.fields.map(
        (field) => ({ ...field }),
      ),
      images: requirement.images.map(
        (image) => ({ ...image }),
      ),
    });

    setNewImageFiles([]);
    setNewImagePreviews([]);
    setDeletedImageIds([]);
    setError("");
  }, [open, requirement]);

  if (!open || !requirement || !form) {
    return null;
  }

  const remainingImages =
    form.images.filter(
      (image) =>
        !deletedImageIds.includes(
          image.id,
        ),
    );

  const totalImageCount =
    remainingImages.length +
    newImageFiles.length;

  const handleFiles = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const availableSlots =
      Math.max(
        0,
        20 - totalImageCount,
      );

    const files =
      Array.from(
        event.target.files ?? [],
      ).slice(
        0,
        availableSlots,
      );

    if (files.length === 0) {
      event.target.value = "";
      return;
    }

    setNewImageFiles(
      (current) => [
        ...current,
        ...files,
      ],
    );

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>(
            (resolve, reject) => {
              const reader =
                new FileReader();

              reader.onload = () => {
                if (
                  typeof reader.result ===
                  "string"
                ) {
                  resolve(reader.result);
                } else {
                  reject();
                }
              };

              reader.onerror = () =>
                reject();

              reader.readAsDataURL(file);
            },
          ),
      ),
    )
      .then((previews) => {
        setNewImagePreviews(
          (current) => [
            ...current,
            ...previews,
          ],
        );
      })
      .catch(() => {
        setError(
          "Image preview could not be generated.",
        );
      });

    event.target.value = "";
  };

  const removeExistingImage = (
    imageId: string,
  ) => {
    setDeletedImageIds(
      (current) => [
        ...current,
        imageId,
      ],
    );
  
    setError("");
  };

  const removeNewImage = (
    index: number,
  ) => {
    setNewImageFiles(
      (current) =>
        current.filter(
          (_, imageIndex) =>
            imageIndex !== index,
        ),
    );
  
    setNewImagePreviews(
      (current) =>
        current.filter(
          (_, imageIndex) =>
            imageIndex !== index,
        ),
    );
  
    setError("");
  };

  const updateField = (
    index: number,
    value: string,
  ) => {
    setForm(
      (current) => {
        if (!current) {
          return current;
        }

        const fields =
          current.fields.map(
            (field, fieldIndex) =>
              fieldIndex === index
                ? {
                    ...field,
                    value,
                  }
                : field,
          );

        return {
          ...current,
          fields,
        };
      },
    );
  };

  const submit = async () => {
    if (!form.title.trim()) {
      setError(
        "Title is required.",
      );
      return;
    }

    if (totalImageCount === 0) {
      setError(
        "At least one image is required.",
      );
      return;
    }

    const missingRequiredField =
      form.fields.find(
        (field) =>
          field.isRequired &&
          !field.value.trim(),
      );

    if (missingRequiredField) {
      setError(
        `${missingRequiredField.label} is required.`,
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSave(
        form,
        newImageFiles,
        deletedImageIds,
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save requirement.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">
              Edit Requirement
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your requirement information and images.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-bold">
            Title *
          </label>

          <input
            value={form.title}
            onChange={(event) =>
              setForm({
                ...form,
                title:
                  event.target.value,
              })
            }
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {form.fields.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-black">
              Requirement Details
            </h3>

            {form.fields.map(
              (field, index) => (
                <div key={field.id}>
                  <label className="mb-2 block text-sm font-bold">
                    {field.label}

                    {field.isRequired && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}
                  </label>

                  <input
                    value={field.value}
                    onChange={(event) =>
                      updateField(
                        index,
                        event.target.value,
                      )
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              ),
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black">
              Images *
            </h3>

            <span className="text-xs text-slate-400">
              {totalImageCount}/20
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">

            {remainingImages.map(
              (image) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-2xl border border-slate-200"
                >
                  <img
                    src={
                      getRequirementImageUrl(
                        image.filePath,
                      )
                    }
                    alt="Requirement"
                    className="h-32 w-full object-cover"
                  />

                  {image.isCover && (
                    <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-white">
                      Cover
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      removeExistingImage(
                        image.id,
                      )
                    }
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow"
                  >
                    <X size={14} />
                  </button>
                </div>
              ),
            )}

            {newImagePreviews.map(
              (preview, index) => (
                <div
                  key={`${index}-${preview.slice(
                    0,
                    20,
                  )}`}
                  className="relative overflow-hidden rounded-2xl border border-blue-200"
                >
                  <img
                    src={preview}
                    alt="New requirement"
                    className="h-32 w-full object-cover"
                  />

                  <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
                    New
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeNewImage(index)
                    }
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow"
                  >
                    <X size={14} />
                  </button>
                </div>
              ),
            )}
          </div>

          {totalImageCount < 20 && (
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-600">
              Add Images

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                onChange={handleFiles}
                className="hidden"
              />
            </label>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {requirement.status ===
          "verified" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
            Verified requirement edit karne ke baad dobara admin review mein jayegi.
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              void submit()
            }
            disabled={saving}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
function RequirementRow({
  item,
  inquiryCount,
  onEdit,
  onToggleActivity,
}: {
  item: RequirementListItem;

  inquiryCount: number;

  onEdit?:
    () => void;

  onToggleActivity?:
    () => void;
}) {
  const pending =
    [
      "phone_verification_pending",
      "phone_verified",
      "ai_verification_pending",
      "admin_review_required",
    ].includes(
      item.status
    );

  const isVerified =
    item.status ===
    "verified";

  const isActive =
    item.activityStatus !==
    "inactive";

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">
              {item.title}
            </p>

            {pending && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                Pending Admin Review
              </span>
            )}

            {isVerified && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                Verified Requirement
              </span>
            )}

            {isVerified && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {isActive
                  ? "ACTIVE"
                  : "INACTIVE"}
              </span>
            )}

            {item.status ===
              "completed" && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                Completed
              </span>
            )}
          </div>

          <p className="mt-2 text-xs font-semibold text-slate-400">
            {item.referenceNo}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {item.category}

            {item.subCategory
              ? ` • ${item.subCategory}`
              : ""}
          </p>

          {(item.city || item.country) && (
            <p className="mt-1 text-sm text-slate-500">
              {[item.city, item.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <MessageCircle
              size={16}
            />

            {inquiryCount}{" "}
            {inquiryCount ===
            1
              ? "Query Submitted"
              : "Queries Submitted"}
          </div>

          {isVerified &&
            !isActive && (
              <p className="mt-3 text-xs text-slate-400">
                Requirement public rahegi, lekin sellers new inquiry send nahi kar sakte.
              </p>
            )}
        </div>

        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={
                onEdit
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <Pencil
                size={15}
              />

              Edit
            </button>
          )}

          {isVerified && (
            <>
              <Link
                to="/find"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
              >
                View Public Post
              </Link>

              {onToggleActivity && (
                <button
                  type="button"
                  onClick={
                    onToggleActivity
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {isActive
                    ? "Make Inactive"
                    : "Make Active"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// BUYER INQUIRY
// =====================================================

function BuyerInquiryCard({
  inquiry,
  onViewed,
  onAccept,
  onReject,
  onComplete,
  deal,
  reviewed,
  onCancel,
  onReview,
}: {
  inquiry:
    SellerInquiry;

  onViewed: () => Promise<void>;

  onAccept: () => void;

  onReject: () => void;

  onComplete: () => void;
  deal?: MarketplaceDeal | null;
  reviewed: boolean;
  onCancel: () => void;
  onReview: () => void;
}) {
  useEffect(() => {
    if (inquiry.status !== "sent") return;

    void onViewed().catch(() => {
      // Keep the inquiry actionable if marking it viewed fails.
    });
  }, [inquiry.id, inquiry.status]);

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col justify-between gap-5 md:flex-row">
        <div>
          <p className="font-black">
            {
              inquiry.sellerName
            }
          </p>

          <DealCardSummary inquiry={inquiry} deal={deal} reviewed={reviewed} />

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {inquiry.message}
          </p>

          {inquiry.status ===
            "accepted" && (
            <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
              <strong>
                Seller Contact
              </strong>

              <br />

              {
                inquiry.sellerPhone
              }

              <br />

              {
                inquiry.sellerEmail
              }
            </div>
          )}
        </div>

        {(inquiry.status === "accepted" || inquiry.status === "completed") && (
          <div className="flex h-fit flex-wrap gap-2">
            {!deal && inquiry.status === "accepted" && (
              <button type="button" onClick={onComplete} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
                Request Completion
              </button>
            )}
            {deal?.status === "pending_confirmation" && (
              <>
                <span className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700">Waiting for Seller</span>
                <button type="button" onClick={onCancel} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600">Cancel Deal</button>
              </>
            )}
            {deal?.status === "completed" && (
              reviewed
                ? <span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">Review Submitted</span>
                : <button type="button" onClick={onReview} className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white">Rate Seller</button>
            )}
            {deal?.status === "cancelled" && (
              <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600">Deal Cancelled</span>
            )}
          </div>
        )}

                {(inquiry.status === "sent" ||
          inquiry.status === "viewed") && (
          <div className="flex gap-2">
            <button
              onClick={
                onAccept
              }
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Accept
            </button>

            <button
              onClick={
                onReject
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// SELLER INQUIRY
// =====================================================

function SellerInquiryCard({
  inquiry,
  onComplete,
  deal,
  reviewed,
  onCancel,
  onReview,
}: {
  inquiry: SellerInquiry;
  onComplete: () => void;
  deal?: MarketplaceDeal | null;
  reviewed: boolean;
  onCancel: () => void;
  onReview: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col justify-between gap-5 md:flex-row">
        <div>
          <DealCardSummary inquiry={inquiry} deal={deal} reviewed={reviewed} />

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {inquiry.message}
          </p>

          {inquiry.creditCost != null && <p className="mt-2 text-xs text-slate-400">Cost: {inquiry.creditCost} credits</p>}
          {inquiry.status === "accepted" && !deal && <p className="mt-3 text-sm text-slate-500">Offer accepted. Completion confirmation will be available when the buyer sends a request.</p>}
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          {inquiry.status === "accepted" && deal?.status === "pending_confirmation" && (
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={onComplete} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">Confirm Completion</button>
              <button type="button" onClick={onCancel} className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600">Cancel Deal</button>
            </div>
          )}
          {deal?.status === "completed" && (
            reviewed
              ? <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Review Submitted</span>
              : <button type="button" onClick={onReview} className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white">Rate Buyer</button>
          )}
          {deal?.status === "cancelled" && (
            <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">Cancelled</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DealCardSummary({ inquiry, deal, reviewed }: { inquiry: SellerInquiry; deal?: MarketplaceDeal | null; reviewed: boolean }) {
  const completed = deal?.status === "completed" || inquiry.status === "completed";
  const cancelled = deal?.status === "cancelled";
  const pending = deal?.status === "pending_confirmation";
  const accepted = inquiry.status === "accepted" || completed || pending || cancelled;
  const label = reviewed ? "Review submitted" : cancelled ? "Cancelled" : completed ? "Completed · review pending" : pending ? "Waiting for seller confirmation" : inquiry.status === "accepted" ? "Offer accepted" : inquiry.status === "viewed" ? "Viewed by buyer" : inquiry.status === "rejected" ? "Offer declined" : "Inquiry sent";
  const tone = cancelled || inquiry.status === "rejected" ? "bg-slate-100 text-slate-600" : completed ? "bg-emerald-50 text-emerald-700" : pending ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";
  const price = Number(inquiry.offeredPrice);
  const steps = ["Accepted", "Completion requested", "Completed", "Reviewed"];
  const stage = reviewed ? 4 : completed ? 3 : pending ? 2 : accepted ? 1 : 0;
  return <div className="mt-3">
    <p className="text-base font-black text-slate-900">{inquiry.requirementTitle || deal?.requirementTitle || "Marketplace requirement"}</p>
    {(inquiry.requirementReferenceNo || deal?.requirementReferenceNo) && <p className="mt-1 text-xs font-semibold text-slate-400">{inquiry.requirementReferenceNo || deal?.requirementReferenceNo}</p>}
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${tone}`}>{label}</span>
      {inquiry.offeredPrice != null && inquiry.offeredPrice !== "" && <span className="text-sm font-black text-blue-700">Offer: {Number.isFinite(price) ? new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(price) : inquiry.offeredPrice}</span>}
    </div>
    {accepted && !cancelled && <ol aria-label="Deal progress" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{steps.map((step, index) => <li key={step} className={`rounded-lg border px-2 py-2 text-[11px] font-semibold ${index < stage ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-400"}`}>{index < stage ? "✓" : index + 1} {step}</li>)}</ol>}
    {cancelled && deal?.cancellationReason && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><span className="font-bold">Cancellation reason: </span>{deal.cancellationReason}</p>}
    <p className="mt-3 text-xs text-slate-400">Sent {new Date(inquiry.createdAt).toLocaleDateString()}{deal?.completedAt ? ` · Completed ${new Date(deal.completedAt).toLocaleDateString()}` : ""}</p>
  </div>;
}

// =====================================================
// COMMON
// =====================================================

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;

  label: string;

  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <p className="mt-5 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}

function HistoryCard({
  title,
  subtitle,
  children,
}: {
  title: string;

  subtitle: string;

  children: ReactNode;
}) {
  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-7">
      <h2 className="text-xl font-black">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {subtitle}
      </p>

      <div className="mt-6 space-y-3">
        {children}
      </div>
    </div>
  );
}

function EmptyHistory({
  text,
}: {
  text: string;
}) {
  return (
    <div className="py-14 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

function SimpleHistoryPagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold text-slate-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

