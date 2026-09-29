import {
  CheckCircle2,
  Clock3,
  Coins,
  FileCheck2,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
  XCircle,
} from "lucide-react";
import AdminSellerVerification from "../../components/admin/AdminSellerVerification";
import AdminCredits from "../../components/admin/AdminCredits";
import AdminUsers from "../../components/admin/AdminUsers";
import AdminTrust from "../../components/admin/AdminTrust";
import AdminInquiries from "../../components/admin/AdminInquiries";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import AdminLayout, {
  type AdminSection,
} from "../../components/admin/AdminLayout";



import {
  approveAdminRequirement,
  getAdminDashboard,
  getAdminPendingRequirements,
  rejectAdminRequirement,
  type AdminDashboardStats,
  type RequirementListItem,
} from "../../services/adminApiService";





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

{activeSection === "users" && (
  <AdminUsers />
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

{activeSection === "sellers" && (
  <AdminSellerVerification
    refreshKey={refreshKey}
    onRefresh={refresh}
  />
)}
{activeSection === "inquiries" && (
  <AdminInquiries
    refreshKey={refreshKey}
  />
)}
{activeSection === "credits" && (
  <AdminCredits
    refreshKey={refreshKey}
    onRefresh={refresh}
  />
)}
        {(activeSection === "complaints" || activeSection === "blocked") && <AdminTrust key={activeSection} section={activeSection} />}
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

    complaints: { title: "Complaints", description: "Review marketplace reports and issue warnings or dismiss complaints." },
    blocked: { title: "Blocked Users", description: "Review blocked accounts and restore access when appropriate." },
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
  const [
    stats,
    setStats,
  ] = useState<AdminDashboardStats | null>(
    null,
  );

  const [
    statsError,
    setStatsError,
  ] = useState("");

  const [
    pendingRequirements,
    setPendingRequirements,
  ] = useState<RequirementListItem[]>(
    [],
  );

  const [
    pendingTotal,
    setPendingTotal,
  ] = useState(0);

  const [
    pendingLoading,
    setPendingLoading,
  ] = useState(false);

  const [
    pendingError,
    setPendingError,
  ] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard =
      async () => {
        try {
          setStatsError("");

          const result =
            await getAdminDashboard();

          if (!cancelled) {
            setStats(result);
          }
        } catch (error) {
          if (!cancelled) {
            setStatsError(
              error instanceof Error
                ? error.message
                : "Unable to load admin dashboard.",
            );
          }
        }
      };

    const loadPending =
      async () => {
        try {
          setPendingLoading(true);
          setPendingError("");

          const response =
            await getAdminPendingRequirements(
              {
                page: 1,
                pageSize: 5,
              },
            );

          if (cancelled) {
            return;
          }

          setPendingRequirements(
            response.items ?? [],
          );

          setPendingTotal(
            response.totalCount ?? 0,
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          setPendingError(
            error instanceof Error
              ? error.message
              : "Unable to load pending requirements.",
          );
        } finally {
          if (!cancelled) {
            setPendingLoading(false);
          }
        }
      };

    void loadDashboard();
    void loadPending();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <>
      {statsError && (
        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {statsError}
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          label="Total Users"
          value={
            (stats?.totalBuyers ?? 0) + (stats?.totalSellers ?? 0)
          }
          icon={<Users />}
        />

        <DashboardStat
          label="Buyers"
          value={
            stats?.totalBuyers ?? 0
          }
          icon={
            <ShoppingBag />
          }
        />

        <DashboardStat
          label="Sellers"
          value={
            stats?.totalSellers ?? 0
          }
          icon={<Store />}
        />

        <DashboardStat
          label="Pending Requirements"
          value={
            pendingTotal
          }
          icon={<Clock3 />}
        />

        <DashboardStat
          label="Verified Requirements"
          value={
            stats?.activeVerifiedRequirements ?? 0
          }
          icon={
            <FileCheck2 />
          }
        />

        <DashboardStat
          label="Seller Verification Pending"
          value={
            stats?.pendingSellers ?? 0
          }
          icon={
            <ShieldCheck />
          }
        />

        <DashboardStat
          label="Total Inquiries"
          value={
            stats?.totalInquiries ?? 0
          }
          icon={
            <MessageCircle />
          }
        />

        <DashboardStat
          label="Seller Credit Balance"
          value={
            stats?.totalSellerCreditBalance ?? 0
          }
          icon={<Coins />}
        />
      </div>

      <AdminCard
        title="Pending Buyer Requirements"
        subtitle="Latest requirements waiting for admin review"
      >
        {pendingLoading ? (
          <AdminEmpty text="Loading pending requirements..." />
        ) : pendingError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {pendingError}
          </div>
        ) : pendingRequirements.length ===
          0 ? (
          <AdminEmpty text="No pending buyer requirements." />
        ) : (
          pendingRequirements.map(
            (item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 border-b border-slate-100 py-4 last:border-0 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">
                      {item.title}
                    </p>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {item.referenceNo}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.category}

                    {item.subCategory
                      ? ` • ${item.subCategory}`
                      : ""}

                    {item.city
                      ? ` • ${item.city}`
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
  const [
    requirements,
    setRequirements,
  ] = useState<RequirementListItem[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    actionId,
    setActionId,
  ] = useState<string | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState("");

  const loadRequirements =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminPendingRequirements(
            {
              page: 1,
              pageSize: 50,
            },
          );

        setRequirements(
          response.items ?? [],
        );
      } catch (exception) {
        setError(
          exception instanceof Error
            ? exception.message
            : "Unable to load admin requirements.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadRequirements();
  }, [refreshKey]);

  const moderateRequirement =
    async (
      id: string,
      action:
        | "approve"
        | "reject",
    ) => {
      try {
        setActionId(id);
        setError("");

        if (
          action === "approve"
        ) {
          await approveAdminRequirement(
            id,
          );
        } else {
          await rejectAdminRequirement(
            id,
          );
        }

        await loadRequirements();

        onRefresh(
          action === "approve"
            ? "Requirement verified and published."
            : "Requirement rejected.",
        );
      } catch (exception) {
        setError(
          exception instanceof Error
            ? exception.message
            : `Requirement ${action} failed.`,
        );
      } finally {
        setActionId(null);
      }
    };

  if (loading) {
    return (
      <AdminCard
        title="Buyer Requirements"
        subtitle="Requirements verification queue"
      >
        <AdminEmpty text="Loading requirements..." />
      </AdminCard>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {requirements.length ===
      0 ? (
        <AdminCard
          title="Buyer Requirements"
          subtitle="Requirements verification queue"
        >
          <AdminEmpty text="No pending buyer requirements." />
        </AdminCard>
      ) : (
        requirements.map(
          (item) => (
            <RequirementAdminCard
              key={item.id}
              requirement={
                item
              }
              processing={
                actionId ===
                item.id
              }
              onApprove={() =>
                void moderateRequirement(
                  item.id,
                  "approve",
                )
              }
              onReject={() =>
                void moderateRequirement(
                  item.id,
                  "reject",
                )
              }
            />
          )
        )
      )}
    </div>
  );
}

function RequirementAdminCard({
  requirement,
  onApprove,
  onReject,
  processing,
}: {
  requirement:
    RequirementListItem;

  onApprove: () => void;

  onReject: () => void;

  processing: boolean;
}) {
  const location = [
    requirement.area,
    requirement.city,
    requirement.country,
  ]
    .filter(Boolean)
    .join(", ");

  const budget =
    requirement.budgetMin != null ||
    requirement.budgetMax != null
      ? [
          requirement.budgetMin != null
            ? `PKR ${requirement.budgetMin.toLocaleString()}`
            : null,
          requirement.budgetMax != null
            ? `PKR ${requirement.budgetMax.toLocaleString()}`
            : null,
        ]
          .filter(Boolean)
          .join(" - ")
      : "Budget not provided";

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

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {
                requirement.referenceNo
              }
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {
              requirement.category
            }

            {requirement.subCategory
              ? ` • ${requirement.subCategory}`
              : ""}

            {` • ${requirement.requirementType}`}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AdminSummaryField
              label="Location"
              value={
                location ||
                "Not provided"
              }
            />

            <AdminSummaryField
              label="Budget"
              value={
                budget
              }
            />

            <AdminSummaryField
              label="Activity"
              value={
                requirement.activityStatus
              }
            />

            <AdminSummaryField
              label="Seller Inquiries"
              value={String(
                requirement.inquiryCount ??
                  0,
              )}
            />
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Created{" "}
            {formatDate(
              requirement.createdAt
            )}
          </p>
        </div>

        <div className="flex shrink-0 gap-2 lg:flex-col">
          <button
            type="button"
            disabled={
              processing
            }
            onClick={
              onApprove
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2
              size={16}
            />

            {processing
              ? "Please wait..."
              : "Approve"}
          </button>

          <button
            type="button"
            disabled={
              processing
            }
            onClick={
              onReject
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle
              size={16}
            />

            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminSummaryField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold capitalize">
        {value}
      </p>
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
