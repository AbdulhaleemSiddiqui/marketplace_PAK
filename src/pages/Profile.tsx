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
  markRequirementActive,
  markRequirementInactive,
} from "../services/requirementService";


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
  getBuyerRequirementsByUser,
  updateBuyerRequirementContent,
} from "../services/requirementService";

import {
  getMyRequirements,
  type RequirementListItem,
} from "../services/requirementApiService";

import type {
  SavedBuyerRequirement,
  SellerInquiry,
} from "../types/marketplace";

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

  const [buyerInquiries, setBuyerInquiries] = useState<SellerInquiry[]>([]);
  const [buyerInquiriesLoading, setBuyerInquiriesLoading] = useState(false);
  const [buyerInquiriesError, setBuyerInquiriesError] = useState("");


  const [sellerCreditBalance, setSellerCreditBalance] = useState(0);
  const [sellerInquiries, setSellerInquiries] = useState<SellerInquiry[]>([]);
  const [creditTransactions, setCreditTransactions] =
    useState<SellerWalletTransaction[]>([]);
  const [sellerDataError, setSellerDataError] = useState("");


  const [
    editingRequirement,
    setEditingRequirement,
  ] =
    useState<SavedBuyerRequirement | null>(
      null
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

  const legacyRequirements =
    isBuyer
      ? getBuyerRequirementsByUser(
          user.id
        )
      : [];

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

  const handleSaveRequirementEdit = (
    details: string,
    images: string[]
  ) => {
    if (!editingRequirement) {
      return;
    }

    try {
      const wasVerified =
        editingRequirement.status ===
        "verified";

      updateBuyerRequirementContent(
        editingRequirement.id,
        user.id,
        details,
        images
      );

      setEditingRequirement(
        null
      );

      setSuccessMessage(
        wasVerified
          ? "Requirement updated and sent for admin review again."
          : "Requirement updated successfully."
      );

      setRefreshKey(
        (value) =>
          value + 1
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update requirement."
      );
    }
  };

  const handleToggleRequirementActivity = (
    requirement: SavedBuyerRequirement
  ) => {
    try {
      const isActive =
        requirement.activityStatus !== "inactive";

      if (isActive) {
        markRequirementInactive(
          requirement.id,
          user.id
        );

        setSuccessMessage(
          "Requirement is now inactive. Sellers can no longer send new inquiries."
        );
      } else {
        markRequirementActive(
          requirement.id,
          user.id
        );

        setSuccessMessage(
          "Requirement is active again and can receive seller inquiries."
        );
      }

      setRefreshKey(
        (value) =>
          value + 1
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update requirement."
      );
    }
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
            <Link
              to="/find"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
            >
              Find
            </Link>

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

            <HistoryCard
              title="My Requirements"
              subtitle="Aapki buyer requirement history"
            >
              {requirementsLoading ? (
                <div className="py-14 text-center text-sm text-slate-400">
                  Requirements loading...
                </div>
              ) : requirementsError ? (
                <div className="py-14 text-center text-sm font-semibold text-red-500">
                  {requirementsError}
                </div>
              ) : requirements.length === 0 ? (
                <EmptyHistory
                  text="Abhi koi buyer requirement nahi hai."
                />
              ) : (
                requirements.map((item) => {
                  const legacyItem =
                    legacyRequirements.find(
                      (legacy) =>
                        legacy.id === item.id
                    );

                  return (
                    <RequirementRow
                      key={item.id}
                      item={item}
                      inquiryCount={
                        item.inquiryCount ?? 0
                      }
                      onEdit={
                        legacyItem
                          ? () =>
                              setEditingRequirement(
                                legacyItem
                              )
                          : undefined
                      }
                      onToggleActivity={
                        legacyItem
                          ? () =>
                              handleToggleRequirementActivity(
                                legacyItem
                              )
                          : undefined
                      }
                    />
                  );
                })
              )}
            </HistoryCard>

            {/* INQUIRIES */}

            <HistoryCard
              title="Seller Inquiries"
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
              ) : buyerInquiries.length === 0 ? (
                <EmptyHistory
                  text="Abhi koi seller inquiry receive nahi hui."
                />
              ) : (
                <>
                  {buyerInquiriesError && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                      {buyerInquiriesError}
                    </div>
                  )}

                  {buyerInquiries.map((inquiry) => (
                    <BuyerInquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      onAccept={() =>
                        void handleInquiryAction(inquiry.id, "accepted")
                      }
                      onReject={() =>
                        void handleInquiryAction(inquiry.id, "rejected")
                      }
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
                  sellerInquiries.filter(
                    (item) =>
                      item.status ===
                      "accepted"
                  ).length
                }
              />

              <StatCard
                icon={<Box />}
                label="Completed"
                value={
                  sellerInquiries.filter(
                    (item) =>
                      item.status ===
                      "completed"
                  ).length
                }
              />
            </div>

            <div className="mt-8">
              <Link
                to="/find"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-blue-600"
              >
                <ShoppingBag
                  size={17}
                />

                Find Buyer Requirements
              </Link>
            </div>

            <HistoryCard
              title="My Sent Inquiries"
              subtitle="Buyer requirements par bheji hui inquiries"
            >
              {sellerInquiries.length ===
              0 ? (
                <EmptyHistory
                  text="Abhi koi inquiry send nahi ki."
                />
              ) : (
                sellerInquiries.map(
                  (inquiry) => (
                    <SellerInquiryCard
                      key={
                        inquiry.id
                      }
                      inquiry={
                        inquiry
                      }
                    />
                  )
                )
              )}
            </HistoryCard>

            <HistoryCard
              title="Credit Transactions"
              subtitle="Seller wallet ki transaction history"
            >
              {creditTransactions.length ===
              0 ? (
                <EmptyHistory
                  text="Abhi koi credit transaction nahi hai."
                />
              ) : (
                creditTransactions.map(
                  (transaction) => (
                    <div
                      key={
                        transaction.id
                      }
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-bold">
                          {
                            transaction.description
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            transaction.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p
                          className={`font-black ${
                            transaction.amount >
                            0
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {transaction.amount >
                          0
                            ? "+"
                            : ""}

                          {
                            transaction.amount
                          }{" "}
                          Credits
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Balance:{" "}
                          {
                            transaction.balanceAfter
                          }
                        </p>
                      </div>
                    </div>
                  )
                )
              )}
            </HistoryCard>
          </>
        )}
      </main>

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
  requirement:
    SavedBuyerRequirement | null;
  onClose: () => void;
  onSave: (
    details: string,
    images: string[]
  ) => void;
}) {
  const [
    details,
    setDetails,
  ] = useState("");

  const [
    images,
    setImages,
  ] =
    useState<string[]>([]);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (
      !open ||
      !requirement
    ) {
      return;
    }

    const detailField =
      requirement.fields.find(
        (field) => {
          const id =
            field.id
              .trim()
              .toLowerCase();

          return (
            id === "details" ||
            id === "detail" ||
            id === "description"
          );
        }
      );

    const fallbackDetails =
      requirement.fields
        .filter(
          (field) =>
            !field.id
              .trim()
              .toLowerCase()
              .startsWith(
                "image"
              ) &&
            field.value
        )
        .slice(0, 5)
        .map(
          (field) =>
            `${field.label}: ${field.value}`
        )
        .join("\n");

    const existingImages =
      requirement.fields
        .filter(
          (field) =>
            field.id
              .trim()
              .toLowerCase()
              .startsWith(
                "image"
              ) &&
            Boolean(
              field.value
            )
        )
        .map(
          (field) =>
            field.value
        )
        .slice(0, 5);

    setDetails(
      detailField?.value ??
      fallbackDetails
    );

    setImages(
      existingImages
    );

    setError("");
  }, [
    open,
    requirement,
  ]);

  if (
    !open ||
    !requirement
  ) {
    return null;
  }

  const handleFiles = (
    event:
      ChangeEvent<HTMLInputElement>
  ) => {
    const files =
      Array.from(
        event.target.files ??
        []
      ).slice(
        0,
        Math.max(
          0,
          5 - images.length
        )
      );

    if (
      files.length === 0
    ) {
      return;
    }

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>(
            (
              resolve,
              reject
            ) => {
              const reader =
                new FileReader();

              reader.onload =
                () =>
                  resolve(
                    String(
                      reader.result ??
                      ""
                    )
                  );

              reader.onerror =
                () =>
                  reject(
                    new Error(
                      "Image could not be read."
                    )
                  );

              reader.readAsDataURL(
                file
              );
            }
          )
      )
    )
      .then(
        (
          uploadedImages
        ) => {
          setImages(
            (
              current
            ) => [
              ...current,
              ...uploadedImages,
            ].slice(
              0,
              5
            )
          );

          setError("");
        }
      )
      .catch(() =>
        setError(
          "Image upload failed."
        )
      );

    event.target.value =
      "";
  };

  const submit = () => {
    const cleanDetails =
      details.trim();

    if (!cleanDetails) {
      setError(
        "Details are required."
      );

      return;
    }

    if (
      images.length === 0
    ) {
      setError(
        "At least one image is required."
      );

      return;
    }

    onSave(
      cleanDetails,
      images
    );
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">
              Edit Requirement
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sirf details aur images edit hongi. Dono required hain.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-bold">
            Details
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <textarea
            rows={7}
            value={
              details
            }
            onChange={(
              event
            ) =>
              setDetails(
                event.target.value
              )
            }
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Requirement details..."
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-bold">
              Images
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <span className="text-xs text-slate-400">
              {images.length}/5
            </span>
          </div>

          {images.length >
            0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map(
                (
                  image,
                  index
                ) => (
                  <div
                    key={`${index}-${image.slice(0, 30)}`}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={
                        image
                      }
                      alt={`Requirement ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />

                    {index ===
                      0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-white">
                        Cover
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setImages(
                          (
                            current
                          ) =>
                            current.filter(
                              (
                                _,
                                imageIndex
                              ) =>
                                imageIndex !==
                                index
                            )
                        )
                      }
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow"
                    >
                      <X
                        size={14}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {images.length <
            5 && (
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700">
              Add Images

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleFiles
                }
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
            onClick={
              onClose
            }
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              submit
            }
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            Save Changes
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
  onAccept,
  onReject,
}: {
  inquiry:
    SellerInquiry;

  onAccept: () => void;

  onReject: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col justify-between gap-5 md:flex-row">
        <div>
          <p className="font-black">
            {
              inquiry.sellerName
            }
          </p>

          <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">
            {inquiry.status}
          </span>

          {inquiry.offeredPrice && (
            <p className="mt-3 font-bold text-blue-600">
              Offer:{" "}
              {
                inquiry.offeredPrice
              }
            </p>
          )}

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

        {inquiry.status ===
          "sent" && (
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
}: {
  inquiry:
    SellerInquiry;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex justify-between gap-4">
        <div>
          {inquiry.offeredPrice && (
            <p className="font-bold text-blue-600">
              {
                inquiry.offeredPrice
              }
            </p>
          )}

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {inquiry.message}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Cost:{" "}
            {
              inquiry.creditCost
            }{" "}
            Credits
          </p>
        </div>

        <span className="h-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize">
          {inquiry.status}
        </span>
      </div>
    </div>
  );
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