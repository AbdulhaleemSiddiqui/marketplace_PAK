import { BadgeCheck, Coins, History, Minus, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  adjustAdminSellerWallet,
  getAdminSellerWallet,
  getAdminSellerWalletTransactions,
  getAdminUsers,
  type AdminSellerWallet,
  type AdminUserListItem,
  type AdminWalletTransaction,
} from "../../services/adminApiService";

interface Props {
  refreshKey: number;
  onRefresh: (message?: string) => void;
}

export default function AdminCredits({ refreshKey, onRefresh }: Props) {
  const [sellers, setSellers] = useState<AdminUserListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadSellers();
  }, [refreshKey]);

  async function loadSellers() {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminUsers({ page: 1, pageSize: 100 });
      setSellers(
        response.items.filter(
          (user) => user.role.toLowerCase() === "seller",
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load sellers.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sellers;

    return sellers.filter((seller) =>
      [
        seller.name,
        seller.email,
        seller.phone,
        seller.referenceNo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [sellers, search]);

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-black">Seller Credits</h2>
          <p className="mt-1 text-sm text-slate-500">
            Seller wallet balances, credit adjustments aur transaction history.
          </p>
        </div>
        <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
          {sellers.length} Sellers
        </span>
      </div>

      <div className="relative mt-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search seller name, email, phone or reference..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading sellers...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">No sellers found.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((seller) => (
            <SellerWalletCard
              key={seller.id}
              seller={seller}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SellerWalletCard({
  seller,
  onRefresh,
}: {
  seller: AdminUserListItem;
  onRefresh: (message?: string) => void;
}) {
  const [wallet, setWallet] = useState<AdminSellerWallet | null>(null);
  const [transactions, setTransactions] = useState<AdminWalletTransaction[]>([]);
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadWallet();
  }, [seller.id]);

  async function loadWallet() {
    try {
      setLoading(true);
      setError("");
      setWallet(await getAdminSellerWallet(seller.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load wallet.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      setError("");
      const result = await getAdminSellerWalletTransactions(seller.id);
      setTransactions(Array.isArray(result) ? result : []);
      setShowHistory(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load transactions.");
    }
  }

  async function adjust(direction: "add" | "deduct") {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Valid credit amount enter karein.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      await adjustAdminSellerWallet(
        seller.id,
        direction === "add" ? value : -value,
        direction === "add"
          ? "Admin credit adjustment"
          : "Admin credit deduction",
      );

      await loadWallet();
      if (showHistory) await loadHistory();

      onRefresh(
        direction === "add"
          ? `${value} credits added successfully.`
          : `${value} credits deducted successfully.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Credit adjustment failed.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black">{seller.name || "Seller"}</p>
            {seller.sellerVerificationStatus === "verified" && (
              <BadgeCheck size={17} className="text-emerald-600" />
            )}
            {seller.referenceNo && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {seller.referenceNo}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{seller.email}</p>
          <p className="mt-4 flex items-center gap-2 text-2xl font-black text-blue-600">
            <Coins size={20} />
            {loading ? "..." : wallet?.balance ?? 0} Credits
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none sm:w-28"
          />
          <button
            disabled={processing}
            onClick={() => void adjust("add")}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Plus size={16} /> Add
          </button>
          <button
            disabled={processing}
            onClick={() => void adjust("deduct")}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50"
          >
            <Minus size={16} /> Deduct
          </button>
          <button
            onClick={() =>
              showHistory ? setShowHistory(false) : void loadHistory()
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
          >
            <History size={16} /> {showHistory ? "Hide History" : "History"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {showHistory && (
        <div className="mt-5 overflow-x-auto border-t border-slate-100 pt-5">
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-400">No credit transactions yet.</p>
          ) : (
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-400">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Balance</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50">
                    <td className="py-3 capitalize">{t.type.replace(/_/g, " ")}</td>
                    <td className={`py-3 font-bold ${t.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {t.amount > 0 ? "+" : ""}{t.amount}
                    </td>
                    <td className="py-3">{t.balanceAfter}</td>
                    <td className="py-3 text-slate-500">{t.description || "—"}</td>
                    <td className="py-3 text-slate-400">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
