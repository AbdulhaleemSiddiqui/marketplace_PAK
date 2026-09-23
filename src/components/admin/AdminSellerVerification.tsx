import {
    BadgeCheck,
    CheckCircle2,
    ShieldCheck,
    XCircle,
  } from "lucide-react";
  
  import {
    useEffect,
    useState,
  } from "react";
  
  import {
    approveAdminSeller,
    getPendingAdminSellers,
    rejectAdminSeller,
    type AdminSeller,
  } from "../../services/adminApiService";
  
  interface Props {
    refreshKey: number;
    onRefresh: (
      message?: string
    ) => void;
  }
  
  export default function AdminSellerVerification({
    refreshKey,
    onRefresh,
  }: Props) {
    const [
      sellers,
      setSellers,
    ] = useState<AdminSeller[]>(
      [],
    );
  
    const [
      loading,
      setLoading,
    ] = useState(true);
  
    const [
      error,
      setError,
    ] = useState("");
  
    const [
      processingId,
      setProcessingId,
    ] = useState<string | null>(
      null,
    );
  
    const loadSellers =
      async () => {
        try {
          setLoading(true);
          setError("");
  
          const response =
            await getPendingAdminSellers();
  
          setSellers(
            Array.isArray(response)
              ? response
              : [],
          );
        } catch (exception) {
          setError(
            exception instanceof Error
              ? exception.message
              : "Unable to load pending sellers.",
          );
        } finally {
          setLoading(false);
        }
      };
  
    useEffect(() => {
      void loadSellers();
    }, [refreshKey]);
  
    const handleAction =
      async (
        sellerId: string,
        action:
          | "approve"
          | "reject",
      ) => {
        try {
          setProcessingId(
            sellerId,
          );
  
          setError("");
  
          if (
            action === "approve"
          ) {
            await approveAdminSeller(
              sellerId,
            );
          } else {
            await rejectAdminSeller(
              sellerId,
            );
          }
  
          await loadSellers();
  
          onRefresh(
            action === "approve"
              ? "Seller verified successfully."
              : "Seller verification rejected.",
          );
        } catch (exception) {
          setError(
            exception instanceof Error
              ? exception.message
              : `Seller ${action} failed.`,
          );
        } finally {
          setProcessingId(
            null,
          );
        }
      };
  
    return (
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Seller Verification
            </h2>
  
            <p className="mt-1 text-sm text-slate-500">
              Backend se pending seller verification requests
            </p>
          </div>
  
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
            <ShieldCheck
              size={16}
            />
  
            {sellers.length} Pending
          </div>
        </div>
  
        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}
  
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Loading pending sellers...
          </div>
        ) : sellers.length ===
          0 ? (
          <div className="py-16 text-center">
            <BadgeCheck
              size={34}
              className="mx-auto text-emerald-500"
            />
  
            <p className="mt-3 font-bold text-slate-700">
              No pending seller verification
            </p>
  
            <p className="mt-1 text-sm text-slate-400">
              Sab seller verification requests clear hain.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {sellers.map(
              (seller) => {
                const processing =
                  processingId ===
                  seller.id;
  
                return (
                  <div
                    key={seller.id}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-slate-950">
                            {seller.name ||
                              "Seller"}
                          </p>
  
                          {seller.referenceNo && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {
                                seller.referenceNo
                              }
                            </span>
                          )}
                        </div>
  
                        <p className="mt-2 break-all text-sm text-slate-500">
                          {seller.email}
                        </p>
  
                        <p className="mt-1 text-sm text-slate-500">
                          {seller.phone ||
                            "Phone not provided"}
                        </p>
  
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <Info
                            label="Business"
                            value={
                              seller.businessName ||
                              "Not provided"
                            }
                          />
  
                          <Info
                            label="City"
                            value={
                              seller.businessCity ||
                              "Not provided"
                            }
                          />
  
                          <Info
                            label="Category"
                            value={
                              seller.businessCategory ||
                              "Not provided"
                            }
                          />
                        </div>
  
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              seller.phoneVerified
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {seller.phoneVerified
                              ? "Phone Verified"
                              : "Phone Pending"}
                          </span>
  
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-700">
                            {(
                              seller.sellerVerificationStatus ||
                              "pending"
                            ).replace(
                              /_/g,
                              " ",
                            )}
                          </span>
                        </div>
                      </div>
  
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          disabled={
                            processing
                          }
                          onClick={() =>
                            void handleAction(
                              seller.id,
                              "approve",
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                          onClick={() =>
                            void handleAction(
                              seller.id,
                              "reject",
                            )
                          }
                          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
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
              },
            )}
          </div>
        )}
      </section>
    );
  }
  
  function Info({
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
  
        <p className="mt-1 text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    );
  }
  