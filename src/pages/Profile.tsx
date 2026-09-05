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
    useState,
    type ReactNode,
  } from "react";
  
  import {
    Link,
    Navigate,
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
    markRequirementCompleted,
    markRequirementVerified,
  } from "../services/requirementService";
  
  import type {
    SavedBuyerRequirement,
    SellerInquiry,
  } from "../types/marketplace";
  
  // =====================================================
  // PROFILE PAGE
  // =====================================================
  
  export default function Profile() {
    const navigate =
      useNavigate();
  
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
  
    const [
      successMessage,
      setSuccessMessage,
    ] = useState("");
  
    // refresh after localStorage changes
    void refreshKey;
  
    const user =
      getCurrentUser();
  
    // =====================================================
    // NOT LOGGED IN
    // =====================================================
  
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
    // BUYER DATA
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
  
    const pendingCount =
      requirements.filter(
        (item) =>
          item.status ===
          "ai_verification_pending"
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
    // SELLER DATA
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
    // LOGOUT
    // =====================================================
  
    const handleLogout = () => {
      logoutUser();
  
      navigate("/");
    };
  
    // =====================================================
    // BUYER AI VERIFICATION
    // =====================================================
  
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
          (value) => value + 1
        );
      };
  
    // =====================================================
    // COMPLETE REQUIREMENT
    // =====================================================
  
    const handleCompleteRequirement = (
      requirementId: string
    ) => {
      markRequirementCompleted(
        requirementId
      );
  
      setSuccessMessage(
        "Requirement marked as completed."
      );
  
      setRefreshKey(
        (value) => value + 1
      );
    };
  
    // =====================================================
    // INQUIRY ACTION
    // =====================================================
  
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
        (value) => value + 1
      );
    };
  
    // =====================================================
    // SELLER VERIFY
    // =====================================================
  
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
        (value) => value + 1
      );
  
      // current user localStorage update hua hai.
      // Simple demo refresh:
      window.location.reload();
    };
  
    // =====================================================
    // UI
    // =====================================================
  
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
                className="hidden rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:block"
              >
                Find
              </Link>
  
              <button
                type="button"
                onClick={
                  handleLogout
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <LogOut
                  size={17}
                />
  
                Logout
              </button>
            </div>
          </div>
        </header>
  
        {/* MAIN */}
  
        <main className="mx-auto max-w-7xl px-6 py-10">
          {/* PROFILE HEADER */}
  
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
  
                {/* SELLER BUSINESS INFO */}
  
                {isSeller &&
                  sellerVerified && (
                    <div className="mt-5">
                      {user.businessName && (
                        <p className="flex items-center gap-2 text-sm text-slate-300">
                          <Store
                            size={15}
                          />
  
                          {
                            user.businessName
                          }
                        </p>
                      )}
  
                      {user.businessCity && (
                        <p className="mt-1 text-sm text-slate-400">
                          {
                            user.businessCity
                          }
  
                          {user.businessCategory
                            ? ` • ${user.businessCategory}`
                            : ""}
                        </p>
                      )}
                    </div>
                  )}
              </div>
  
              {/* BADGES */}
  
              <div className="flex flex-wrap items-center gap-3">
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
  
                {/* SELLER VERIFICATION */}
  
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
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      Verify Seller
                    </button>
                  ))}
  
                {/* SELLER CREDITS */}
  
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
              {/* BUYER STATS */}
  
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={
                    <ShoppingBag />
                  }
                  label="Total Requirements"
                  value={
                    requirements.length
                  }
                />
  
                <StatCard
                  icon={<Clock3 />}
                  label="Verification Pending"
                  value={
                    pendingCount
                  }
                />
  
                <StatCard
                  icon={
                    <CheckCircle2 />
                  }
                  label="Verified"
                  value={
                    verifiedCount
                  }
                />
  
                <StatCard
                  icon={
                    <MessageCircle />
                  }
                  label="Seller Inquiries"
                  value={
                    buyerInquiries.length
                  }
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
                        item={item}
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
                        onComplete={() =>
                          handleCompleteRequirement(
                            item.id
                          )
                        }
                      />
                    )
                  )
                )}
              </HistoryCard>
  
              {/* BUYER INQUIRIES */}
  
              <HistoryCard
                title="Seller Inquiries"
                subtitle="Sellers ki offers jo aapki requirements ke against aayi hain"
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
              {/* SELLER VERIFICATION WARNING */}
  
              {!sellerVerified && (
                <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div>
                      <h2 className="font-black text-amber-900">
                        Seller Verification Required
                      </h2>
  
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-700">
                        Buyer requirements
                        browse kar sakte hain,
                        lekin inquiry send
                        karne ke liye seller
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
                      className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Verify Seller
                    </button>
                  </div>
                </div>
              )}
  
              {/* SELLER STATS */}
  
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={<Coins />}
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
  
              {/* FIND CTA */}
  
              <div className="mt-8">
                <Link
                  to="/find"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-600"
                >
                  <ShoppingBag
                    size={17}
                  />
  
                  Find Buyer Requirements
                </Link>
              </div>
  
              {/* SENT INQUIRIES */}
  
              <HistoryCard
                title="My Sent Inquiries"
                subtitle="Buyer requirements ke against bheji hui inquiries"
              >
                {sellerInquiries.length ===
                0 ? (
                  <EmptyHistory
                    text="Abhi aapne koi inquiry send nahi ki."
                  />
                ) : (
                  sellerInquiries.map(
                    (item) => (
                      <SellerInquiryCard
                        key={
                          item.id
                        }
                        inquiry={
                          item
                        }
                      />
                    )
                  )
                )}
              </HistoryCard>
  
              {/* CREDIT HISTORY */}
  
              <HistoryCard
                title="Credit Transactions"
                subtitle="Seller wallet ki credit history"
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
                          <p className="font-bold text-slate-900">
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
  
                        <div className="text-left sm:text-right">
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
  
        {/* BUYER AI VERIFICATION */}
  
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
            {successMessage}
          </div>
        )}
      </div>
    );
  }
  
  // =====================================================
  // REQUIREMENT ROW
  // =====================================================
  
  function RequirementRow({
    item,
    inquiryCount,
    onStartVerification,
    onComplete,
  }: {
    item: SavedBuyerRequirement;
  
    inquiryCount: number;
  
    onStartVerification: () => void;
  
    onComplete: () => void;
  }) {
    const isPending =
      item.status ===
      "ai_verification_pending";
  
    const isVerified =
      item.status ===
      "verified";
  
    const isCompleted =
      item.status ===
      "completed";
  
    return (
      <div className="rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-slate-900">
                {item.title}
              </p>
  
              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <BadgeCheck
                    size={13}
                  />
  
                  Verified Requirement
                </span>
              )}
  
              {isCompleted && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  Completed
                </span>
              )}
            </div>
  
            <p className="mt-1 text-sm text-slate-500">
              {item.category}
  
              {item.subCategory
                ? ` • ${item.subCategory}`
                : ""}
            </p>
  
            {inquiryCount > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                <MessageCircle
                  size={15}
                />
  
                {inquiryCount} Seller
                Inquiries
              </p>
            )}
          </div>
  
          <div className="flex flex-wrap gap-2">
            {isPending && (
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
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  View Public Post
                </Link>
  
                <button
                  type="button"
                  onClick={
                    onComplete
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Mark Completed
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // =====================================================
  // BUYER INQUIRY CARD
  // =====================================================
  
  function BuyerInquiryCard({
    inquiry,
    onAccept,
    onReject,
  }: {
    inquiry: SellerInquiry;
  
    onAccept: () => void;
  
    onReject: () => void;
  }) {
    return (
      <div className="rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col justify-between gap-5 md:flex-row">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-black">
                {
                  inquiry.sellerName
                }
              </p>
  
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-500">
                {inquiry.status}
              </span>
            </div>
  
            {inquiry.offeredPrice && (
              <p className="mt-3 font-bold text-blue-600">
                Offer:{" "}
                {
                  inquiry.offeredPrice
                }
              </p>
            )}
  
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {inquiry.message}
            </p>
  
            {inquiry.status ===
              "accepted" && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
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
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={onAccept}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Accept
              </button>
  
              <button
                type="button"
                onClick={onReject}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
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
  // SELLER INQUIRY CARD
  // =====================================================
  
  function SellerInquiryCard({
    inquiry,
  }: {
    inquiry: SellerInquiry;
  }) {
    return (
      <div className="rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle
                size={17}
                className="text-blue-600"
              />
  
              <p className="font-bold">
                Inquiry
              </p>
            </div>
  
            {inquiry.offeredPrice && (
              <p className="mt-3 font-semibold text-blue-600">
                Offer:{" "}
                {
                  inquiry.offeredPrice
                }
              </p>
            )}
  
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {inquiry.message}
            </p>
  
            <p className="mt-3 text-xs text-slate-400">
              Cost:{" "}
              {
                inquiry.creditCost
              }{" "}
              Credits
            </p>
          </div>
  
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-600">
            {inquiry.status}
          </span>
        </div>
      </div>
    );
  }
  
  // =====================================================
  // STAT CARD
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
  
  // =====================================================
  // HISTORY CARD
  // =====================================================
  
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
  
  // =====================================================
  // EMPTY
  // =====================================================
  
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