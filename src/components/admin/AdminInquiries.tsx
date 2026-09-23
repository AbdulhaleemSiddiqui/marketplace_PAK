import { MessageCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAdminInquiriesApi,
  type AdminInquiry,
} from "../../services/adminApiService";

export default function AdminInquiries({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 300);
    return () => window.clearTimeout(timer);
  }, [search, status, refreshKey]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      setItems(await getAdminInquiriesApi({ search, status }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load inquiries.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-950">Seller Inquiries</h2>
          <p className="mt-1 text-sm text-slate-500">
            Marketplace par sellers ki bheji hui inquiries.
          </p>
        </div>
        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
          {items.length} Inquiries
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requirement, seller, buyer..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
        >
          <option value="all">All Status</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading inquiries...</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          <MessageCircle className="mx-auto mb-3" />
          No inquiries found.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <th className="pb-3">Requirement</th>
                <th className="pb-3">Seller</th>
                <th className="pb-3">Buyer</th>
                <th className="pb-3">Offer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Message</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 align-top">
                  <td className="py-4 pr-4">
                    <p className="font-bold">{item.requirementTitle}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.requirementReferenceNo}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <p className="font-semibold">{item.sellerName}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.sellerEmail}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-slate-500">{item.buyerUserId}</span>
                  </td>
                  <td className="py-4 pr-4 font-bold text-blue-600">
                    {item.offeredPrice ?? "—"}
                  </td>
                  <td className="py-4 pr-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize">
                      {item.status}
                    </span>
                  </td>
                  <td className="max-w-[260px] py-4 pr-4 text-slate-500">
                    {item.message}
                  </td>
                  <td className="py-4 text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
