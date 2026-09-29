import { useEffect, useState } from "react";
import DealActionDialog, { type DealActionValues } from "../deals/DealActionDialog";
import { getAdminComplaints, getBlockedMarketplaceUsers, reviewAdminComplaint, unblockMarketplaceUser, type MarketplaceComplaint, type BlockedMarketplaceUser, type ComplaintStatus } from "../../services/trustApiService";

type ReviewTarget = { action: "warning" | "dismiss"; complaint: MarketplaceComplaint } | { action: "unblock"; user: BlockedMarketplaceUser };
const statusLabels = { pending: "Pending review", warning_issued: "Warning issued", dismissed: "Dismissed" };

export default function AdminTrust({ section }: { section: "complaints" | "blocked" }) {
  const [status, setStatus] = useState<ComplaintStatus | "all">("pending");
  const [complaints, setComplaints] = useState<MarketplaceComplaint[]>([]);
  const [blocked, setBlocked] = useState<BlockedMarketplaceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [target, setTarget] = useState<ReviewTarget | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const load = async () => {
      try {
        if (section === "complaints") {
          const items = await getAdminComplaints(status);
          if (!cancelled) setComplaints(items ?? []);
        } else {
          const items = await getBlockedMarketplaceUsers();
          if (!cancelled) setBlocked(items ?? []);
        }
      } catch (failure) { if (!cancelled) setError(failure instanceof Error ? failure.message : "Unable to load moderation data."); }
      finally { if (!cancelled) setLoading(false); }
    };
    void load();
    return () => { cancelled = true; };
  }, [section, status, refresh]);

  const submit = async (values: DealActionValues) => {
    if (!target) return;
    if (target.action === "unblock") {
      await unblockMarketplaceUser(target.user.userId);
      setBlocked(items => items.filter(item => item.userId !== target.user.userId));
      setMessage("Account unblocked. Existing warnings have been retained.");
    } else {
      const updated = await reviewAdminComplaint(target.complaint.id, target.action, values.reason);
      setComplaints(items => items.flatMap(item => item.id !== updated.id ? [item] : status === "all" || updated.status === status ? [updated] : []));
      setMessage(target.action === "warning" ? "Warning issued. Accounts with three confirmed warnings are automatically blocked." : "Complaint dismissed. No warning was issued.");
    }
    setTarget(null);
  };

  return <section className="mt-8 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      {section === "complaints" ? <label className="text-sm font-bold text-slate-700">Status
        <select aria-label="Complaint status" value={status} onChange={event => { setStatus(event.target.value as ComplaintStatus | "all"); setMessage(""); }} className="ml-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <option value="pending">Pending review</option><option value="warning_issued">Warning issued</option><option value="dismissed">Dismissed</option><option value="all">All complaints</option>
        </select>
      </label> : <p className="text-sm text-slate-600">Accounts blocked after confirmed marketplace warnings.</p>}
      <button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold disabled:opacity-50">Refresh</button>
    </div>
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error} Use Refresh to try again.</p>}
    {loading ? <p className="py-12 text-center text-sm text-slate-500">Loading moderation data…</p> : error ? null : section === "complaints" ? <>
      {complaints.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No complaints in this status.</p>}
      {complaints.map(complaint => <article key={complaint.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="font-black text-slate-900">{complaint.reportedUserName || "Marketplace user"} <span className="text-xs font-normal capitalize text-slate-400">{complaint.reportedUserRole}</span></p><p className="mt-1 text-sm text-slate-500">Reported by {complaint.reporterName || "Marketplace user"} · {new Date(complaint.createdAt).toLocaleString()}</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${complaint.status === "pending" ? "bg-amber-50 text-amber-700" : complaint.status === "warning_issued" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{statusLabels[complaint.status] ?? complaint.status}</span>
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-blue-600">{complaint.category.replaceAll("_", " ")}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{complaint.details}</p>
        {complaint.adminNote && <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><strong>Admin note: </strong>{complaint.adminNote}</p>}
        {complaint.reviewedAt && <p className="mt-2 text-xs text-slate-400">Reviewed {new Date(complaint.reviewedAt).toLocaleString()}</p>}
        {complaint.status === "pending" && <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => setTarget({ action: "warning", complaint })} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white">Issue warning</button><button type="button" onClick={() => setTarget({ action: "dismiss", complaint })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Dismiss complaint</button></div>}
      </article>)}
    </> : <>
      {blocked.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No blocked users.</p>}
      {blocked.map(user => <article key={user.userId} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
        <div><p className="font-black text-slate-900">{user.name || "Marketplace user"} <span className="text-xs font-normal capitalize text-slate-400">{user.role}</span></p><p className="mt-2 text-sm font-semibold text-red-600">{user.warningCount} confirmed warnings</p><p className="mt-2 text-sm text-slate-600">{user.blockReason}</p>{user.blockedAt && <p className="mt-2 text-xs text-slate-400">Blocked {new Date(user.blockedAt).toLocaleString()}</p>}</div>
        <button type="button" onClick={() => setTarget({ action: "unblock", user })} className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-700">Unblock account</button>
      </article>)}
    </>}
    {target && <DealActionDialog key={target.action === "unblock" ? target.user.userId : `${target.action}-${target.complaint.id}`} action={target.action}
      title={target.action === "unblock" ? target.user.name || "Marketplace user" : `${target.complaint.reportedUserName || "Marketplace user"} · ${target.complaint.category.replaceAll("_", " ")}`}
      counterpart="marketplace user" onClose={() => setTarget(null)} onSubmit={submit} />}
  </section>;
}
