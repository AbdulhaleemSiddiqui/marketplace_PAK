import {
  BadgeCheck,
  Box,
  CheckCircle2,
  Clock3,
  Coins,
  LogOut,
  MessageCircle,
  PhoneCall,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import {
  markRequirementActive,
  markRequirementInactive,
} from "../services/requirementService";


import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AiVerificationModal from "../components/buyer/AiVerificationModal";
import SellerVerificationModal from "../components/seller/SellerVerificationModal";

import {
  getCurrentUser,
  logoutUser,
  verifySellerForDemo,
} from "../services/authService";

import {
  getCreditBalance,
  getCreditTransactionsByUser,
} from "../services/creditService";

import {
  getBuyerInquiries,
  getSellerInquiries,
  updateInquiryStatus,
} from "../services/inquiryService";

import {
  getBuyerRequirementsByUser,
  markRequirementVerified,
} from "../services/requirementService";

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
    verificationRequirement,
    setVerificationRequirement,
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

  const requirements =
    isBuyer
      ? getBuyerRequirementsByUser(
          user.id
        )
      : [];

  const buyerInquiries =
    isBuyer
      ? getBuyerInquiries(
          user.id
        )
      : [];

  // IMPORTANT COUNTS

  const totalRequirements =
    requirements.length;

  const pendingCount =
    requirements.filter(
      (item) =>
        [
          "phone_verification_pending",
          "phone_verified",
          "ai_verification_pending",
          "admin_review_required",
        ].includes(
          item.status
        )
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

  const sellerInquiries =
    isSeller
      ? getSellerInquiries(
          user.id
        )
      : [];

  const creditBalance =
    isSeller
      ? getCreditBalance(
          user.id
        )
      : 0;

  const creditTransactions =
    isSeller
      ? getCreditTransactionsByUser(
          user.id
        )
      : [];

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

  const handleConfirmVerification =
    () => {
      if (
        !verificationRequirement
      ) {
        return;
      }

      markRequirementVerified(
        verificationRequirement.id
      );

      setVerificationRequirement(
        null
      );

      setSuccessMessage(
        "Requirement verified and published successfully."
      );

      setRefreshKey(
        (value) =>
          value + 1
      );
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

  const handleInquiryAction = (
    inquiryId: string,
    status:
      | "accepted"
      | "rejected"
  ) => {
    updateInquiryStatus(
      inquiryId,
      status
    );

    setSuccessMessage(
      status === "accepted"
        ? "Seller inquiry accepted."
        : "Seller inquiry rejected."
    );

    setRefreshKey(
      (value) =>
        value + 1
    );
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
  label="Verification Pending"
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
              {requirements.length ===
              0 ? (
                <EmptyHistory
                  text="Abhi koi buyer requirement nahi hai."
                />
              ) : (
                requirements.map(
                  (item) => (
                    <RequirementRow
                      key={
                        item.id
                      }
                      item={
                        item
                      }
                      inquiryCount={
                        buyerInquiries.filter(
                          (inquiry) =>
                            inquiry.requirementId ===
                            item.id
                        ).length
                      }
                      onStartVerification={() =>
                        setVerificationRequirement(
                          item
                        )
                      }
                      onToggleActivity={() =>
                        handleToggleRequirementActivity(
                          item
                        )
                      }
                    />
                  )
                )
              )}
            </HistoryCard>

            {/* INQUIRIES */}

            <HistoryCard
              title="Seller Inquiries"
              subtitle="Aapki requirements par sellers ki offers"
            >
              {buyerInquiries.length ===
              0 ? (
                <EmptyHistory
                  text="Abhi koi seller inquiry receive nahi hui."
                />
              ) : (
                buyerInquiries.map(
                  (inquiry) => (
                    <BuyerInquiryCard
                      key={
                        inquiry.id
                      }
                      inquiry={
                        inquiry
                      }
                      onAccept={() =>
                        handleInquiryAction(
                          inquiry.id,
                          "accepted"
                        )
                      }
                      onReject={() =>
                        handleInquiryAction(
                          inquiry.id,
                          "rejected"
                        )
                      }
                    />
                  )
                )
              )}
            </HistoryCard>
          </>
        )}

        {/* =====================================================
            SELLER
        ===================================================== */}

        {isSeller && (
          <>
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

      {/* BUYER VERIFICATION */}

      <AiVerificationModal
        open={
          !!verificationRequirement
        }
        requirement={
          verificationRequirement
        }
        onClose={() =>
          setVerificationRequirement(
            null
          )
        }
        onConfirm={
          handleConfirmVerification
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

function RequirementRow({
  item,
  inquiryCount,
  onStartVerification,
  onToggleActivity,
}: {
  item:
    SavedBuyerRequirement;

  inquiryCount: number;

  onStartVerification:
    () => void;

  onToggleActivity:
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
                Verification Pending
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

          <p className="mt-2 text-sm text-slate-500">
            {item.category}

            {item.subCategory
              ? ` • ${item.subCategory}`
              : ""}
          </p>

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
          {item.status ===
            "ai_verification_pending" && (
            <button
              type="button"
              onClick={
                onStartVerification
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <PhoneCall
                size={16}
              />

              Start Verification
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