import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  PackageSearch,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getRequirementImageUrl,
  type RequirementDetail,
} from "../../services/requirementApiService";
import type { PublicRequirement } from "../../types/find";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

export default function RequirementDetailModal({
  requirement,
  details,
  loading,
  error,
  currentUserRole,
  onClose,
  onInquiry,
}: {
  requirement: PublicRequirement;
  details: RequirementDetail | null;
  loading: boolean;
  error: string;
  currentUserRole?: "buyer" | "seller";
  onClose: () => void;
  onInquiry: () => void;
}) {
  const active = requirement.activityStatus === "active";
  const canSendInquiry =
    active && currentUserRole !== "buyer";

  const images = useMemo(() => {
    const realImages =
      details?.images
        ?.slice()
        .sort(
          (a, b) =>
            Number(b.isCover) - Number(a.isCover) ||
            a.sortOrder - b.sortOrder,
        )
        .map((image) =>
          getRequirementImageUrl(image.filePath),
        )
        .filter((url): url is string => Boolean(url)) ?? [];

    if (realImages.length > 0) return realImages;
    return requirement.imageUrl ? [requirement.imageUrl] : [];
  }, [details?.images, requirement.imageUrl]);

  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    setActiveImage(images[0] ?? "");
  }, [images]);

  const fields =
    details?.fields
      ?.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((field) => Boolean(field.value?.trim())) ?? [];

  const location = details
    ? [details.area, details.city, details.country]
        .filter(Boolean)
        .join(", ")
    : requirement.location;

  const budget =
    details?.budgetMin != null && details?.budgetMax != null
      ? `PKR ${details.budgetMin.toLocaleString()} - ${details.budgetMax.toLocaleString()}`
      : details?.budgetMax != null
        ? `Up to PKR ${details.budgetMax.toLocaleString()}`
        : details?.budgetMin != null
          ? `From PKR ${details.budgetMin.toLocaleString()}`
          : requirement.budget;

  const postedAt = details?.createdAt ?? requirement.createdAt;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[26px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Requirement
            </p>
            <h2 className="truncate text-lg font-black text-slate-950">
              {requirement.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
              Loading requirement...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {!loading && (
            <>
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={requirement.title}
                  className="h-[280px] w-full rounded-2xl border border-slate-200 bg-slate-50 object-contain"
                />
              ) : (
                <div className="flex h-[220px] items-center justify-center rounded-2xl border bg-slate-50 text-slate-400">
                  <PackageSearch size={34} />
                </div>
              )}

              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(url)}
                      className={`shrink-0 overflow-hidden rounded-xl border-2 ${
                        activeImage === url
                          ? "border-blue-600"
                          : "border-slate-200"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${requirement.title} ${index + 1}`}
                        className="h-16 w-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge active={active} />
                {requirement.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                    <BadgeCheck size={14} />
                    Verified
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold">
                  {requirement.requirementType === "service"
                    ? "Service"
                    : "Product"}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-black text-slate-950">
                {requirement.title}
              </h3>

              <section className="mt-5">
                <h4 className="text-sm font-black text-slate-950">
                  Basic Details
                </h4>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <BasicItem
                    label="Category"
                    value={[
                      details?.category ?? requirement.category,
                      details?.subCategory,
                    ].filter(Boolean).join(" • ")}
                  />
                  <BasicItem
                    label="Type"
                    value={
                      requirement.requirementType === "service"
                        ? "Service"
                        : "Product"
                    }
                  />
                  <BasicItem label="Budget" value={budget} />
                  <BasicItem
                    label="Location"
                    value={location}
                    icon={<MapPin size={14} />}
                  />
                  <BasicItem
                    label="Posted"
                    value={
                      postedAt
                        ? new Date(postedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : undefined
                    }
                    icon={<CalendarDays size={14} />}
                  />
                  <BasicItem
                    label="Reference"
                    value={details?.referenceNo}
                  />
                </div>
              </section>

              {fields.length > 0 && (
                <section className="mt-6">
                  <h4 className="text-sm font-black text-slate-950">
                    Additional Details
                  </h4>

                  <div className="mt-3 divide-y overflow-hidden rounded-2xl border border-slate-200">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr]"
                      >
                        <span className="text-xs font-bold text-slate-500">
                          {field.label}
                          {field.isRequired ? " *" : ""}
                        </span>
                        <span className="break-words text-sm font-semibold text-slate-900">
                          {field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <div className="sticky bottom-0 border-t bg-white/95 px-5 py-4 backdrop-blur">
          <button
            type="button"
            disabled={!canSendInquiry || loading}
            onClick={canSendInquiry ? onInquiry : undefined}
            title={
              currentUserRole === "buyer"
                ? "Only sellers can send inquiries."
                : !active
                  ? "Requirement is closed."
                  : "Send Inquiry"
            }
            className={`w-full rounded-xl px-4 py-3 font-bold ${
              canSendInquiry && !loading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            {!active ? "Requirement Closed" : "Send Inquiry"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BasicItem({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900">
        {icon}
        <span>{value || "—"}</span>
      </div>
    </div>
  );
}
