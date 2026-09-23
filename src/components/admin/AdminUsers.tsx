import {
    Search,
    ShieldCheck,
    UserRound,
  } from "lucide-react";
  import {
    useEffect,
    useState,
  } from "react";
  import {
    getAdminUsers,
    type AdminUserListItem,
  } from "../../services/adminApiService";
  
  export default function AdminUsers() {
    const [users, setUsers] =
      useState<AdminUserListItem[]>([]);
    const [search, setSearch] =
      useState("");
    const [loading, setLoading] =
      useState(true);
    const [error, setError] =
      useState("");
    const [totalCount, setTotalCount] =
      useState(0);
  
    useEffect(() => {
      const timer =
        window.setTimeout(() => {
          void loadUsers(search);
        }, 300);
  
      return () =>
        window.clearTimeout(timer);
    }, [search]);
  
    async function loadUsers(
      value: string,
    ) {
      try {
        setLoading(true);
        setError("");
  
        const result =
          await getAdminUsers({
            search: value,
            page: 1,
            pageSize: 100,
          });
  
        setUsers(result.items);
        setTotalCount(
          result.totalCount,
        );
      } catch (exception) {
        setUsers([]);
        setTotalCount(0);
        setError(
          exception instanceof Error
            ? exception.message
            : "Unable to load users.",
        );
      } finally {
        setLoading(false);
      }
    }
  
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div>
          <h2 className="text-xl font-black text-slate-950">
            Registered Users
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {totalCount} total registered users
          </p>
        </div>
  
        <div className="relative mt-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search name, email, phone or reference..."
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
  
        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}
  
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="pb-4 pr-4">
                  User
                </th>
                <th className="pb-4 pr-4">
                  Role
                </th>
                <th className="pb-4 pr-4">
                  Phone
                </th>
                <th className="pb-4 pr-4">
                  Phone Status
                </th>
                <th className="pb-4 pr-4">
                  Seller Status
                </th>
                <th className="pb-4">
                  Joined
                </th>
              </tr>
            </thead>
  
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-slate-400"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <UserRound
                            size={18}
                            className="text-slate-500"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {user.name ||
                              "Unnamed user"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {user.email}
                          </p>
                          {user.referenceNo && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {
                                user.referenceNo
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
  
                    <td className="py-4 pr-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                        {user.role}
                      </span>
                    </td>
  
                    <td className="py-4 pr-4 text-sm text-slate-600">
                      {user.phone || "—"}
                    </td>
  
                    <td className="py-4 pr-4">
                      <StatusBadge
                        ok={
                          user.phoneVerified
                        }
                        yes="Verified"
                        no="Not Verified"
                      />
                    </td>
  
                    <td className="py-4 pr-4">
                      {user.role.toLowerCase() ===
                      "seller" ? (
                        <SellerStatus
                          status={
                            user.sellerVerificationStatus
                          }
                        />
                      ) : (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      )}
                    </td>
  
                    <td className="py-4 text-sm text-slate-500">
                      {formatDate(
                        user.createdAt,
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
  
  function StatusBadge({
    ok,
    yes,
    no,
  }: {
    ok: boolean;
    yes: string;
    no: string;
  }) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
          ok
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {ok && (
          <ShieldCheck size={13} />
        )}
        {ok ? yes : no}
      </span>
    );
  }
  
  function SellerStatus({
    status,
  }: {
    status?: string | null;
  }) {
    const value =
      status?.trim().toLowerCase() ||
      "pending";
  
    const classes =
      value === "verified"
        ? "bg-emerald-50 text-emerald-700"
        : value === "rejected"
          ? "bg-red-50 text-red-700"
          : "bg-amber-50 text-amber-700";
  
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${classes}`}
      >
        {value.replace(/_/g, " ")}
      </span>
    );
  }
  
  function formatDate(
    value?: string | null,
  ) {
    if (!value) {
      return "—";
    }
  
    const date = new Date(value);
  
    if (
      Number.isNaN(date.getTime())
    ) {
      return "—";
    }
  
    return date.toLocaleDateString();
  }
  