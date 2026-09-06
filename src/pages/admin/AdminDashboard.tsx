import {
    BadgeCheck,
    CheckCircle2,
    Clock3,
    Coins,
    FileCheck2,
    MessageCircle,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Store,
    Users,
    XCircle,
  } from "lucide-react";
  
  import {
    useMemo,
    useState,
    type ReactNode,
  } from "react";
  
  import AdminLayout, {
    type AdminSection,
  } from "../../components/admin/AdminLayout";
  
  import {
    addSellerAdminCredits,
    approveRequirement,
    getAdminDashboardStats,
    getAdminInquiries,
    getAdminRequirements,
    getAdminUsers,
    getSellerAdminBalance,
    getSellers,
    rejectRequirement,
    updateSellerVerificationStatus,
  } from "../../services/adminService";
  
  import type {
    User,
  } from "../../types/auth";
  
  import type {
    SavedBuyerRequirement,
    SellerInquiry,
  } from "../../types/marketplace";
  
  export default function AdminDashboard() {
    const [
      activeSection,
      setActiveSection,
    ] =
      useState<AdminSection>(
        "dashboard"
      );
  
    const [
      refreshKey,
      setRefreshKey,
    ] = useState(0);
  
    const [
      successMessage,
      setSuccessMessage,
    ] = useState("");
  
    void refreshKey;
  
    const refresh =
      (
        message?: string
      ) => {
        setRefreshKey(
          (value) =>
            value + 1
        );
  
        if (message) {
          setSuccessMessage(
            message
          );
  
          window.setTimeout(
            () => {
              setSuccessMessage(
                ""
              );
            },
            3000
          );
        }
      };
  
    return (
      <AdminLayout
        activeSection={
          activeSection
        }
        onChange={
          setActiveSection
        }
      >
        <div className="p-5 sm:p-8 lg:p-10">
          <AdminHeader
            activeSection={
              activeSection
            }
          />
  
          {activeSection ===
            "dashboard" && (
            <DashboardSection
              refreshKey={
                refreshKey
              }
            />
          )}
  
          {activeSection ===
            "users" && (
            <UsersSection
              refreshKey={
                refreshKey
              }
            />
          )}
  
          {activeSection ===
            "requirements" && (
            <RequirementsSection
              refreshKey={
                refreshKey
              }
              onRefresh={
                refresh
              }
            />
          )}
  
          {activeSection ===
            "sellers" && (
            <SellerVerificationSection
              refreshKey={
                refreshKey
              }
              onRefresh={
                refresh
              }
            />
          )}
  
          {activeSection ===
            "inquiries" && (
            <InquiriesSection
              refreshKey={
                refreshKey
              }
            />
          )}
  
          {activeSection ===
            "credits" && (
            <CreditsSection
              refreshKey={
                refreshKey
              }
              onRefresh={
                refresh
              }
            />
          )}
        </div>
  
        {successMessage && (
          <div className="fixed bottom-6 right-6 z-[200] max-w-sm rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white shadow-2xl">
            ✓ {successMessage}
          </div>
        )}
      </AdminLayout>
    );
  }
  
  // =====================================================
  // HEADER
  // =====================================================
  
  function AdminHeader({
    activeSection,
  }: {
    activeSection:
      AdminSection;
  }) {
    const titles: Record<
      AdminSection,
      {
        title: string;
        description: string;
      }
    > = {
      dashboard: {
        title:
          "Admin Dashboard",
  
        description:
          "KhojMarket ki overall activity aur verification overview.",
      },
  
      users: {
        title: "Users",
  
        description:
          "Registered buyers aur sellers.",
      },
  
      requirements: {
        title:
          "Buyer Requirements",
  
        description:
          "Buyer requests approve, verify ya reject karein.",
      },
  
      sellers: {
        title:
          "Seller Verification",
  
        description:
          "Seller businesses ko verify ya reject karein.",
      },
  
      inquiries: {
        title: "Inquiries",
  
        description:
          "Seller-to-buyer inquiry activity.",
      },
  
      credits: {
        title:
          "Seller Credits",
  
        description:
          "Seller balances view aur credits add karein.",
      },
    };
  
    const current =
      titles[activeSection];
  
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          KhojMarket Admin
        </p>
  
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          {current.title}
        </h1>
  
        <p className="mt-2 text-sm text-slate-500">
          {
            current.description
          }
        </p>
      </div>
    );
  }
  
  // =====================================================
  // DASHBOARD
  // =====================================================
  
  function DashboardSection({
    refreshKey,
  }: {
    refreshKey: number;
  }) {
    void refreshKey;
  
    const stats =
      getAdminDashboardStats();
  
    const requirements =
      getAdminRequirements();
  
    const recent =
      [...requirements]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        )
        .slice(0, 5);
  
    return (
      <>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStat
            label="Total Users"
            value={
              stats.totalUsers
            }
            icon={<Users />}
          />
  
          <DashboardStat
            label="Buyers"
            value={
              stats.buyers
            }
            icon={
              <ShoppingBag />
            }
          />
  
          <DashboardStat
            label="Sellers"
            value={
              stats.sellers
            }
            icon={<Store />}
          />
  
          <DashboardStat
            label="Pending Requirements"
            value={
              stats.pendingRequirements
            }
            icon={<Clock3 />}
          />
  
          <DashboardStat
            label="Verified Requirements"
            value={
              stats.verifiedRequirements
            }
            icon={
              <FileCheck2 />
            }
          />
  
          <DashboardStat
            label="Seller Verification Pending"
            value={
              stats.pendingSellerVerifications
            }
            icon={
              <ShieldCheck />
            }
          />
  
          <DashboardStat
            label="Total Inquiries"
            value={
              stats.totalInquiries
            }
            icon={
              <MessageCircle />
            }
          />
  
          <DashboardStat
            label="Credits Used"
            value={
              stats.creditsUsed
            }
            icon={<Coins />}
          />
        </div>
  
        <AdminCard
          title="Recent Buyer Requirements"
          subtitle="Latest requirements created by buyers"
        >
          {recent.length ===
          0 ? (
            <AdminEmpty text="No buyer requirements yet." />
          ) : (
            recent.map(
              (item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 border-b border-slate-100 py-4 last:border-0 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-bold">
                      {
                        item.title
                      }
                    </p>
  
                    <p className="mt-1 text-sm text-slate-500">
                      {
                        item.category
                      }
  
                      {item.subCategory
                        ? ` • ${item.subCategory}`
                        : ""}
                    </p>
                  </div>
  
                  <StatusBadge
                    status={
                      item.status
                    }
                  />
                </div>
              )
            )
          )}
        </AdminCard>
      </>
    );
  }
  
  // =====================================================
  // USERS
  // =====================================================
  
  function UsersSection({
    refreshKey,
  }: {
    refreshKey: number;
  }) {
    void refreshKey;
  
    const users =
      getAdminUsers();
  
    const [
      search,
      setSearch,
    ] = useState("");
  
    const filtered =
      useMemo(
        () =>
          users.filter(
            (user) => {
              const query =
                search
                  .toLowerCase()
                  .trim();
  
              if (!query) {
                return true;
              }
  
              return [
                user.name,
                user.email,
                user.phone,
                user.role,
                user.businessName ??
                  "",
              ]
                .join(" ")
                .toLowerCase()
                .includes(query);
            }
          ),
        [users, search]
      );
  
    return (
      <AdminCard
        title="Registered Users"
        subtitle={`${users.length} total registered users`}
      >
        <input
          value={search}
          onChange={(
            event
          ) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search name, email, phone..."
          className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
        />
  
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="pb-4">
                  User
                </th>
  
                <th className="pb-4">
                  Role
                </th>
  
                <th className="pb-4">
                  Phone
                </th>
  
                <th className="pb-4">
                  Phone Status
                </th>
  
                <th className="pb-4">
                  Seller Status
                </th>
  
                <th className="pb-4">
                  Joined
                </th>
              </tr>
            </thead>
  
            <tbody>
              {filtered.map(
                (user) => (
                  <tr
                    key={
                      user.id
                    }
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-4">
                      <p className="font-bold">
                        {
                          user.name
                        }
                      </p>
  
                      <p className="mt-1 text-xs text-slate-400">
                        {
                          user.email
                        }
                      </p>
                    </td>
  
                    <td className="py-4 capitalize">
                      {user.role}
                    </td>
  
                    <td className="py-4">
                      {
                        user.phone
                      }
                    </td>
  
                    <td className="py-4">
                      {user.phoneVerified ? (
                        <MiniBadge
                          success
                          text="Verified"
                        />
                      ) : (
                        <MiniBadge text="Pending" />
                      )}
                    </td>
  
                    <td className="py-4">
                      {user.role ===
                      "seller" ? (
                        <MiniBadge
                          success={
                            user.sellerVerificationStatus ===
                            "verified"
                          }
                          danger={
                            user.sellerVerificationStatus ===
                            "rejected"
                          }
                          text={
                            user.sellerVerificationStatus ??
                            "not_started"
                          }
                        />
                      ) : (
                        <span className="text-slate-300">
                          —
                        </span>
                      )}
                    </td>
  
                    <td className="py-4 text-slate-500">
                      {formatDate(
                        user.createdAt
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    );
  }
  
  // =====================================================
  // REQUIREMENTS
  // =====================================================
  
  function RequirementsSection({
    refreshKey,
    onRefresh,
  }: {
    refreshKey: number;
  
    onRefresh: (
      message?: string
    ) => void;
  }) {
    void refreshKey;
  
    const requirements =
      getAdminRequirements();
  
    if (
      requirements.length ===
      0
    ) {
      return (
        <AdminCard
          title="Buyer Requirements"
          subtitle="Requirements verification queue"
        >
          <AdminEmpty text="No buyer requirements available." />
        </AdminCard>
      );
    }
  
    return (
      <div className="mt-8 space-y-4">
        {requirements.map(
          (item) => (
            <RequirementAdminCard
              key={item.id}
              requirement={
                item
              }
              onApprove={() => {
                approveRequirement(
                  item.id
                );
  
                onRefresh(
                  "Requirement verified and published."
                );
              }}
              onReject={() => {
                rejectRequirement(
                  item.id
                );
  
                onRefresh(
                  "Requirement rejected."
                );
              }}
            />
          )
        )}
      </div>
    );
  }
  
  function RequirementAdminCard({
    requirement,
    onApprove,
    onReject,
  }: {
    requirement:
      SavedBuyerRequirement;
  
    onApprove: () => void;
  
    onReject: () => void;
  }) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-black">
                {
                  requirement.title
                }
              </h2>
  
              <StatusBadge
                status={
                  requirement.status
                }
              />
            </div>
  
            <p className="mt-2 text-sm text-slate-500">
              {
                requirement.category
              }
  
              {requirement.subCategory
                ? ` • ${requirement.subCategory}`
                : ""}
            </p>
  
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                      className="rounded-xl bg-slate-50 p-3"
                    >
                      <p className="text-xs text-slate-400">
                        {
                          field.label
                        }
                      </p>
  
                      <p className="mt-1 text-sm font-semibold">
                        {
                          field.value
                        }
                      </p>
                    </div>
                  )
                )}
            </div>
  
            <p className="mt-4 text-xs text-slate-400">
              Created{" "}
              {formatDate(
                requirement.createdAt
              )}
            </p>
          </div>
  
          {requirement.status !==
            "verified" &&
            requirement.status !==
              "completed" && (
              <div className="flex shrink-0 gap-2 lg:flex-col">
                <button
                  type="button"
                  onClick={
                    onApprove
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <CheckCircle2
                    size={16}
                  />
  
                  Approve
                </button>
  
                <button
                  type="button"
                  onClick={
                    onReject
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600"
                >
                  <XCircle
                    size={16}
                  />
  
                  Reject
                </button>
              </div>
            )}
        </div>
      </div>
    );
  }
  
  // =====================================================
  // SELLER VERIFICATION
  // =====================================================
  
  function SellerVerificationSection({
    refreshKey,
    onRefresh,
  }: {
    refreshKey: number;
  
    onRefresh: (
      message?: string
    ) => void;
  }) {
    void refreshKey;
  
    const sellers =
      getSellers();
  
    return (
      <AdminCard
        title="Seller Verification"
        subtitle={`${sellers.length} registered sellers`}
      >
        {sellers.length ===
        0 ? (
          <AdminEmpty text="No sellers registered yet." />
        ) : (
          <div className="space-y-4">
            {sellers.map(
              (seller) => (
                <SellerAdminCard
                  key={
                    seller.id
                  }
                  seller={
                    seller
                  }
                  onApprove={() => {
                    updateSellerVerificationStatus(
                      seller.id,
                      "verified"
                    );
  
                    onRefresh(
                      "Seller verified successfully."
                    );
                  }}
                  onReject={() => {
                    updateSellerVerificationStatus(
                      seller.id,
                      "rejected"
                    );
  
                    onRefresh(
                      "Seller verification rejected."
                    );
                  }}
                />
              )
            )}
          </div>
        )}
      </AdminCard>
    );
  }
  
  function SellerAdminCard({
    seller,
    onApprove,
    onReject,
  }: {
    seller: User;
  
    onApprove: () => void;
  
    onReject: () => void;
  }) {
    const verified =
      seller.sellerVerificationStatus ===
      "verified";
  
    const rejected =
      seller.sellerVerificationStatus ===
      "rejected";
  
    return (
      <div className="rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-black">
                {seller.name}
              </p>
  
              <MiniBadge
                success={
                  verified
                }
                danger={
                  rejected
                }
                text={
                  seller.sellerVerificationStatus ??
                  "not_started"
                }
              />
            </div>
  
            <p className="mt-2 text-sm text-slate-500">
              {seller.email}
            </p>
  
            <p className="mt-1 text-sm text-slate-500">
              {seller.phone}
            </p>
  
            {(seller.businessName ||
              seller.businessCity ||
              seller.businessCategory) && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="font-bold">
                  {seller.businessName ??
                    "Business"}
                </p>
  
                <p className="mt-1 text-sm text-slate-500">
                  {seller.businessCity ??
                    "City not provided"}
  
                  {seller.businessCategory
                    ? ` • ${seller.businessCategory}`
                    : ""}
                </p>
              </div>
            )}
          </div>
  
          <div className="flex gap-2">
            {!verified && (
              <button
                type="button"
                onClick={
                  onApprove
                }
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Verify
              </button>
            )}
  
            {!rejected && (
              <button
                type="button"
                onClick={
                  onReject
                }
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // =====================================================
  // INQUIRIES
  // =====================================================
  
  function InquiriesSection({
    refreshKey,
  }: {
    refreshKey: number;
  }) {
    void refreshKey;
  
    const inquiries =
      getAdminInquiries();
  
    return (
      <AdminCard
        title="All Inquiries"
        subtitle={`${inquiries.length} marketplace inquiries`}
      >
        {inquiries.length ===
        0 ? (
          <AdminEmpty text="No seller inquiries yet." />
        ) : (
          <div className="space-y-4">
            {inquiries.map(
              (inquiry) => (
                <InquiryAdminCard
                  key={
                    inquiry.id
                  }
                  inquiry={
                    inquiry
                  }
                />
              )
            )}
          </div>
        )}
      </AdminCard>
    );
  }
  
  function InquiryAdminCard({
    inquiry,
  }: {
    inquiry:
      SellerInquiry;
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
  
              <MiniBadge
                success={
                  inquiry.status ===
                    "accepted" ||
                  inquiry.status ===
                    "completed"
                }
                danger={
                  inquiry.status ===
                  "rejected"
                }
                text={
                  inquiry.status
                }
              />
            </div>
  
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {inquiry.message}
            </p>
  
            {inquiry.offeredPrice && (
              <p className="mt-3 font-bold text-blue-600">
                Offer:{" "}
                {
                  inquiry.offeredPrice
                }
              </p>
            )}
  
            <div className="mt-4 text-xs text-slate-400">
              Requirement ID:{" "}
              {
                inquiry.requirementId
              }
  
              <br />
  
              Seller ID:{" "}
              {
                inquiry.sellerUserId
              }
            </div>
          </div>
  
          <div className="shrink-0 rounded-xl bg-amber-50 px-4 py-3 text-sm">
            <p className="text-xs text-amber-600">
              Inquiry Cost
            </p>
  
            <p className="mt-1 font-black text-amber-700">
              {
                inquiry.creditCost
              }{" "}
              Credits
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // =====================================================
  // CREDITS
  // =====================================================
  
  function CreditsSection({
    refreshKey,
    onRefresh,
  }: {
    refreshKey: number;
  
    onRefresh: (
      message?: string
    ) => void;
  }) {
    void refreshKey;
  
    const sellers =
      getSellers();
  
    return (
      <AdminCard
        title="Seller Credits"
        subtitle="Seller wallet balances aur admin credit actions"
      >
        {sellers.length ===
        0 ? (
          <AdminEmpty text="No sellers available." />
        ) : (
          <div className="space-y-4">
            {sellers.map(
              (seller) => (
                <SellerCreditCard
                  key={
                    seller.id
                  }
                  seller={
                    seller
                  }
                  onCreditAdded={() =>
                    onRefresh(
                      "Credits added successfully."
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </AdminCard>
    );
  }
  
  function SellerCreditCard({
    seller,
    onCreditAdded,
  }: {
    seller: User;
  
    onCreditAdded:
      () => void;
  }) {
    const [
      amount,
      setAmount,
    ] = useState("10");
  
    const balance =
      getSellerAdminBalance(
        seller.id
      );
  
    const addCredits =
      () => {
        const numericAmount =
          Number(amount);
  
        if (
          !Number.isFinite(
            numericAmount
          ) ||
          numericAmount <= 0
        ) {
          alert(
            "Valid credit amount enter karein."
          );
  
          return;
        }
  
        addSellerAdminCredits(
          seller.id,
          numericAmount
        );
  
        onCreditAdded();
      };
  
    return (
      <div className="rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black">
                {seller.name}
              </p>
  
              {seller.sellerVerificationStatus ===
                "verified" && (
                <BadgeCheck
                  size={16}
                  className="text-emerald-600"
                />
              )}
            </div>
  
            <p className="mt-1 text-sm text-slate-500">
              {seller.email}
            </p>
  
            <p className="mt-4 text-2xl font-black text-blue-600">
              {balance} Credits
            </p>
          </div>
  
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(
                event
              ) =>
                setAmount(
                  event.target.value
                )
              }
              className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-500"
            />
  
            <button
              type="button"
              onClick={
                addCredits
              }
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
            >
              <Plus
                size={16}
              />
  
              Add Credits
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // =====================================================
  // SHARED UI
  // =====================================================
  
  function DashboardStat({
    label,
    value,
    icon,
  }: {
    label: string;
  
    value: number;
  
    icon: ReactNode;
  }) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
  
  function AdminCard({
    title,
    subtitle,
    children,
  }: {
    title: string;
  
    subtitle: string;
  
    children: ReactNode;
  }) {
    return (
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <h2 className="text-xl font-black">
          {title}
        </h2>
  
        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
  
        <div className="mt-6">
          {children}
        </div>
      </section>
    );
  }
  
  function StatusBadge({
    status,
  }: {
    status: string;
  }) {
    const success =
      status === "verified" ||
      status === "completed";
  
    const danger =
      status === "rejected";
  
    return (
      <MiniBadge
        text={status.replace(
          /_/g,
          " "
        )}
        success={success}
        danger={danger}
      />
    );
  }
  
  function MiniBadge({
    text,
    success = false,
    danger = false,
  }: {
    text: string;
  
    success?: boolean;
  
    danger?: boolean;
  }) {
    const classes = danger
      ? "bg-red-50 text-red-600"
      : success
        ? "bg-emerald-50 text-emerald-600"
        : "bg-amber-50 text-amber-600";
  
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${classes}`}
      >
        {text.replace(
          /_/g,
          " "
        )}
      </span>
    );
  }
  
  function AdminEmpty({
    text,
  }: {
    text: string;
  }) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        {text}
      </div>
    );
  }
  
  function formatDate(
    value: string
  ) {
    try {
      return new Date(
        value
      ).toLocaleDateString();
    } catch {
      return value;
    }
  }