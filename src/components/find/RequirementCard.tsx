import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  MessageSquareText,
  PackageSearch,
  Send,
  Star,
  UserRound,
} from "lucide-react";
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

export default function RequirementCard({
  requirement,
  currentUserRole,
  onView,
  onInquiry,
}: {
  requirement: PublicRequirement;
  currentUserRole?: "buyer" | "seller";
  onView: () => void;
  onInquiry: () => void;
}) {
  const active =
    requirement.activityStatus === "active";

  const buyerLoggedIn =
    currentUserRole === "buyer";

  const canSendInquiry =
    active && !buyerLoggedIn;

  const inquiryLabel =
    requirement.queryCount === 1
      ? "Inquiry"
      : "Inquiries";

  const summaryField =
    requirement.summaryFields?.find(
      (field) =>
        field.value?.trim(),
    );

  const showSummaryField =
    summaryField &&
    summaryField.label
      .trim()
      .toLowerCase() !== "budget";

  return (
    <article
      className={`overflow-hidden rounded-[24px] border bg-white shadow-sm transition ${
        active
          ? "border-slate-200 hover:border-blue-200 hover:shadow-lg"
          : "border-slate-200 opacity-80"
      }`}
    >
      {/* =========================
          MAIN CARD CONTENT
      ========================== */}
      <div className="p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)]">

          {/* =====================
              COVER IMAGE
          ====================== */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {requirement.imageUrl ? (
              <img
                src={requirement.imageUrl}
                alt={requirement.title}
                className="h-[205px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[205px] items-center justify-center text-slate-400">
                <div className="text-center">
                  <PackageSearch
                    size={34}
                    className="mx-auto"
                  />

                  <p className="mt-2 text-xs font-semibold">
                    No image provided
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =====================
              RIGHT CONTENT
          ====================== */}
          <div className="flex min-w-0 flex-col">

            {/* USER + STATUS */}
            <div className="flex flex-wrap items-start gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <UserRound size={19} />
              </div>

              <div>
                <p className="text-sm font-black text-slate-950">
                  {requirement.userName}
                </p>

                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Star
                    size={13}
                    className="fill-amber-400 text-amber-400"
                  />

                  <strong>
                    {requirement.userRating}
                  </strong>

                  <span>
                    (
                    {requirement.userReviewCount}{" "}
                    reviews)
                  </span>
                </div>
              </div>

              {/* RIGHT BADGES */}
              <div className="ml-auto flex flex-wrap items-center justify-end gap-2">

                {/* INQUIRY BADGE */}
                <div
                  title={`${requirement.queryCount} ${inquiryLabel} Submitted`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700"
                >
                  <MessageSquareText
                    size={16}
                    className="text-blue-600"
                  />

                  {requirement.queryCount}
                </div>

                <StatusBadge active={active} />

                {requirement.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                    <BadgeCheck size={14} />
                    Verified Requirement
                  </span>
                )}

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800">
                  {requirement.requirementType ===
                  "service"
                    ? "Service"
                    : "Product"}
                </span>
              </div>
            </div>

            {/* =====================
                TITLE
            ====================== */}
            <h2 className="mt-3 text-xl font-black leading-snug text-slate-950 sm:text-2xl">
              {requirement.title}
            </h2>

            {/* =====================
                HIGHLIGHT CHIPS
            ====================== */}
            {(requirement.budget ||
              showSummaryField) && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {requirement.budget && (
                  <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-slate-800">
                    Budget: {requirement.budget}
                  </span>
                )}

                {showSummaryField && (
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-800">
                    {summaryField.label}:{" "}
                    {summaryField.value}
                  </span>
                )}
              </div>
            )}

            {/* =====================
                LOCATION / CATEGORY /
                DATE
            ====================== */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm">

              {requirement.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={16} />
                  {requirement.location}
                </span>
              )}

              {requirement.category && (
                <>
                  <span className="hidden text-slate-300 sm:inline">
                    •
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <PackageSearch size={16} />
                    {requirement.category}
                  </span>
                </>
              )}

              {requirement.createdAt && (
                <>
                  <span className="hidden text-slate-300 sm:inline">
                    •
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={16} />

                    {new Date(
                      requirement.createdAt,
                    ).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </>
              )}
            </div>

            {/* =====================
                SHORT DESCRIPTION
            ====================== */}
            {requirement.description &&
              requirement.description.trim().toLowerCase() !==
                requirement.category?.trim().toLowerCase() && (
                <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {requirement.description}
                </p>
              )}
          </div>
        </div>
      </div>

      {/* =========================
          FOOTER ACTION BAR
      ========================== */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">

        <button
          type="button"
          onClick={onView}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
        >
          View Details
        </button>

        {!active ? (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-bold text-slate-500"
          >
            Requirement Closed
          </button>
        ) : (
          <button
            type="button"
            disabled={!canSendInquiry}
            onClick={
              canSendInquiry
                ? onInquiry
                : undefined
            }
            title={
              buyerLoggedIn
                ? "Only sellers can send inquiries."
                : "Send Inquiry"
            }
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              canSendInquiry
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            <Send size={16} />
            Send Inquiry
          </button>
        )}
      </div>
    </article>
  );
}
